import React from "react";

export default function DetailPanel({ open, onClose, order }) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50">
      <div className="w-[420px] h-full bg-white shadow-xl p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sales Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-lg"
          >
            ✕
          </button>
        </div>

        {/* CORE DETAILS */}
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">SO Number: </span>
            {order.orderNo}
          </div>

          <div>
            <span className="font-semibold">Customer ID: </span>
            {order.customer_ID || "--"}
          </div>

          <div>
            <span className="font-semibold">Stage: </span>
            {order.currentStage}
          </div>

          <div>
            <span className="font-semibold">Status: </span>
            {order.status || "Created"}
          </div>

          <div>
            <span className="font-semibold">Expected Ship Date: </span>
            {order.expectedShipDate
              ? new Date(order.expectedShipDate).toLocaleDateString()
              : "--"}
          </div>

          <div>
            <span className="font-semibold">Plant: </span>
            {order.plant || "--"}
          </div>

          <div>
            <span className="font-semibold">Remarks: </span>
            {order.remarks || "--"}
          </div>
        </div>

        {/* CHILD ORDERS */}
        {order.children?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Child Sales Orders</h3>
            <div className="space-y-2">
              {order.children.map(child => (
                <div
                  key={child.ID}
                  className="p-3 border rounded-lg bg-gray-50"
                >
                  <div className="font-medium text-sm">
                    {child.orderNo}
                  </div>
                  <div className="text-xs text-gray-600">
                    Expected Ship:{" "}
                    {child.expectedShipDate
                      ? new Date(child.expectedShipDate).toLocaleDateString()
                      : "--"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LINE ITEMS */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Line Items</h3>
          {order.items?.length > 0 ? (
            <ul className="text-sm list-disc ml-4">
              {order.items.map(it => (
                <li key={it.ID}>
                  {it.skuName} × {it.qty}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">
              No line items available
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
