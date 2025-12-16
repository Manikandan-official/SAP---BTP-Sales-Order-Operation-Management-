// src/components/SortableCardWrapper.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SOCard from "./SOCard";

export default function SortableCardWrapper({
  id,
  data,
  fromStage,
  onOpenDetail
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    data: {
      ...data,
      type: "CARD",        // 🔒 REQUIRED
      orderId: id,         // 🔒 REQUIRED
      fromStage            // 🔒 REQUIRED
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <SOCard
        item={data}
        dragging={isDragging}
        onOpen={() => onOpenDetail?.(data)}
      />
    </div>
  );
}
