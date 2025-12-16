import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners
} from "@dnd-kit/core";
import Column from "./Column";
import SOCard from "./SOCard";

/**
 * Board.jsx
 * =========================================================
 * PHASE–1.4 (UI-ONLY, STABLE)
 *
 * ✔ Deterministic drag & drop
 * ✔ Stable per-column sorting
 * ✔ Stage-specific actions wired
 * ✔ CARD → STAGE validation
 * ✔ No backend calls
 * =========================================================
 */

export default function Board({
  stages = [],
  ordersByStage = {},
  sortByStage = {},
  onSortChange,
  onMove,
  onOpenDetail,
  onStageAction
}) {
  /* ================= DND SENSORS ================= */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const [activeCard, setActiveCard] = useState(null);

  /* ================= STABLE SORT HELPERS ================= */
  const stableSort = (arr, compareFn) =>
    arr
      .map((v, i) => ({ v, i }))
      .sort((a, b) => compareFn(a.v, b.v) || a.i - b.i)
      .map(x => x.v);

  const compareBy = (field, dir) => (a, b) => {
    const av = a?.[field] ? new Date(a[field]).getTime() : Infinity;
    const bv = b?.[field] ? new Date(b[field]).getTime() : Infinity;
    return dir === "asc" ? av - bv : bv - av;
  };

  /* ================= DRAG START ================= */
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveCard(active?.data?.current || null);
  };

  /* ================= DRAG END ================= */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!active || !over) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (!activeData || activeData.type !== "CARD") return;
    if (!overData || overData.type !== "STAGE") return;

    const orderID = activeData.orderId;
    const fromStage = activeData.fromStage;
    const toStage = overData.stage;

    if (!orderID || !toStage) return;
    if (fromStage === toStage) return;

    if (typeof onMove === "function") {
      onMove(orderID, toStage);
    }
  };

  /* ================= RENDER ================= */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* BOARD */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map(stage => {
          const sortConfig =
            sortByStage[stage.id] || { field: "expectedShipDate", dir: "asc" };

          const sortedItems = stableSort(
            ordersByStage[stage.id] || [],
            compareBy(sortConfig.field, sortConfig.dir)
          );

          return (
            <Column
              key={stage.id}
              stage={stage}
              items={sortedItems}
              sortConfig={sortConfig}
              onSortChange={onSortChange}
              onOpenDetail={onOpenDetail}
            />
          );
        })}
      </div>

      {/* DRAG OVERLAY */}
      <DragOverlay>
        {activeCard ? (
          <div style={{ width: 300 }}>
            <SOCard
              item={activeCard}
              dragging
              onStageAction={onStageAction}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
