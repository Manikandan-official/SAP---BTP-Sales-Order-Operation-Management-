import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";

import Column from "./Column";
import SOCard from "./SOCard";

export default function Board({ stages, ordersByStage, onMove }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [activeItem, setActiveItem] = useState(null);

  const handleDragStart = (event) => {
    setActiveItem(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;

    onMove(String(active.id), String(over.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-auto pb-8">
        {stages.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            items={ordersByStage[stage.id] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div style={{ width: 260 }}>
            <SOCard item={activeItem} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
