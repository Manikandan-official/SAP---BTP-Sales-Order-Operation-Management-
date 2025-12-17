// src/App.jsx
import { useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import AddSOModal from "./components/AddSOModal";

/* =========================================================
   CONSTANTS
========================================================= */

const STAGES = [
  { id: "SalesSupport", title: "Sales Order" },
  { id: "Procurement", title: "Purchases" },
  { id: "RMInventory", title: "RM Inventory" },
  { id: "Quality", title: "Quality" },
  { id: "FGInventory", title: "FG Inventory" }
];

const mockCustomers = [{ ID: "C1", name: "Customer 1" }];

const INITIAL_ORDERS = [
  {
    ID: "M1",
    orderNo: "SO5678",
    customer_ID: "C1",
    currentStage: "SalesSupport",
    items: [
      { skuName: "Screen", qty: 10 },
      { skuName: "Battery", qty: 10 }
    ]
  }
];

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [allOrders, setAllOrders] = useState(INITIAL_ORDERS);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  /* =========================================================
     CORE HELPERS (SINGLE SOURCE OF TRUTH)
  ========================================================= */

  const updateOrder = (orderID, updater) => {
    setAllOrders(prev =>
      prev.map(o => (o.ID === orderID ? updater(o) : o))
    );
  };

  const updateAllItems = (order, updater) => ({
    ...order,
    items: Array.isArray(order.items)
      ? order.items.map(updater)
      : []
  });

  const nextStage = (stage) => {
    switch (stage) {
      case "SalesSupport":
        return "Procurement";
      case "Procurement":
        return "RMInventory";
      case "RMInventory":
        return "Quality";
      case "Quality":
        return "FGInventory";
      default:
        return stage;
    }
  };

  /* =========================================================
     STAGE ACTIONS (PHASE 2.1 — UI AUTHORITATIVE)
     👉 Buttons call these
     👉 State updates immediately
     👉 Easy swap with CAP later
  ========================================================= */

  const stageActions = {
    markRMOrdered: (orderID) =>
      updateOrder(orderID, order => ({
        ...updateAllItems(order, i => ({
          ...i,
          materialOrdered: true
        })),
        currentStage: nextStage(order.currentStage)
      })),

    markRMReceived: (orderID) =>
      updateOrder(orderID, order => ({
        ...updateAllItems(order, i => ({
          ...i,
          materialReceived: true
        })),
        currentStage: nextStage(order.currentStage)
      })),

    approveQA: (orderID) =>
      updateOrder(orderID, order => ({
        ...updateAllItems(order, i => ({
          ...i,
          qaApproved: true
        })),
        currentStage: nextStage(order.currentStage)
      })),

    createInvoice: (orderID) =>
      updateOrder(orderID, order => ({
        ...order,
        invoiced: true
      }))
  };

  /* =========================================================
     DRAG & DROP MOVE (UI ONLY)
  ========================================================= */

  const handleMove = (orderID, toStage) => {
    updateOrder(orderID, order => ({
      ...order,
      currentStage: toStage
    }));
  };

  /* =========================================================
     ADD CHILD SO
  ========================================================= */

  const handleCreateChildSO = (payload) => {
    const child = {
      ID: crypto.randomUUID(),
      parentSO_ID: payload.parentSO_ID,
      customer_ID: payload.customer_ID,
      orderNo: payload.orderNo,
      currentStage: "SalesSupport",
      expectedShipDate: payload.expectedShipDate,
      plant: payload.plant,
      items: payload.items.map(i => ({
        ...i,
        materialOrdered: false,
        materialReceived: false,
        qaApproved: false,
        fgReady: false
      }))
    };

    setAllOrders(prev => [...prev, child]);
    setOpenAdd(false);
  };

  /* =========================================================
     BOARD GROUPING
  ========================================================= */

  const ordersByStage = useMemo(() => {
    const buckets = {
      SalesSupport: [],
      Procurement: [],
      RMInventory: [],
      Quality: [],
      FGInventory: []
    };

    allOrders.forEach(o => {
      if (!o.parentSO_ID) return; // master SOs not on board
      buckets[o.currentStage || "SalesSupport"].push(o);
    });

    return buckets;
  }, [allOrders]);

  const masters = allOrders.filter(o => !o.parentSO_ID);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="h-screen flex flex-col">
      <Topbar onAdd={() => setOpenAdd(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          customers={mockCustomers}
          orders={allOrders}
          selectedCustomer={null}
          selectedMaster={selectedMaster}
          onCustomerSelect={() => {}}
          onMasterSelect={setSelectedMaster}
        />

        <main className="flex-1 p-6 overflow-auto">
          <Board
  stages={STAGES}
  ordersByStage={ordersByStage}
  onMove={handleMove}
  onOpenDetail={() => {}}
  onStageAction={stageActions}   // ✅ SINGULAR
/>

        </main>
      </div>

      {openAdd && (
        <AddSOModal
          open
          onClose={() => setOpenAdd(false)}
          onCreate={handleCreateChildSO}
          masterSO={masters[0]}
        />
      )}
    </div>
  );
}
