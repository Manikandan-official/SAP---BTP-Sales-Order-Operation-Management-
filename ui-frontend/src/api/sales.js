import api from "./client";

export async function fetchOrders() {
  const res = await api.get("/SalesOrders?$expand=items");
  return res.value || res; 
}

export async function fetchCustomers() {
  const res = await api.get("/Customers");
  return res.value || res;
}

export async function moveToStage(orderID, stage) {
  return api.post("/moveToStage", { orderID, stage });
}

export async function createChildSO(payload) {
  return api.post("/createChildSO", payload);
}

export async function createMasterSO(payload) {
  return api.post("/uploadMasterSO", payload);
}
