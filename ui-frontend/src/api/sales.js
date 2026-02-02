// src/api/sales.js
import { apiGet, apiPost } from "./client";

/* =========================================================
   READ APIs (OData v4)
========================================================= */

export const fetchOrders = async () => {
  const res = await apiGet(
    "/odata/v4/sales/SalesOrders?$expand=items"
  );
  return res?.value ?? [];
};

export const fetchCustomers = async () => {
  const res = await apiGet(
    "/odata/v4/sales/Customers"
  );
  return res?.value ?? [];
};

/* =========================================================
   ORDER-LEVEL STAGE ACTIONS (AUTHORITATIVE)
   UI → CAP → DB
========================================================= */

export const moveToStage = (orderID, stage) =>
  apiPost("/odata/v4/sales/moveToStage", { orderID, stage });

export const markRMOrdered = (orderID) =>
  apiPost("/odata/v4/sales/markRMOrdered", { orderID });

export const markRMReceived = (orderID) =>
  apiPost("/odata/v4/sales/markRMReceived", { orderID });

export const approveQA = (orderID) =>
  apiPost("/odata/v4/sales/approveQA", { orderID });

export const markFGReady = (orderID) =>
  apiPost("/odata/v4/sales/markFGReady", { orderID });

export const createInvoice = (orderID) =>
  apiPost("/odata/v4/sales/createInvoice", { orderID });

/* =========================================================
   CREATE APIs
========================================================= */

export const createChildSO = (payload) =>
  apiPost("/odata/v4/sales/createChildSO", payload);

export const createMasterSO = (payload) =>
  apiPost("/odata/v4/sales/uploadMasterSO", payload);
