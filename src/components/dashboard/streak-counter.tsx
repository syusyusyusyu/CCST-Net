"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StreakCounterProps {
  streakDays: number;
}

export function StreakCounter({ streakDays }: StreakCounterProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-2xl font-bold">{streakDays} 日</p>
          <p className="text-sm text-muted-foreground">連続学習</p>
        </div>
      </CardContent>
    </Card>
  );
}
