"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

// --- Sortable Section Wrapper ---
function SortableSection({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-8 bg-background rounded-xl border border-border/20 hover:border-border/40 transition-colors p-2 md:p-4">
      {/* Section Header with Drag Handle */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2.5 group cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/50 hover:bg-secondary cursor-grab hover:text-muted-foreground">
            <GripVertical className="w-3.5 h-3.5" />
          </Button>
          {/* Brand accent + mono label */}
          <div className="flex items-center gap-2">
            <div className="w-[2px] h-4 rounded-full bg-brand" />
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground select-none">{title}</h2>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/50 bg-secondary/20 px-2 py-1 rounded hidden md:inline-block">
          drag to reorder
        </span>
      </div>

      {/* The Content */}
      <div className="pl-1 md:pl-2">
        {children}
      </div>
    </div>
  );
}

// --- Main Layout Component ---
export function DraggablePageLayout({
  watchlist,
  overview,
  pinnedChart,
  newsFeed
}: {
  watchlist: React.ReactNode,
  overview: React.ReactNode,
  pinnedChart: React.ReactNode,
  newsFeed: React.ReactNode
}) {
  // Updated version to v2 to reset layout with new sections
  const [items, setItems, isLoaded] = useLocalStorage("layout-sections-order-v2", [
    "pinnedChart",
    "watchlist",
    "overview",
    "newsFeed"
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderSection = (id: string) => {
    if (id === "watchlist") return watchlist;
    if (id === "overview") return overview;
    if (id === "pinnedChart") return pinnedChart;
    if (id === "newsFeed") return newsFeed;
    return null;
  };

  const getTitle = (id: string) => {
    switch (id) {
      case "watchlist": return "Your Watchlist";
      case "overview": return "Market Overview";
      case "pinnedChart": return "Pinned Chart";
      case "newsFeed": return "Latest News";
      default: return "Section";
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-4">
        {["pinnedChart", "watchlist", "overview", "newsFeed"].map(id => (
          <div key={id} className="mb-8 bg-background rounded-xl p-2 md:p-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-[2px] h-4 rounded-full bg-brand" />
              <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground select-none">{getTitle(id)}</h2>
            </div>
            <div className="pl-1 md:pl-2">{renderSection(id)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      id="page-layout-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {items.map((id) => (
            <SortableSection key={id} id={id} title={getTitle(id)}>
              {renderSection(id)}
            </SortableSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}