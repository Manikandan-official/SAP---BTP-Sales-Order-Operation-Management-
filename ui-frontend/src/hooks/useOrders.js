import { useEffect, useState } from "react";
import { getSalesOrders, moveOrderStage } from "../api/sales";

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getSalesOrders();
      setOrders(data);
    } catch (e) {
      console.error("Load failed", e);
    }
    setLoading(false);
  }

  async function updateStage(orderID, newStage) {
    await moveOrderStage(orderID, newStage);
    await load();
  }

  return {
    orders,
    loading,
    updateStage
  };
}
