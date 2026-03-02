"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import domains from "@/data/domains.json";

interface DomainRadarChartProps {
  domainAccuracies: Record<number, number>;
}

export function DomainRadarChart({ domainAccuracies }: DomainRadarChartProps) {
  const data = domains.map(d => ({
    domain: `D${d.id}`,
    fullName: d.titleJa,
    accuracy: domainAccuracies[d.id] ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ドメイン別正答率</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
            <Radar
              name="正答率"
              dataKey="accuracy"
              stroke="hsl(213 100% 40%)"
              fill="hsl(213 100% 40%)"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
