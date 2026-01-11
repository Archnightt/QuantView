"use client";

import React, { useState, useEffect } from "react";
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
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectorWidget, SentimentWidget, TrendingWidget } from "./DashboardWidgets";
import { PriceChart } from "./PriceChart";
import { NewsWidget } from "./NewsWidget";

// --- Sortable Item Wrapper ---
function SortableItem({ id, className, children }: { id: string, className?: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
}

// --- Main Grid Component ---
export function DraggableDashboard({ serverData }: { serverData: any }) {
  // Default Layout IDs
  const [items, setItems] = useState([
    "hero-chart", "sectors", "sentiment", "trending", "news"
  ]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  // Render Helper
  const renderWidget = (id: string) => {
    switch(id) {
      case "hero-chart":
        return (
            <div className="h-full bg-secondary/10 rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg">
                     {serverData.heroName || serverData.heroSymbol || "Market Mover"} 
                     <span className="text-muted-foreground ml-2 text-sm">({serverData.heroSymbol || "AAPL"})</span>
                   </h3>
                   <span className="text-xs text-muted-foreground">30 Day Trend</span>
                </div>
                <PriceChart data={serverData.heroHistory || []} />
            </div>
        ); 
      case "sectors":
        return <SectorWidget data={serverData.sectors} />;
      case "sentiment":
        return <SentimentWidget vix={serverData.vix} />;
      case "trending":
        return <TrendingWidget data={serverData.trending} />;
      case "news":
        return <NewsWidget news={serverData.news} />;
      default:
        return null;
    }
  };

  // Grid Classes Configuration
  const getItemClass = (id: string) => {
    switch(id) {
      case "hero-chart": return "col-span-1 md:col-span-2 row-span-2 min-h-[400px]";
      case "news": return "col-span-1 md:col-span-2 min-h-[400px]";
      default: return "col-span-1 min-h-[200px]";
    }
  };

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
        {items.map((id) => (
          <div key={id} className={getItemClass(id)}>
            {renderWidget(id)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
          {items.map((id) => (
            <SortableItem key={id} id={id} className={getItemClass(id)}>
              {renderWidget(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}