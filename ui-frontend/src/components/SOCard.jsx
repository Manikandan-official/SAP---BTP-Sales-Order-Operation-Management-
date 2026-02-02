// src/components/SOCard.jsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Calendar,
  Clock,
  Package,
  CheckCircle,
  FileText
} from "react-feather";

/**
 * SOCard.jsx — PHASE 1 FINAL
 * =========================================================
 * ✔ Stage-driven workflow (NO item dependency)
 * ✔ DnD-safe
 * ✔ Backend-agnostic
 * ✔ Deterministic UI behavior
 * ✔ Phase-1 compliant (Phase-2 will add SKU rules)
 * =========================================================
 */

export default function SOCard({
  item,
  dragging = false,
  onOpen,
  onStageAction = {}
}) {
  if (!item || typeof item !== "object") return null;

  const stage = item.currentStage || "SalesSupport";

  /* ================= DRAGGABLE ================= */
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.ID,
      data: {
        type: "CARD",
        orderId: item.ID,
        fromStage: stage
      }
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

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

  /* ================= PHASE-1 WORKFLOW FLAGS ================= */
  const canOrderRM = stage === "Procurement";
  const canReceiveRM = stage === "RMInventory";
  const canApproveQA = stage === "Quality";
  const canInvoice = stage === "FGInventory";

  const fire = fn => {
    if (typeof fn === "function") fn(item.ID);
  };

  const renderDate = d =>
    d ? new Date(d).toLocaleDateString() : "--";

  /* ================= RENDER ================= */
  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={() => onOpen?.(item)}
      className={`relative bg-white rounded-md p-3 border shadow-sm cursor-pointer select-none
        transition
        ${
          dragging || isDragging
            ? "ring-2 ring-blue-400 opacity-80"
            : "hover:shadow-md"
        }`}
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
          <button
            type="button"
            disabled={!canOrderRM}
            className="w-full px-2 py-1 text-xs rounded bg-orange-500 text-white
              disabled:opacity-40 hover:bg-orange-600"
            onClick={e => {
              e.stopPropagation();
              fire(onStageAction.markRMOrdered);
            }}
          >
            <Package size={12} className="inline mr-1" />
            Mark RM Ordered
          </button>
        </div>
      )}

      {/* ================= RM INVENTORY ================= */}
      {stage === "RMInventory" && (
        <div className="mt-3 space-y-2 text-xs">
          <button
            type="button"
            disabled={!canReceiveRM}
            className="w-full px-2 py-1 text-xs rounded bg-blue-500 text-white
              disabled:opacity-40 hover:bg-blue-600"
            onClick={e => {
              e.stopPropagation();
              fire(onStageAction.markRMReceived);
            }}
          >
            <Package size={12} className="inline mr-1" />
            Mark RM Received
          </button>
        </div>
      )}

      {/* ================= QUALITY ================= */}
      {stage === "Quality" && (
        <div className="mt-3 space-y-2 text-xs">
          <button
            type="button"
            disabled={!canApproveQA}
            className="w-full px-2 py-1 text-xs rounded bg-green-600 text-white
              disabled:opacity-40 hover:bg-green-700"
            onClick={e => {
              e.stopPropagation();
              fire(onStageAction.approveQA);
            }}
          >
            <CheckCircle size={12} className="inline mr-1" />
            Approve QA
          </button>
        </div>
      )}

      {/* ================= FG INVENTORY ================= */}
      {stage === "FGInventory" && (
        <div className="mt-3 space-y-2 text-xs">
          <button
            type="button"
            disabled={!canInvoice}
            className="w-full px-2 py-1 text-xs rounded bg-purple-600 text-white
              disabled:opacity-40 hover:bg-purple-700"
            onClick={e => {
              e.stopPropagation();
              fire(onStageAction.createInvoice);
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
