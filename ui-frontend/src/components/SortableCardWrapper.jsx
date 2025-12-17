import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical } from "react-feather";
import SOCard from "./SOCard";

export default function SortableCardWrapper({
  id,
  data,
  fromStage,
  onOpenDetail,
  onStageAction
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    data: {
      ...data,
      type: "CARD",
      orderId: id,
      fromStage
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1
      }}
      className="relative"
    >
      {/* DRAG HANDLE ONLY */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab text-gray-400 hover:text-gray-700 z-10"
      >
        <MoreVertical size={16} />
      </div>

      {/* CARD BODY — NO DND LISTENERS */}
      <SOCard
        item={data}
        dragging={isDragging}
        onOpen={() => onOpenDetail?.(data)}
        onStageAction={onStageAction}
      />
    </div>
  );
}
