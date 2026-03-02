"use client";

import { Progress } from "@/components/ui/progress";

interface QuizProgressBarProps {
  current: number;
  total: number;
  correctCount: number;
}

export function QuizProgressBar({ current, total, correctCount }: QuizProgressBarProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          問題 {current + 1} / {total}
        </span>
        <span className="text-muted-foreground">
          正解: {correctCount}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
