"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/format";

interface QuizTimerProps {
  remaining: number;
}

export function QuizTimer({ remaining }: QuizTimerProps) {
  const minutes = Math.floor(remaining / 60);

  return (
    <div
      role="timer"
      aria-label="残り時間"
      className={cn(
        "font-mono text-lg font-bold tabular-nums",
        minutes <= 1 && "animate-pulse text-destructive",
        minutes <= 5 && minutes > 1 && "text-destructive",
        minutes <= 10 && minutes > 5 && "text-warning",
      )}
    >
      {formatTime(remaining)}
    </div>
  );
}
