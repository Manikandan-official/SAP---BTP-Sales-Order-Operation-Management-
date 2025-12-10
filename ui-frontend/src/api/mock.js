// mock data service (used by UI for offline testing)
export const STAGES = [
  { id: "SalesSupport", title: "Sales Support" },
  { id: "Procurement", title: "Procurement" },
  { id: "RMInventory", title: "RM Inventory" },
  { id: "Quality", title: "Quality" },
  { id: "FGInventory", title: "FG Inventory" }
];

export const CUSTOMERS = [
  { id: "C1", name: "Customer 1" },
  { id: "C2", name: "Customer 2" },
  { id: "C3", name: "Customer 3" }
];

let ORDERS = [
  { id: "M1", orderNo: "SO1001", title: "SO1001 - Phone A", customer: "Customer 1", currentStage: "SalesSupport", eta: "2025-12-20" },
  { id: "M2", orderNo: "SO1002", title: "SO1002 - Phone B", customer: "Customer 2", currentStage: "SalesSupport", eta: "2025-12-22" },
  { id: "M3", orderNo: "SO1003", title: "SO1003 - Phone C", customer: "Customer 1", currentStage: "Procurement", eta: "2025-12-25" },
  { id: "M4", orderNo: "SO1004", title: "SO1004 - Phone D", customer: "Customer 3", currentStage: "RMInventory", eta: "2025-12-27" },
  { id: "M5", orderNo: "M5", title: "SO1005 - Accessory", customer: "Customer 2", currentStage: "Quality", eta: "2025-12-28" }
];

export async function fetchInitial() {
  await sleep(120);
  return { stages: STAGES, customers: CUSTOMERS, orders: ORDERS.slice() };
}

export async function addOrder(newOrder) {
  ORDERS = [newOrder, ...ORDERS];
  await sleep(80);
  return newOrder;
}

export async function moveOrder(id, toStage) {
  ORDERS = ORDERS.map(o => (o.id === id ? { ...o, currentStage: toStage } : o));
  await sleep(80);
  return ORDERS.find(o => o.id === id);
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
