import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import SortableCardWrapper from "./SortableCardWrapper";

export default function Column({ stage, items = [] }) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  const itemIds = items.map((i) => String(i.ID));

  return (
    <section
      ref={setNodeRef}
      id={stage.id}
      className="w-80 bg-white/90 rounded-xl p-4 shadow-sm border border-gray-200"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">{stage.title}</h3>
        <span className="px-2 py-[2px] bg-orange-500 text-white text-xs rounded-full">
          {items.length}
        </span>
      </div>

      {/* SORTABLE CONTEXT */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((it) => (
            <SortableCardWrapper key={it.ID} id={String(it.ID)} data={it} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
