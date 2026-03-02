"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DragAndDropProps {
  dragItems: { id: string; text: string }[];
  dropZones?: { id: string; text: string }[];
  correctOrder?: string[];
  currentOrder: string[];
  showResult: boolean;
  onOrderChange: (orderedIds: string[]) => void;
  disabled?: boolean;
}

export function DragAndDrop({
  dragItems,
  dropZones,
  correctOrder,
  currentOrder,
  showResult,
  onOrderChange,
  disabled,
}: DragAndDropProps) {
  const [items, setItems] = useState<string[]>(currentOrder.length > 0 ? currentOrder : dragItems.map(i => i.id));
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (currentOrder.length > 0) {
      setItems(currentOrder);
    }
  }, [currentOrder]);

  const isOrdering = !dropZones;

  // マッチング用: 各dragItemのdropZone割り当て
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    if (dropZones && currentOrder.length > 0) {
      const map: Record<string, string> = {};
      dragItems.forEach((item, i) => {
        if (currentOrder[i]) map[item.id] = currentOrder[i];
      });
      return map;
    }
    return {};
  });

  const handleDragStart = (idx: number) => {
    if (disabled || showResult) return;
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx === null || disabled || showResult) return;
    const newItems = [...items];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, removed);
    setItems(newItems);
    setDraggedIdx(null);
    if (isOrdering) {
      onOrderChange(newItems);
    }
  };

  const handleMatchDrop = (dragItemId: string, dropZoneId: string) => {
    if (disabled || showResult) return;
    const newAssignments = { ...assignments, [dragItemId]: dropZoneId };
    setAssignments(newAssignments);
    const orderedIds = dragItems.map(item => newAssignments[item.id] ?? "");
    onOrderChange(orderedIds);
  };

  if (isOrdering) {
    return (
      <div className="space-y-2">
        {items.map((itemId, idx) => {
          const item = dragItems.find(i => i.id === itemId);
          if (!item) return null;

          let bgClass = "";
          if (showResult && correctOrder) {
            bgClass = correctOrder[idx] === itemId
              ? "border-success bg-success/10"
              : "border-destructive bg-destructive/10";
          }

          return (
            <div
              key={itemId}
              draggable={!disabled && !showResult}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all",
                !disabled && !showResult && "cursor-grab active:cursor-grabbing",
                draggedIdx === idx && "opacity-50",
                bgClass
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                {idx + 1}
              </span>
              <span className="text-sm">{item.text}</span>
              {showResult && correctOrder && correctOrder[idx] !== itemId && (
                <span className="ml-auto text-xs text-muted-foreground">
                  → {dragItems.find(i => i.id === correctOrder[idx])?.text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // マッチング
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">アイテム</p>
          {dragItems.map((item, idx) => {
            let bgClass = "";
            if (showResult && correctOrder) {
              bgClass = assignments[item.id] === correctOrder[idx]
                ? "border-success bg-success/10"
                : "border-destructive bg-destructive/10";
            }
            return (
              <div
                key={item.id}
                draggable={!disabled && !showResult}
                onDragStart={() => setDraggedIdx(idx)}
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  !disabled && !showResult && "cursor-grab",
                  bgClass
                )}
              >
                {item.text}
                {assignments[item.id] && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    → {dropZones?.find(z => z.id === assignments[item.id])?.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">カテゴリ</p>
          {dropZones?.map(zone => (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIdx !== null) {
                  handleMatchDrop(dragItems[draggedIdx].id, zone.id);
                  setDraggedIdx(null);
                }
              }}
              className="rounded-lg border-2 border-dashed p-3 text-sm transition-colors hover:border-primary"
            >
              {zone.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
