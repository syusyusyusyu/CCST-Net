"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PASSING_SCORE } from "@/lib/constants";
import type { ExamResult } from "@/lib/store/progress-store";

interface ScoreTrendChartProps {
  examResults: ExamResult[];
}

export function ScoreTrendChart({ examResults }: ScoreTrendChartProps) {
  const examOnly = examResults
    .filter(r => r.mode === "exam")
    .sort((a, b) => a.date.localeCompare(b.date));

  if (examOnly.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">模擬試験スコア推移</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            模擬試験を受験するとスコアの推移が表示されます
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = examOnly.map((r, i) => ({
    name: `${i + 1}回目`,
    score: r.score,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">模擬試験スコア推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[200, 1000]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <ReferenceLine y={PASSING_SCORE} stroke="hsl(142 71% 45%)" strokeDasharray="5 5" label="合格ライン" />
            <Line type="monotone" dataKey="score" stroke="hsl(213 100% 40%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
