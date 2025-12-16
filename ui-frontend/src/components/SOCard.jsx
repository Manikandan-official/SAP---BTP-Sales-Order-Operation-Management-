import React from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Package,
  FileText
} from "react-feather";

/**
 * SOCard.jsx (PHASE-1.4 LOCKED FINAL)
 * =========================================================
 * ✔ Stage actions ALWAYS visible
 * ✔ Buttons disable instead of disappearing
 * ✔ DnD-safe
 * ✔ Sorting-safe
 * ✔ UI-only state transitions
 * ✔ Zero undefined crashes
 * ✔ Backend-ready
 * =========================================================
 */

export default function SOCard({
  item,
  dragging = false,
  onOpen,
  onStageAction
}) {
  if (!item || typeof item !== "object") return null;

  const stage = item.currentStage || "SalesSupport";
  const items = Array.isArray(item.items) ? item.items : [];

  /* ================= RAG LOGIC ================= */
  let rag = "green";
  if (item.expectedShipDate) {
    const diff =
      (new Date(item.expectedShipDate) - new Date()) / 86400000;
    if (diff < 0) rag = "red";
    else if (diff <= 2) rag = "amber";
  }

  const ragColor =
    rag === "red"
      ? "bg-red-500"
      : rag === "amber"
      ? "bg-yellow-500"
      : "bg-green-500";

  /* ================= STAGE FLAGS ================= */
  const allRMOrdered =
    items.length > 0 && items.every(i => i.materialOrdered);

  const allRMReceived =
    items.length > 0 && items.every(i => i.materialReceived);

  const allQAApproved =
    items.length > 0 && items.every(i => i.qaApproved);

  const allFGReady =
    items.length > 0 && items.every(i => i.fgReady);

  /* ================= SAFE ACTION ================= */
  const fire = (fn) => {
    if (typeof fn === "function") {
      fn(item.ID);
    }
  };

  const renderDate = d =>
    d ? new Date(d).toLocaleDateString() : "--";

  return (
    <article
      onClick={() => onOpen?.(item)}
      className={`relative bg-white rounded-md p-3 border shadow-sm transition cursor-pointer
        ${dragging ? "ring-2 ring-blue-400 opacity-80" : "hover:shadow-md"}`}
      style={{ width: 260 }}
    >
      {/* RAG STRIP */}
      <div className={`absolute left-0 top-0 h-full w-1 ${ragColor}`} />

      {/* HEADER */}
      <h4 className="text-sm font-semibold text-gray-800">
        SO No: {item.orderNo || "--"}
      </h4>

      {/* DATE */}
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <Calendar size={12} />
        Ship by: {renderDate(item.expectedShipDate)}
      </p>

      {/* ================= SALES SUPPORT ================= */}
      {stage === "SalesSupport" && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center gap-1 text-blue-600">
            <Clock size={12} /> TAT Planning
          </div>
          <div className="text-gray-600">
            Allocate to:{" "}
            <span className="font-medium">
              {item.plant || "Not Assigned"}
            </span>
          </div>
        </div>
      )}

      {/* ================= PROCUREMENT ================= */}
      {stage === "Procurement" && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center gap-1">
            <Package size={12} />
            RM Ordered:
            <span
              className={`ml-1 font-medium ${
                allRMOrdered ? "text-green-600" : "text-red-600"
              }`}
            >
              {allRMOrdered ? "Yes" : "Pending"}
            </span>
          </div>

          <button
            type="button"
            disabled={allRMOrdered}
            className="w-full px-2 py-1 text-xs rounded bg-orange-500 text-white
              disabled:opacity-40 hover:bg-orange-600"
            onClick={(e) => {
              e.stopPropagation();
              fire(onStageAction?.markRMOrdered);
            }}
          >
            Mark RM Ordered
          </button>
        </div>
      )}

      {/* ================= RM INVENTORY ================= */}
      {stage === "RMInventory" && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center gap-1">
            <Package size={12} />
            RM Received:
            <span
              className={`ml-1 font-medium ${
                allRMReceived ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {allRMReceived ? "Complete" : "Pending"}
            </span>
          </div>

          <button
            type="button"
            disabled={allRMReceived}
            className="w-full px-2 py-1 text-xs rounded bg-blue-500 text-white
              disabled:opacity-40 hover:bg-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              fire(onStageAction?.markRMReceived);
            }}
          >
            Mark RM Received
          </button>
        </div>
      )}

      {/* ================= QUALITY ================= */}
      {stage === "Quality" && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle size={12} />
            QA Status:
            <span
              className={`ml-1 font-medium ${
                allQAApproved ? "text-green-600" : "text-red-600"
              }`}
            >
              {allQAApproved ? "Approved" : "Pending"}
            </span>
          </div>

          <button
            type="button"
            disabled={allQAApproved}
            className="w-full px-2 py-1 text-xs rounded bg-green-600 text-white
              disabled:opacity-40 hover:bg-green-700"
            onClick={(e) => {
              e.stopPropagation();
              fire(onStageAction?.approveQA);
            }}
          >
            Approve QA
          </button>
        </div>
      )}

      {/* ================= FG INVENTORY ================= */}
      {stage === "FGInventory" && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center gap-1">
            <Package size={12} />
            FG Ready:
            <span
              className={`ml-1 font-medium ${
                allFGReady ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {allFGReady ? "Yes" : "Pending"}
            </span>
          </div>

          <button
            type="button"
            disabled={item.invoiced}
            className="w-full px-2 py-1 text-xs rounded bg-purple-600 text-white
              disabled:opacity-40 hover:bg-purple-700"
            onClick={(e) => {
              e.stopPropagation();
              fire(onStageAction?.createInvoice);
            }}
          >
            <FileText size={12} className="inline mr-1" />
            Create Invoice
          </button>
        </div>
      )}

      {/* STAGE TAG */}
      <span className="inline-block mt-3 px-2 py-1 text-[10px] rounded-full bg-blue-50 text-blue-700">
        {stage}
      </span>
    </article>
  );
}
