// src/api/sales.js
import { apiGet, apiPost } from "./client";

/* =========================================================
   STAGE ACTIONS (CAP ACTIONS)
   UI calls these → backend enforces rules
========================================================= */

export const markRMOrdered = (orderID) =>
  apiPost("/odata/v4/sales/markRMOrdered", { orderID });

export const markRMReceived = (orderID) =>
  apiPost("/odata/v4/sales/markRMReceived", { orderID });

export const approveQA = (orderID) =>
  apiPost("/odata/v4/sales/approveQA", { orderID });

export const createInvoice = (orderID) =>
  apiPost("/odata/v4/sales/createInvoice", { orderID });

export const moveToStage = (orderID, stage) =>
  apiPost("/odata/v4/sales/moveToStage", { orderID, stage });

/* =========================================================
   READ APIs (OData v4)
========================================================= */

export async function fetchOrders() {
  const res = await apiGet(
    "/odata/v4/sales/SalesOrders?$expand=items"
  );
  return res?.value ?? [];
}

export async function fetchCustomers() {
  const res = await apiGet(
    "/odata/v4/sales/Customers"
  );
  return res?.value ?? [];
}

/* =========================================================
   CREATE APIs
========================================================= */

export const createChildSO = (payload) =>
  apiPost("/odata/v4/sales/createChildSO", payload);

export const createMasterSO = (payload) =>
  apiPost("/odata/v4/sales/uploadMasterSO", payload);
