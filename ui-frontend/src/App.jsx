// src/App.jsx
import { useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import AddSOModal from "./components/AddSOModal";
import useOrders from "./hooks/useOrders";

/* =========================================================
   PIPELINE STAGES (UI CONFIG ONLY)
========================================================= */
const STAGES = [
  { id: "SalesSupport", title: "Sales Order" },
  { id: "Procurement", title: "Purchases" },
  { id: "RMInventory", title: "RM Inventory" },
  { id: "Quality", title: "Quality" },
  { id: "FGInventory", title: "FG Inventory" }
];

const STAGE_IDS = STAGES.map(s => s.id);

/* =========================================================
   APP (FRONTEND COMPLETE, BACKEND-AGNOSTIC)
========================================================= */
export default function App() {
  const {
    orders = [],
    customers = [],
    loading,
    error,
    moveToStage,
    createChildSO
  } = useOrders();

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  /* =========================================================
     CHILD SOs → PIPELINE BOARD
     (Only executable units appear here)
  ========================================================= */
  const ordersByStage = useMemo(() => {
    const buckets = {
      SalesSupport: [],
      Procurement: [],
      RMInventory: [],
      Quality: [],
      FGInventory: []
    };

    orders.forEach(order => {
      // Master SOs never appear on the board
      if (!order.parentSO_ID) return;

      const stage = STAGE_IDS.includes(order.currentStage)
        ? order.currentStage
        : "SalesSupport";

      buckets[stage].push(order);
    });

    return buckets;
  }, [orders]);

  /* =========================================================
     MASTER SOs (CONTEXT / CONTAINER ONLY)
  ========================================================= */
  const masterOrders = useMemo(
    () => orders.filter(o => !o.parentSO_ID),
    [orders]
  );

  /* =========================================================
     EVENT HANDLERS
     (Hook owns the data, App just delegates)
  ========================================================= */
  const handleMove = (orderID, toStage) => {
    moveToStage?.(orderID, toStage);
  };

  const handleCreateChildSO = payload => {
    createChildSO?.(payload);
    setOpenAdd(false);
  };

  /* =========================================================
     RENDER STATES
     (Keep lightweight – mock hooks may be synchronous)
  ========================================================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading Sales Orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="h-screen flex flex-col">
      <Topbar
        onAdd={() => {
          if (!selectedMaster) {
            window.alert("Please select a Master Sales Order first");
            return;
          }
          setOpenAdd(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          customers={customers}
          orders={orders}
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
          />
        </main>
      </div>

      {openAdd && (
        <AddSOModal
          open
          masters={masterOrders}
          selectedMaster={selectedMaster}
          onClose={() => setOpenAdd(false)}
          onCreate={handleCreateChildSO}
        />
      )}
    </div>
  );
}
