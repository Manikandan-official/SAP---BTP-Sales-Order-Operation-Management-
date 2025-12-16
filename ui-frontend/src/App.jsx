import { useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import AddSOModal from "./components/AddSOModal";

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
      { skuName: "Screen", unitRate: 100, qty: 10 },
      { skuName: "Battery", unitRate: 50, qty: 10 }
    ]
  }
];

export default function App() {
  const [allOrders, setAllOrders] = useState(INITIAL_ORDERS);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [lastCreatedChild, setLastCreatedChild] = useState(null);

  /* ================= SORT STATE ================= */
  const [sortByStage, setSortByStage] = useState({
    SalesSupport: { field: "expectedShipDate", dir: "asc" },
    Procurement: { field: "expectedShipDate", dir: "asc" },
    RMInventory: { field: "expectedShipDate", dir: "asc" },
    Quality: { field: "lastActivity", dir: "asc" },
    FGInventory: { field: "lastActivity", dir: "asc" }
  });

  /* ================= STAGE MOVE ================= */
  const handleMove = (orderID, toStage) => {
    setAllOrders(prev =>
      prev.map(o =>
        o.ID === orderID
          ? { ...o, currentStage: toStage, lastActivity: new Date().toISOString() }
          : o
      )
    );
  };

  /* ================= STAGE ACTIONS ================= */
  const updateOrder = (orderID, updater) => {
    setAllOrders(prev =>
      prev.map(o => (o.ID === orderID ? updater(o) : o))
    );
  };

  const markRMOrdered = (orderID) =>
    updateOrder(orderID, o => ({
      ...o,
      items: o.items.map(i => ({ ...i, materialOrdered: true }))
    }));

  const markRMReceived = (orderID) =>
    updateOrder(orderID, o => ({
      ...o,
      items: o.items.map(i => ({ ...i, materialReceived: true }))
    }));

  const approveQA = (orderID) =>
    updateOrder(orderID, o => ({
      ...o,
      items: o.items.map(i => ({ ...i, qaApproved: true }))
    }));

  const createInvoice = (orderID) =>
    updateOrder(orderID, o => ({
      ...o,
      invoiced: true
    }));

  /* ================= ADD CHILD SO ================= */
  const handleCreateChildSO = (payload) => {
    const newChild = {
      ID: crypto.randomUUID(),
      parentSO_ID: payload.parentSO_ID,
      customer_ID: payload.customer_ID,
      orderNo: payload.orderNo,
      currentStage: "SalesSupport",
      expectedShipDate: payload.expectedShipDate,
      plant: payload.plant,
      lastActivity: new Date().toISOString(),
      items: payload.items
    };

    setAllOrders(prev => [...prev, newChild]);
    setLastCreatedChild(newChild);
    setOpenAdd(false);
  };

  /* ================= BOARD GROUPING ================= */
  const ordersByStage = useMemo(() => {
    const buckets = {
      SalesSupport: [],
      Procurement: [],
      RMInventory: [],
      Quality: [],
      FGInventory: []
    };

    allOrders.forEach(o => {
      if (!o.parentSO_ID) return;
      buckets[o.currentStage || "SalesSupport"].push(o);
    });

    return buckets;
  }, [allOrders]);

  const masters = allOrders.filter(o => !o.parentSO_ID);

  return (
    <div>
      <Topbar onAdd={() => setOpenAdd(true)} />

      <div style={{ display: "flex" }}>
        <Sidebar
          customers={mockCustomers}
          orders={allOrders}
          selectedCustomer={null}
          selectedMaster={selectedMaster}
          lastCreatedChild={lastCreatedChild}
          onCustomerSelect={() => {}}
          onMasterSelect={setSelectedMaster}
        />

        <main style={{ padding: 16 }}>
          <Board
            stages={STAGES}
            ordersByStage={ordersByStage}
            sortByStage={sortByStage}
            onSortChange={setSortByStage}
            onMove={handleMove}
            onStageAction={{
              markRMOrdered,
              markRMReceived,
              approveQA,
              createInvoice
            }}
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
