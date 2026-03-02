"use client";

import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answeredQuestions: string[];
  flaggedQuestions: string[];
  questionIds: string[];
  onJump: (index: number) => void;
}

export function QuestionNavigator({
  total,
  currentIndex,
  answeredQuestions,
  flaggedQuestions,
  questionIds,
  onJump,
}: QuestionNavigatorProps) {
  return (
    <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
      {Array.from({ length: total }, (_, i) => {
        const qId = questionIds[i];
        const isAnswered = answeredQuestions.includes(qId);
        const isFlagged = flaggedQuestions.includes(qId);
        const isCurrent = i === currentIndex;

        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors",
              isCurrent && "ring-2 ring-primary ring-offset-1",
              isFlagged
                ? "bg-warning/20 text-warning"
                : isAnswered
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
            aria-label={`問題 ${i + 1}${isFlagged ? " (フラグ済み)" : ""}${isAnswered ? " (回答済み)" : ""}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
