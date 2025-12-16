import React from "react";

/**
 * SODetailPanel.jsx
 * Slide-in right panel for SO details (Option A).
 *
 * Props:
 * - open: boolean
 * - so: object (selected order object) OR null
 * - allOrders: array (to find parent/children)
 * - onClose: function
 * - onAction: function(actionName, payload)  // placeholder for backend actions
 *
 * Notes:
 * - Non-blocking: panel is absolutely positioned; doesn't affect board layout
 * - Minimal dependency on global state; purely presentational with action hooks
 */

export default function SODetailPanel({ open, so, allOrders = [], onClose = () => {}, onAction = () => {} }) {
  if (!open) return null;

  // safe guards
  const item = so || {};
  const parent = item.parentSO_ID ? allOrders.find(o => String(o.ID) === String(item.parentSO_ID)) : null;
  const children = allOrders.filter(o => String(o.parentSO_ID) === String(item.ID));

  // RAG calculation
  const computeRAG = (dateStr) => {
    if (!dateStr) return { label: "No date", color: "bg-gray-300", text: "gray" };
    const today = new Date();
    const date = new Date(dateStr);
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Delayed", color: "bg-red-500", text: "white" };
    if (diff <= 3) return { label: "Nearing", color: "bg-yellow-500", text: "black" };
    return { label: "On Track", color: "bg-green-500", text: "white" };
  };

  const rag = computeRAG(item.expectedShipDate);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 pointer-events-auto"
        onClick={onClose}
      />

      {/* panel */}
      <aside
        className="absolute right-0 top-0 h-full w-[420px] max-w-full bg-white shadow-2xl pointer-events-auto flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <div className="text-sm text-gray-500">Sales Order</div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{item.orderNo || "—"}</h2>
              <span className={`text-xs px-2 py-1 rounded ${rag.color} ${rag.text === "white" ? "text-white" : "text-black"}`}>
                {rag.label}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{item.customerName || (item.customer && item.customer.name) || "Unknown customer"}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction("print", { id: item.ID })}
              className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Print
            </button>

            <button
              onClick={onClose}
              className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
            >
              Close
            </button>
          </div>
        </header>

        <div className="p-5 overflow-auto flex-1">
          {/* Primary info */}
          <section className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400">Expected Ship</div>
                <div className="text-sm font-medium">{item.expectedShipDate ? new Date(item.expectedShipDate).toLocaleDateString() : "—"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Stage</div>
                <div className="text-sm font-medium">{item.currentStage || "—"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Priority</div>
                <div className="text-sm font-medium">{item.priority ?? "0"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Plant</div>
                <div className="text-sm font-medium">{item.plant || "—"}</div>
              </div>
            </div>
          </section>

          {/* Parent / children */}
          <section className="mb-4">
            {parent && (
              <div className="mb-3">
                <div className="text-xs text-gray-400">Parent (Master)</div>
                <div className="text-sm font-medium">{parent.orderNo}</div>
              </div>
            )}

            <div>
              <div className="text-xs text-gray-400">Children</div>
              <div className="mt-2 space-y-2">
                {children.length === 0 ? (
                  <div className="text-sm text-gray-500">No children</div>
                ) : (
                  children.map(ch => (
                    <div key={ch.ID} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <div>
                        <div className="text-sm font-medium">{ch.orderNo}</div>
                        <div className="text-xs text-gray-400">{ch.remarks || ""}</div>
                      </div>
                      <div className="text-xs text-gray-500">{ch.currentStage}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Remarks / notes */}
          <section className="mb-4">
            <div className="text-xs text-gray-400">Remarks</div>
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.remarks || "—"}</div>
          </section>

          {/* Timeline placeholder */}
          <section className="mb-4">
            <div className="text-xs text-gray-400 mb-2">Stage history</div>
            <div className="text-sm text-gray-600">This will show timestamps and stage transitions when backend history is available.</div>
          </section>
        </div>

        {/* Actions footer */}
        <footer className="border-t px-5 py-4 bg-white flex items-center gap-3">
          <button
            onClick={() => onAction("assignToCalendar", { id: item.ID })}
            className="flex-1 bg-[#F16523] text-white px-4 py-2 rounded hover:opacity-95"
          >
            Assign to Calendar
          </button>

          <button
            onClick={() => onAction("moveToStage", { id: item.ID, stage: "Procurement" })}
            className="bg-white border px-3 py-2 rounded text-sm"
          >
            Move
          </button>

          <button
            onClick={() => onAction("markMaterialOrdered", { id: item.ID })}
            className="bg-white border px-3 py-2 rounded text-sm"
          >
            Mark Ordered
          </button>
        </footer>
      </aside>
    </div>
  );
}
