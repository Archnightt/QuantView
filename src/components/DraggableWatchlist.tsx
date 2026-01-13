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
import { StockCard } from "@/components/StockCard";

// --- Sortable Item Wrapper ---
function SortableStockItem({ id, stock }: { id: string, stock: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  // Track if we were recently dragging to suppress click events
  const wasDraggingRef = React.useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
    } else {
      const timer = setTimeout(() => {
        wasDraggingRef.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      {/* 
         Prevent interaction with the card content while dragging.
         This prevents the click event from firing on the Link/Card after a drag operation finishes.
      */}
      <div 
        className="h-full" 
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        onClickCapture={(e) => {
          if (wasDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <StockCard stock={stock} />
      </div>
    </div>
  );
}

// --- Main Component ---
export function DraggableWatchlist({ initialStocks }: { initialStocks: any[] }) {
  const [stocks, setStocks] = useState(initialStocks);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setStocks(initialStocks);
  }, [initialStocks]);

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
      setStocks((items) => {
        const oldIndex = items.findIndex(i => i.symbol === active.id);
        const newIndex = items.findIndex(i => i.symbol === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!isMounted) {
    // Render static grid to prevent hydration mismatch
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialStocks.map((stock) => (
           <div key={stock.symbol}><StockCard stock={stock} /></div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stocks.map(s => s.symbol)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <SortableStockItem key={stock.symbol} id={stock.symbol} stock={stock} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
