"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import domains from "@/data/domains.json";

interface WeakTopic {
  topicId: string;
  accuracy: number;
}

interface WeakTopicsProps {
  weakTopics: WeakTopic[];
}

function getTopicTitle(topicId: string): string {
  for (const domain of domains) {
    const topic = domain.topics.find(t => t.id === topicId);
    if (topic) return topic.title;
  }
  return topicId;
}

export function WeakTopics({ weakTopics }: WeakTopicsProps) {
  if (weakTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">弱点トピック</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            問題を解くと弱点トピックが分析されます
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">弱点トピック TOP{weakTopics.length}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weakTopics.map((wt, i) => (
            <div key={wt.topicId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{wt.topicId} {getTopicTitle(wt.topicId)}</p>
                  <p className="text-xs text-muted-foreground">正答率 {wt.accuracy}%</p>
                </div>
              </div>
              <Link href={`/study?topic=${wt.topicId}`}>
                <Button variant="outline" size="sm">復習する</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
