import React, { useCallback, useEffect, useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import AddSOModal from "./components/AddSOModal";
import sampleData from "./data/sampleData";
import "./index.css";

/* ------------------------------------------
   Column Stages
--------------------------------------------*/
const STAGES = [
  { id: "SalesSupport", title: "Sales Order" },
  { id: "Procurement", title: "Purchases" },
  { id: "RMInventory", title: "RM Inventory" },
  { id: "Quality", title: "Quality" },
  { id: "FGInventory", title: "FG Inventory" }
];

/* ------------------------------------------
   SO Number Helpers
--------------------------------------------*/
const isValidSOFormat = so => /^SO\d{4}(\/\d+)?$/.test(so);

const generateNextMasterSO = allOrders => {
  const masters = allOrders
    .map(o => String(o.orderNo))
    .filter(s => /^SO\d{4}$/.test(s))
    .map(s => Number(s.replace("SO", "")));

  const next = masters.length ? Math.max(...masters) + 1 : 1001;
  return "SO" + String(next).padStart(4, "0");
};

const generateChildSO = (masterOrderNo, allOrders) => {
  const children = allOrders.filter(o =>
    o.orderNo.startsWith(masterOrderNo + "/")
  );
  return `${masterOrderNo}/${children.length + 1}`;
};

/* ------------------------------------------
   MAIN APP COMPONENT
--------------------------------------------*/
export default function App() {
  const [allOrders, setAllOrders] = useState([]);
  const [ordersByStage, setOrdersByStage] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  /* ------------------------------------------
     Normalize sample data on load
  --------------------------------------------*/
  const normalizeInput = useCallback(raw => {
    return raw.map((o, idx) => ({
      ID: o.ID || `SO_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      orderNo: o.orderNo || `SO${1000 + idx}`,
      customerName: o.customer?.name || o.customerName || "Unknown",
      customer_ID: o.customer?.ID || o.customer_ID || (o.customer?.name || o.customerName),
      parentSO_ID: o.parentSO_ID || null,
      expectedShipDate: o.expectedShipDate || null,
      currentStage: o.currentStage || "SalesSupport",
      priority: Number(o.priority || 0),
      remarks: o.remarks || ""
    }));
  }, []);

  /* ------------------------------------------
     SAFE buildBuckets() — Shows BOTH masters + children
  --------------------------------------------*/
  const buildBuckets = useCallback(list => {
    const buckets = {};
    STAGES.forEach(s => (buckets[s.id] = []));

    const byId = {};
    list.forEach(o => {
      byId[o.ID] = { ...o, children: [] };
    });

    // attach children
    Object.values(byId).forEach(o => {
      if (o.parentSO_ID && byId[o.parentSO_ID]) {
        byId[o.parentSO_ID].children.push(o);
      }
    });

    // push ALL orders (not just masters)
    Object.values(byId).forEach(order => {
      const stage = STAGES.find(s => s.id === order.currentStage)
        ? order.currentStage
        : "SalesSupport";
      buckets[stage].push(order);
    });

    return buckets;
  }, []);

  /* ------------------------------------------
     Load sample data
  --------------------------------------------*/
  useEffect(() => {
    const raw = Array.isArray(sampleData) ? sampleData : sampleData.value || [];
    const normalized = normalizeInput(raw);
    setAllOrders(normalized);
    setOrdersByStage(buildBuckets(normalized));
    setLoading(false);
  }, [normalizeInput, buildBuckets]);

  /* ------------------------------------------
     Customers List (ALWAYS AVAILABLE)
--------------------------------------------*/
  const customers = useMemo(() => {
    const map = new Map();
    sampleData.forEach(o => {
      const name = o.customer?.name || o.customerName;
      const id = name;
      if (!map.has(id)) map.set(id, { id, name });
    });
    return [...map.values()];
  }, []);

  /* ------------------------------------------
     Re-filter when selecting customer or master
  --------------------------------------------*/
  useEffect(() => {
    let filtered = [...allOrders];

    if (selectedCustomer)
      filtered = filtered.filter(o => o.customer_ID === selectedCustomer);

    if (selectedMaster)
      filtered = filtered.filter(
        o => o.ID === selectedMaster || o.parentSO_ID === selectedMaster
      );

    setOrdersByStage(buildBuckets(filtered));
  }, [allOrders, selectedCustomer, selectedMaster, buildBuckets]);

  /* ------------------------------------------
     ADD NEW SALES ORDER
  --------------------------------------------*/
  const addNewSO = payload => {
    let orderNo = payload.orderNo?.trim() || "";
    const customerName = payload.customer;

    const customer_ID = customers.find(c => c.name === customerName)?.id || customerName;

    if (!payload.parentSO_ID) {
      if (!isValidSOFormat(orderNo))
        orderNo = generateNextMasterSO(allOrders);
    } else {
      const parent = allOrders.find(o => o.ID === payload.parentSO_ID);
      if (!parent) orderNo = generateNextMasterSO(allOrders);
      else orderNo = generateChildSO(parent.orderNo, allOrders);
    }

    const newSO = {
      ID: "SO_" + crypto.randomUUID(),
      orderNo,
      customerName,
      customer_ID,
      parentSO_ID: payload.parentSO_ID || null,
      expectedShipDate: payload.expectedShipDate || null,
      currentStage: payload.stage || "SalesSupport",
      priority: Number(payload.priority || 0),
      remarks: payload.remarks || ""
    };

    setAllOrders(prev => {
      const updated = [...prev, newSO];
      setOrdersByStage(buildBuckets(updated));
      return updated;
    });

    setOpenModal(false);
  };

  /* ------------------------------------------
     Drag Handler
  --------------------------------------------*/
  const handleMove = (orderID, toStage) => {
    setAllOrders(prev =>
      prev.map(o =>
        o.ID === orderID ? { ...o, currentStage: toStage } : o
      )
    );
  };

  /* ------------------------------------------
     Sidebar handlers
  --------------------------------------------*/
  const handleCustomerClick = id => {
    setSelectedCustomer(prev => (prev === id ? null : id));
    setSelectedMaster(null);
  };

  const handleMasterClick = id => {
    setSelectedMaster(prev => (prev === id ? null : id));
  };

  const stageCounts = STAGES.map(s => ({
    id: s.id,
    title: s.title,
    count: (ordersByStage[s.id] || []).length
  }));

  /* ------------------------------------------
     RENDER
  --------------------------------------------*/
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Topbar onAdd={() => setOpenModal(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          customers={customers}
          orders={allOrders}
          selectedCustomer={selectedCustomer}
          selectedMaster={selectedMaster}
          onCustomerSelect={handleCustomerClick}
          onMasterSelect={handleMasterClick}
        />

        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="text-gray-600">Loading sample orders…</div>
          ) : (
            <Board
              stages={STAGES}
              ordersByStage={ordersByStage}
              onMove={handleMove}
            />
          )}
        </main>
      </div>

      {openModal && (
        <AddSOModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreate={addNewSO}
          customers={customers}
          stageCounts={stageCounts}
          masters={allOrders.filter(o => !o.parentSO_ID)}
        />
      )}
    </div>
  );
}
