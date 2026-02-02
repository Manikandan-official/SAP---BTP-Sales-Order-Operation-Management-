const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

  const {
  SalesOrders,
  SalesOrderItems,
  Customers,
  OrderStages,
  ERPFileLogs
} = this.entities;


  // ============================================================================
// 1. UPLOAD MASTER SO
// ============================================================================
  this.on('uploadMasterSO', async (req) => {
    try {
      const { fileName, rows } = req.data;

      if (!fileName || !Array.isArray(rows) || rows.length === 0)
        return req.error(400, "fileName and rows are required");

      const now = new Date();
      const groupMap = {};

      // group by orderNo
      for (const r of rows) {
        if (!r.orderNo) continue;
        if (!groupMap[r.orderNo]) groupMap[r.orderNo] = [];
        groupMap[r.orderNo].push(r);
      }

      for (const orderNo of Object.keys(groupMap)) {
        const group = groupMap[orderNo];
        const custName = group[0].customerName;

        // ensure customer exists
        let cust = await SELECT.one.from(Customers).where({ name: custName });
        if (!cust) {
          cust = await INSERT.into(Customers).entries({ name: custName });
          if (Array.isArray(cust)) cust = cust[0];
        }

        // create master SO
        const result = await INSERT.into(SalesOrders).entries({
          orderNo,
          parentSO_ID: null,
          customer_ID: cust.ID,
          status: 'Created',
          priority: 0,
          currentStage: 'SalesSupport',
          lastActivity: now,
          remarks: `Imported from ${fileName}`
        });

        const master = Array.isArray(result) ? result[0] : result;
        const masterID = master.ID;

        // insert items
        for (const r of group) {
          await INSERT.into(SalesOrderItems).entries({
            parentSO_ID: masterID,
            skuName: r.skuName,
            skuCode: r.skuCode,
            qty: r.qty,
            unitRate: r.unitRate
          });
        }

        // log file
        await INSERT.into(ERPFileLogs).entries({
          fileName,
          uploadedAt: now,
          processedAt: new Date(),
          status: 'Processed',
          remarks: `Imported ${group.length} lines for ${orderNo}`
        });
      }

      return `Imported ${Object.keys(groupMap).length} orders`;

    } catch (e) {
      console.error("uploadMasterSO error:", e);
      return req.error(500, "Internal error in uploadMasterSO");
    }
  });


  // ============================================================================
  // 2. CREATE CHILD SO
  // ============================================================================
  this.on('createChildSO', async (req) => {
    try {
      let { parentSO_ID, skuIDs, expectedShipDate, plant } = req.data;

      if (!parentSO_ID) return req.error(400, 'parentSO_ID is required');
      if (!skuIDs) return req.error(400, 'skuIDs is required');

      // normalize skuIDs → array
      if (typeof skuIDs === 'string') {
        try {
          const parsed = JSON.parse(skuIDs);
          if (Array.isArray(parsed)) skuIDs = parsed;
        } catch {
          skuIDs = skuIDs.replace(/^\[|\]$/g, '')
                         .split(',')
                         .map(s => s.trim());
        }
      }

      // load parent
      const parent = await SELECT.one.from(SalesOrders).where({ ID: parentSO_ID });
      if (!parent) return req.error(404, "Parent Sales Order not found");

      // count existing children
      const children = await SELECT.from(SalesOrders).where({ parentSO_ID });
      const childIndex = (children.length || 0) + 1;

      const orderNo = `${parent.orderNo}/${childIndex}`;

      // insert child SO
      const inserted = await INSERT.into(SalesOrders).entries({
        orderNo,
        parentSO_ID,
        customer_ID: parent.customer_ID,
        expectedShipDate: expectedShipDate || parent.expectedShipDate,
        plant: plant || parent.plant,
        status: "Created",
        currentStage: "SalesSupport",
        priority: parent.priority || 1,
        lastActivity: new Date()
      });

      const child = Array.isArray(inserted) ? inserted[0] : inserted;
      const childID = child.ID;

      // reassign items
      for (const skuId of skuIDs) {
        await UPDATE(SalesOrderItems)
          .set({ parentSO_ID: childID })
          .where({ ID: skuId });
      }

      // fetch child details
      const childDetails = await SELECT.one.from(SalesOrders).where({ ID: childID });

      // stable return (DO NOT CHANGE)
      return {
        message: "Child Sales Order created successfully",
        childSO: childDetails
      };

    } catch (e) {
      console.error("createChildSO error:", e);
      return req.error(500, "Internal error in createChildSO");
    }
  });



  // ============================================================================
  // 3. ASSIGN TO CALENDAR
  // ============================================================================
  this.on('assignToCalendar', async (req) => {
    try {
      const { orderID, expectedShipDate } = req.data;

      await UPDATE(SalesOrders)
        .set({ expectedShipDate, lastActivity: new Date() })
        .where({ ID: orderID });

      return SELECT.one.from(SalesOrders).where({ ID: orderID });

    } catch (e) {
      console.error("assignToCalendar error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 4. ALLOCATE TO PLANT
  // ============================================================================
  this.on('allocateToPlant', async (req) => {
    try {
      const { orderID, plant } = req.data;

      await UPDATE(SalesOrders)
        .set({ plant, lastActivity: new Date() })
        .where({ ID: orderID });

      return SELECT.one.from(SalesOrders).where({ ID: orderID });

    } catch (e) {
      console.error("allocateToPlant error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 5. CHANGE PRIORITY
  // ============================================================================
  this.on('changePriority', async (req) => {
    try {
      const { orderID, newPriority } = req.data;

      await UPDATE(SalesOrders)
        .set({ priority: newPriority, lastActivity: new Date() })
        .where({ ID: orderID });

      return SELECT.one.from(SalesOrders).where({ ID: orderID });

    } catch (e) {
      console.error("changePriority error:", e);
      return req.error(500, "Internal error");
    }
  });



// ============================================================================
// 6. REQUEST STAGE TRANSITION (AUTHORITATIVE WORKFLOW)
// ============================================================================
this.on('requestStageTransition', async (req) => {
  try {
    const { orderID } = req.data;
    if (!orderID) return req.error(400, "orderID is required");

    const so = await SELECT.one.from(SalesOrders).where({ ID: orderID });
    if (!so) return req.error(404, "Sales Order not found");

    const items = await SELECT.from(SalesOrderItems).where({
      parentSO_ID: orderID
    });

    const currentStage = so.currentStage || "SalesSupport";
    const nextStage = WORKFLOW[currentStage];

    if (!nextStage) {
      return req.error(
        400,
        `Sales Order already in final stage (${currentStage})`
      );
    }
    
    if (!so.parentSO_ID) {
  return req.error(
    400,
    "Master Sales Orders cannot move through workflow stages"
  );
}

    // ===================== VALIDATIONS =====================

    if (currentStage === "SalesSupport") {
      if (!so.plant || !so.expectedShipDate) {
        return req.error(
          400,
          "Plant and Expected Ship Date must be assigned before moving to Procurement"
        );
      }
    }

    if (currentStage === "Procurement") {
      if (items.some(i => !i.materialOrdered)) {
        return req.error(
          400,
          "All raw materials must be ordered before moving to RM Inventory"
        );
      }
    }

    if (currentStage === "RMInventory") {
      if (items.some(i => !i.materialReceived)) {
        return req.error(
          400,
          "All raw materials must be received before moving to Quality"
        );
      }
    }

    if (currentStage === "Quality") {
      if (items.some(i => !i.qaApproved)) {
        return req.error(
          400,
          "QA approval required before moving to FG Inventory"
        );
      }
    }

    // ===================== UPDATE =====================

    await UPDATE(SalesOrders)
      .set({
        currentStage: nextStage,
        lastActivity: new Date()
      })
      .where({ ID: orderID });

    await INSERT.into(OrderStages).entries({
      order_ID: orderID,
      stageName: nextStage,
      enteredAt: new Date()
    });

    return {
      message: `Moved from ${currentStage} → ${nextStage}`,
      currentStage: nextStage
    };

  } catch (e) {
    console.error("requestStageTransition error:", e);
    return req.error(500, "Internal error");
  }
});

  // ============================================================================
  // 7. MARK MATERIAL ORDERED
  // ============================================================================
  this.on('markMaterialOrdered', async (req) => {
    try {
      const { itemID, bomRef, expectedDate } = req.data;

      await UPDATE(SalesOrderItems)
        .set({
          materialOrdered: true,
          bomOrderRef: bomRef,
          bomExpectedDate: expectedDate,
          lastUpdated: new Date()
        }).where({ ID: itemID });

      return { message: "Material ordered", itemID };

    } catch (e) {
      console.error("markMaterialOrdered error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 8. MARK MATERIAL RECEIVED
  // ============================================================================
  this.on('markMaterialReceived', async (req) => {
    try {
      const { itemID, receivedDate } = req.data;

      const item = await SELECT.one.from(SalesOrderItems).where({ ID: itemID });

      await UPDATE(SalesOrderItems)
        .set({
          materialReceived: true,
          receivedDate,
          lastUpdated: new Date()
        }).where({ ID: itemID });

      await UPDATE(SalesOrders)
        .set({ lastActivity: new Date() })
        .where({ ID: item.parentSO_ID });

      return { message: "Material received", itemID };

    } catch (e) {
      console.error("markMaterialReceived error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 9. QA APPROVE
  // ============================================================================
  this.on('qaApprove', async (req) => {
    try {
      const { itemID, approved } = req.data;

      await UPDATE(SalesOrderItems)
        .set({
          qaApproved: approved,
          lastUpdated: new Date()
        }).where({ ID: itemID });

      return { message: `QA ${approved ? "approved" : "rejected"}`, itemID };

    } catch (e) {
      console.error("qaApprove error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 10. MARK FG READY
  // ============================================================================
  this.on('markFGReady', async (req) => {
    try {
      const { orderID } = req.data;

      const items = await SELECT.from(SalesOrderItems).where({ parentSO_ID: orderID });
      if (items.some(i => !i.qaApproved))
        return req.error(400, "QA incomplete");

      for (const it of items) {
        await UPDATE(SalesOrderItems).set({ fgReady: true }).where({ ID: it.ID });
      }

      await UPDATE(SalesOrders)
        .set({ status: "ReadyForFG", lastActivity: new Date() })
        .where({ ID: orderID });

      return { message: "FG Ready", orderID };

    } catch (e) {
      console.error("markFGReady error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 11. CREATE INVOICE
  // ============================================================================
  this.on('createInvoice', async (req) => {
    try {
      const { orderID } = req.data;

      const items = await SELECT.from(SalesOrderItems).where({ parentSO_ID: orderID });
      if (items.some(i => !i.fgReady))
        return req.error(400, "FG not ready");

      for (const it of items) {
        await UPDATE(SalesOrderItems).set({ invoiceCreated: true }).where({ ID: it.ID });
      }

      await UPDATE(SalesOrders)
        .set({ status: "Invoiced", lastActivity: new Date() })
        .where({ ID: orderID });

      return { message: "Invoice created", invoiceId: `INV-${Date.now()}` };

    } catch (e) {
      console.error("createInvoice error:", e);
      return req.error(500, "Internal error");
    }
  });



  // ============================================================================
  // 12. UPDATE STAGE COLORS
  // ============================================================================
  this.on('updateStageColors', async (req) => {
    try {
      const orders = await SELECT.from(SalesOrders);
      const now = new Date();

      for (const so of orders) {
        let color = "Green";

        if (so.expectedShipDate) {
          const days = Math.ceil((new Date(so.expectedShipDate) - now) / 86400000);
          if (days < 0) color = "Red";
          else if (days <= 3) color = "Amber";
        }

        await INSERT.into(OrderStages).entries({
          order_ID: so.ID,
          stageName: so.currentStage,
          enteredAt: new Date(),
          statusColor: color
        });
      }

      return "Stage colors updated";

    } catch (e) {
      console.error("updateStageColors error:", e);
      return req.error(500, "Internal error");
    }
  });

  // ============================================================================
// RESET ALL DATA (Stable Test Environment Reset)
// ============================================================================
  this.on('resetAll', async (req) => {
    try {
      console.log("♻ Resetting full test dataset...");

      // 1. DELETE TABLES IN SAFE ORDER
      await DELETE.from(OrderStages);
      await DELETE.from(SalesOrderItems);
      await DELETE.from(SalesOrders);
      await DELETE.from(Customers);
      await DELETE.from(ERPFileLogs);

      // 2. REBUILD BASE CUSTOMERS
      const c1 = await INSERT.into(Customers).entries({
        ID: "C1",
        name: "Customer 1",
        email: "c1@test.com",
        phone: "99999",
        address: "TN"
      });

      const c2 = await INSERT.into(Customers).entries({
        ID: "C2",
        name: "Customer 2",
        email: "c2@test.com",
        phone: "88888",
        address: "KA"
      });

      // 3. REBUILD MASTER SALES ORDERS
      await INSERT.into(SalesOrders).entries([
        {
          ID: "M1",
          orderNo: "SO1001",
          parentSO_ID: null,
          customer_ID: "C1",
          expectedShipDate: "2025-12-20",
          plant: "Plant-A",
          status: "Created",
          priority: 1,
          currentStage: "SalesSupport",
          lastActivity: new Date(),
          remarks: "Master Order 1"
        },
        {
          ID: "M2",
          orderNo: "SO1002",
          parentSO_ID: null,
          customer_ID: "C2",
          expectedShipDate: "2025-12-25",
          plant: "Plant-B",
          status: "Created",
          priority: 1,
          currentStage: "SalesSupport",
          lastActivity: new Date(),
          remarks: "Master Order 2"
        }
      ]);

      // 4. REBUILD BASE SKU ITEMS
      await INSERT.into(SalesOrderItems).entries([
        // M1 SKUs
        {
          ID: "I1",
          parentSO_ID: "M1",
          skuName: "Phone A",
          skuCode: "PA1",
          qty: 2,
          unitRate: 10000
        },
        {
          ID: "I2",
          parentSO_ID: "M1",
          skuName: "Phone B",
          skuCode: "PB1",
          qty: 1,
          unitRate: 12000
        },

        // M2 SKUs
        {
          ID: "I3",
          parentSO_ID: "M2",
          skuName: "Phone C",
          skuCode: "PC1",
          qty: 3,
          unitRate: 15000
        },
        {
          ID: "I4",
          parentSO_ID: "M2",
          skuName: "Phone D",
          skuCode: "PD1",
          qty: 1,
          unitRate: 18000
        }
      ]);

      return {
        message: "Reset successful",
        details: "Master SO, Customers, and SKUs restored to base state"
      };

    } catch (err) {
      console.error("resetAll error:", err);
      return req.error(500, "Internal error during resetAll");
    }
  });

});