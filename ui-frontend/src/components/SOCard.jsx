import React from "react";

export default function SOCard({ item, dragging }) {
  const today = new Date();
  const date = item.expectedShipDate ? new Date(item.expectedShipDate) : null;

  // RAG computed in App, but fallback here
  const rag = item.rag || (() => {
    if (!date) return "gray";
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "red";
    if (diffDays <= 3) return "amber";
    return "green";
  })();

  const ragColor =
    rag === "red"
      ? "bg-red-500"
      : rag === "amber"
      ? "bg-yellow-500"
      : rag === "green"
      ? "bg-green-500"
      : "bg-gray-400";

  return (
    <article
      className={`relative bg-white rounded-lg p-4 shadow-md border border-gray-100 ${
        dragging ? "ring-2 ring-blue-300" : ""
      }`}
    >
      {/* RAG BAR */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-md ${ragColor}`}
      />

      <h5 className="font-bold text-sm text-gray-800">{item.orderNo}</h5>

      {item.remarks && (
        <div className="text-xs text-gray-500 mt-1">{item.remarks}</div>
      )}

      <div className="text-xs text-gray-500 mt-1">
        Customer: {item.customer?.name || item.customerName || "---"}
      </div>

      <div className="flex justify-between items-center mt-3">
        <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
          {item.currentStage}
        </span>
        <span className="text-sm text-gray-400">
          {item.expectedShipDate
            ? date.toLocaleDateString()
            : ""}
        </span>
      </div>
    </article>
  );
}
