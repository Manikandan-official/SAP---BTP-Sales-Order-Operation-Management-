import { apiGet, apiPost } from "./client";

// Load Sales Orders + customer + stages
export async function getOrders() {
  return apiGet("/SalesOrders?$expand=customer,stages");
}

// Move stage using CAP action
export async function moveOrderStage(orderID, stage) {
  return apiPost("/moveToStage", { orderID, stage });
}
