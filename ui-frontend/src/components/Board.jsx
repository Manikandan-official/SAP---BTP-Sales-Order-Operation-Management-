// src/components/Board.jsx
import React, { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection
} from "@dnd-kit/core";
import Column from "./Column";
import SOCard from "./SOCard";

/**
 * Board.jsx (Frontend Final)
 * =========================================================
 * ✔ Stable drag & drop across empty + filled columns
 * ✔ Backend-agnostic, UI-authoritative
 * ✔ Defensive against malformed drag data
 * ✔ No business logic leakage
 * =========================================================
 */

export default function Board({
  stages = [],
  ordersByStage = {},
  sortByStage = {},
  onSortChange,
  onMove,
  onOpenDetail
}) {
  /* ================= DND SENSORS ================= */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const [activeCard, setActiveCard] = useState(null);

  /* ================= SORT HELPERS ================= */
  const stableSort = useCallback(
    (arr, compareFn) =>
      arr
        .map((v, i) => ({ v, i }))
        .sort((a, b) => compareFn(a.v, b.v) || a.i - b.i)
        .map(x => x.v),
    []
  );

  const compareBy = useCallback(
    (field, dir) => (a, b) => {
      const av = a?.[field]
        ? new Date(a[field]).getTime()
        : Infinity;
      const bv = b?.[field]
        ? new Date(b[field]).getTime()
        : Infinity;
      return dir === "asc" ? av - bv : bv - av;
    },
    []
  );

  /* ================= DRAG START ================= */
  const handleDragStart = useCallback(event => {
    const data = event?.active?.data?.current;
    if (data && data.type === "CARD") {
      setActiveCard(data);
    }
  }, []);

  /* ================= DRAG END ================= */
  const handleDragEnd = useCallback(
    event => {
      const { active, over } = event;
      setActiveCard(null);

      if (!active || !over) return;

      const activeData = active.data?.current;
      const overData = over.data?.current;

      if (!activeData || activeData.type !== "CARD") return;

      const orderID = activeData.orderId;
      const fromStage = activeData.fromStage;

      let toStage = null;

      // Dropped on empty column
      if (overData?.type === "STAGE") {
        toStage = overData.stage;
      }

      // Dropped on another card
      if (overData?.type === "CARD") {
        toStage = overData.fromStage;
      }

      if (!orderID || !fromStage || !toStage) return;
      if (fromStage === toStage) return;

      // 🔑 Single delegation point
      onMove?.(orderID, toStage);
    },
    [onMove]
  );

  /* ================= RENDER ================= */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* BOARD */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map(stage => {
          const sortConfig =
            sortByStage[stage.id] || {
              field: "expectedShipDate",
              dir: "asc"
            };

          const items = ordersByStage[stage.id] || [];

          const sortedItems = useMemo(
            () =>
              stableSort(
                items,
                compareBy(sortConfig.field, sortConfig.dir)
              ),
            [items, sortConfig, stableSort, compareBy]
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
          <SOCard item={activeCard} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
