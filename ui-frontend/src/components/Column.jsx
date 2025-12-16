// src/components/Column.jsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import SortableCardWrapper from "./SortableCardWrapper";

/**
 * Column.jsx
 * =========================================================
 * PHASE-1.3 READY
 * ✔ Droppable stage
 * ✔ Stable rendering
 * ✔ Sort toggle (ASC / DESC)
 * ✔ No duplicated exports
 * ✔ No JSX or syntax errors
 * =========================================================
 */

export default function Column({
  stage,
  items = [],
  sortConfig,
  onSortChange,
  onOpenDetail
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: {
      type: "STAGE",
      stage: stage.id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className="w-72 bg-gray-100 rounded p-3 flex-shrink-0"
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">{stage.title}</h3>

        <div className="flex items-center gap-2">
          {/* COUNT */}
          <span className="text-xs bg-orange-100 text-orange-600 px-2 rounded">
            {items.length}
          </span>

          {/* SORT TOGGLE */}
          {sortConfig && onSortChange && (
            <button
              className="text-xs text-gray-500 hover:text-gray-800"
              onClick={() =>
                onSortChange(prev => ({
                  ...prev,
                  [stage.id]: {
                    field: sortConfig.field,
                    dir: sortConfig.dir === "asc" ? "desc" : "asc"
                  }
                }))
              }
            >
              {sortConfig.dir === "asc" ? "↑" : "↓"}
            </button>
          )}
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="space-y-3 min-h-[50px]">
        {items.map(order => (
          <SortableCardWrapper
            key={order.ID}
            id={order.ID}
            data={{
              ...order,
              type: "CARD",
              orderId: order.ID,
              fromStage: stage.id
            }}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
}
