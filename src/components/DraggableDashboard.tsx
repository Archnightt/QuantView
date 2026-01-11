"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { SectorWidget, SentimentWidget } from "@/components/DashboardWidgets";
import { NewsWidget } from "@/components/NewsWidget";
import { MarketSummaryWidget } from "@/components/MarketSummaryWidget";
import { StockHistory } from "@/lib/history";
import { HeroChart } from "@/components/HeroChart";

// --- Sortable Item Wrapper ---
function SortableItem({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
}

// --- Main Component ---
interface DashboardProps {
  serverData: {
    sectors: any[];
    vix: any;
    trending: any[];
    heroHistory: StockHistory[];
    heroSymbol: string;
    heroName: string;
    news: any[];
    marketSummary?: any;
  };
}

export function DraggableDashboard({ serverData }: DashboardProps) {
  const [items, setItems, isLoaded] = useLocalStorage("dashboard-grid-order", [
    "hero-chart",
    "market-summary",
    "sectors",
    "sentiment",
    "news"
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

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

  const getItemClass = (id: string) => {
    switch (id) {
      case "hero-chart":
        return "col-span-1 md:col-span-2 lg:col-span-3 min-h-[350px]";
      case "news":
        return "col-span-1 md:col-span-2 lg:col-span-3 min-h-[400px]";
      case "sectors":
        return "col-span-1 min-h-[300px]";
      case "market-summary":
        return "col-span-1 min-h-[300px]";
      case "sentiment":
        return "col-span-1 min-h-[300px]";
      default:
        return "col-span-1";
    }
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case "hero-chart":
        return (
          <HeroChart 
            data={serverData.heroHistory} 
            symbol={serverData.heroSymbol} 
            name={serverData.heroName} 
          />
        );
      case "sectors":
        return <SectorWidget data={serverData.sectors} />;
      case "sentiment":
        return <SentimentWidget vix={serverData.vix} />;
      case "market-summary":
      case "trending":
        return <MarketSummaryWidget data={serverData.marketSummary || {}} />;
      case "news":
        return <NewsWidget news={serverData.news} />;
      default:
        return null;
    }
  };

  const handleDragStart = (event: any) => setActiveId(event.active.id);
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["hero-chart", "market-summary", "sectors", "sentiment", "news"].map((id) => (
          <div key={id} className={getItemClass(id)}>
            {renderWidget(id)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((id) => (
            <SortableItem key={id} id={id} className={getItemClass(id)}>
              {renderWidget(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className={`${getItemClass(activeId)} opacity-80 cursor-grabbing`}>
             <div className="h-full w-full bg-secondary/50 rounded-xl border-2 border-primary/50" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
