import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";

/**
 * useOrders (FINAL – LOCKED)
 * =========================================================
 * ✔ Default export (React-safe)
 * ✔ OData v4 compatible
 * ✔ Normalized for UI consumption
 * ✔ No undefined crashes
 * ✔ Works with current App.jsx + Sidebar + Board
 * =========================================================
 */

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================================================
     CORE FETCH (SINGLE SOURCE OF TRUTH)
  ========================================================= */
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, customersRes] = await Promise.all([
        apiGet("/odata/v4/sales/SalesOrder"),
        apiGet("/odata/v4/sales/Customer")
      ]);

      /* =========================================================
         NORMALIZE ODATA → UI SHAPE
      ========================================================= */

      const normalizedCustomers = Array.isArray(customersRes?.value)
        ? customersRes.value.map(c => ({
            ...c,
            ID: c.ID,
            name: c.name
          }))
        : [];

      const normalizedOrders = Array.isArray(ordersRes?.value)
        ? ordersRes.value.map(o => ({
            ...o,
            ID: o.ID,
            customer_ID: o.customer_ID,
            parentSO_ID: o.parentSO_ID || null,
            currentStage: o.currentStage || "SalesSupport",
            items: Array.isArray(o.items) ? o.items : []
          }))
        : [];

      setCustomers(normalizedCustomers);
      setOrders(normalizedOrders);
    } catch (e) {
      console.error("useOrders → fetch failed", e);
      setError(e?.message || "Failed to load orders");
      setCustomers([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     LIFECYCLE
  ========================================================= */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* =========================================================
     ACTIONS (WRITE → REFRESH)
  ========================================================= */
  const moveToStage = async (orderID, stage) => {
    await apiPost("/odata/v4/sales/moveToStage", { orderID, stage });
    await fetchAll();
  };

  const createChildSO = async (payload) => {
    await apiPost("/odata/v4/sales/createChildSO", payload);
    await fetchAll();
  };

  const assignToCalendar = async (orderID, expectedShipDate) => {
    await apiPost("/odata/v4/sales/assignToCalendar", {
      orderID,
      expectedShipDate
    });
    await fetchAll();
  };

  const allocateToPlant = async (orderID, plant) => {
    await apiPost("/odata/v4/sales/allocateToPlant", {
      orderID,
      plant
    });
    await fetchAll();
  };

  const changePriority = async (orderID, newPriority) => {
    await apiPost("/odata/v4/sales/changePriority", {
      orderID,
      newPriority
    });
    await fetchAll();
  };

  /* =========================================================
     PUBLIC API
  ========================================================= */
  return {
    orders,
    customers,
    loading,
    error,
    refetch: fetchAll,

    // actions
    moveToStage,
    createChildSO,
    assignToCalendar,
    allocateToPlant,
    changePriority
  };
}
