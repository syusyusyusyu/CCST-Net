"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type UniqueIdentifier,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

// --- Sortable item for ordering mode ---
function SortableItem({
  id,
  text,
  index,
  isDragOverlay,
  showResult,
  isCorrect,
  correctText,
  disabled,
}: {
  id: string;
  text: string;
  index: number;
  isDragOverlay?: boolean;
  showResult: boolean;
  isCorrect?: boolean;
  correctText?: string;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragOverlay) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary bg-card p-3 shadow-lg">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-medium text-primary-foreground">
          {index + 1}
        </span>
        <span className="text-sm">{text}</span>
      </div>
    );
  }

  let bgClass = "";
  if (showResult) {
    bgClass = isCorrect
      ? "border-success bg-success/10"
      : "border-destructive bg-destructive/10";
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        !disabled && !showResult && "cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-30",
        bgClass
      )}
      aria-label={`${text}、位置 ${index + 1}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
        {index + 1}
      </span>
      <span className="text-sm">{text}</span>
      {showResult && !isCorrect && correctText && (
        <span className="ml-auto text-xs text-muted-foreground">
          → {correctText}
        </span>
      )}
      {showResult && isCorrect && (
        <span className="ml-auto text-success" aria-label="正解">✓</span>
      )}
    </div>
  );
}

// --- Draggable item for matching mode ---
function MatchDraggableItem({
  id,
  text,
  assignedZone,
  showResult,
  isCorrect,
  disabled,
}: {
  id: string;
  text: string;
  assignedZone?: string;
  showResult: boolean;
  isCorrect?: boolean;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id, disabled });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  let bgClass = "";
  if (showResult) {
    bgClass = isCorrect
      ? "border-success bg-success/10"
      : "border-destructive bg-destructive/10";
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border p-3 text-sm transition-colors",
        !disabled && !showResult && "cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-30 shadow-lg",
        bgClass
      )}
    >
      <span>{text}</span>
      {assignedZone && (
        <span className="ml-2 text-xs text-muted-foreground">→ {assignedZone}</span>
      )}
      {showResult && isCorrect && (
        <span className="ml-2 text-success">✓</span>
      )}
      {showResult && !isCorrect && (
        <span className="ml-2 text-destructive">✕</span>
      )}
    </div>
  );
}

// --- Drop zone for matching mode ---
function MatchDropZone({
  id,
  text,
  isOver,
}: {
  id: string;
  text: string;
  isOver?: boolean;
}) {
  const { setNodeRef, isOver: dropIsOver } = useDroppable({ id });
  const active = isOver ?? dropIsOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 border-dashed p-3 text-sm transition-colors min-h-[44px]",
        active ? "border-primary bg-primary/5" : "border-muted-foreground/30"
      )}
    >
      {text}
    </div>
  );
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
  const isOrdering = !dropZones;

  // --- Ordering mode state ---
  const [items, setItems] = useState<string[]>(() =>
    currentOrder.length > 0 ? currentOrder : dragItems.map(i => i.id)
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // --- Matching mode state ---
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

  // Report initial order on mount for ordering mode
  useEffect(() => {
    if (isOrdering && currentOrder.length === 0) {
      const initialOrder = dragItems.map(i => i.id);
      onOrderChange(initialOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync from parent
  useEffect(() => {
    if (currentOrder.length > 0) {
      if (isOrdering) {
        setItems(currentOrder);
      } else if (dropZones) {
        const map: Record<string, string> = {};
        dragItems.forEach((item, i) => {
          if (currentOrder[i]) map[item.id] = currentOrder[i];
        });
        setAssignments(map);
      }
    }
  }, [currentOrder, isOrdering, dropZones, dragItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Ordering handlers ---
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (isOrdering) {
      if (over && active.id !== over.id) {
        setItems(prev => {
          const oldIndex = prev.indexOf(String(active.id));
          const newIndex = prev.indexOf(String(over.id));
          const newItems = arrayMove(prev, oldIndex, newIndex);
          onOrderChange(newItems);
          return newItems;
        });
      }
    } else {
      // Matching mode: if dropped on a zone
      if (over) {
        const dragItemId = String(active.id);
        const dropZoneId = String(over.id);
        // Check if it's a valid drop zone
        if (dropZones?.some(z => z.id === dropZoneId)) {
          const newAssignments = { ...assignments, [dragItemId]: dropZoneId };
          setAssignments(newAssignments);
          const orderedIds = dragItems.map(item => newAssignments[item.id] ?? "");
          onOrderChange(orderedIds);
        }
      }
    }
  }, [isOrdering, assignments, dragItems, dropZones, onOrderChange]);

  const isDisabled = disabled || showResult;

  // --- Ordering mode render ---
  if (isOrdering) {
    const activeItem = activeId ? dragItems.find(i => i.id === String(activeId)) : null;
    const activeIndex = activeId ? items.indexOf(String(activeId)) : -1;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2" role="list" aria-label="並べ替えリスト">
            {items.map((itemId, idx) => {
              const item = dragItems.find(i => i.id === itemId);
              if (!item) return null;
              const isCorrectPosition = correctOrder ? correctOrder[idx] === itemId : undefined;
              const correctItemText = correctOrder && !isCorrectPosition
                ? dragItems.find(i => i.id === correctOrder[idx])?.text
                : undefined;

              return (
                <SortableItem
                  key={itemId}
                  id={itemId}
                  text={item.text}
                  index={idx}
                  showResult={showResult}
                  isCorrect={isCorrectPosition}
                  correctText={correctItemText}
                  disabled={isDisabled}
                />
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <SortableItem
              id={activeItem.id}
              text={activeItem.text}
              index={activeIndex}
              isDragOverlay
              showResult={false}
              disabled={false}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  // --- Matching mode render ---
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">アイテム</p>
            {dragItems.map((item, idx) => {
              const assignedZoneId = assignments[item.id];
              const assignedZoneText = dropZones?.find(z => z.id === assignedZoneId)?.text;
              const isCorrectMatch = correctOrder ? assignments[item.id] === correctOrder[idx] : undefined;

              return (
                <MatchDraggableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  assignedZone={assignedZoneText}
                  showResult={showResult}
                  isCorrect={isCorrectMatch}
                  disabled={isDisabled}
                />
              );
            })}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">カテゴリ</p>
            {dropZones?.map(zone => (
              <MatchDropZone
                key={zone.id}
                id={zone.id}
                text={zone.text}
              />
            ))}
          </div>
        </div>
        {showResult && correctOrder && (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p className="font-medium mb-1">正解:</p>
            {dragItems.map((item, idx) => (
              <p key={item.id} className="text-muted-foreground">
                {item.text} → {dropZones?.find(z => z.id === correctOrder[idx])?.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </DndContext>
  );
}
