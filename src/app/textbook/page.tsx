"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProgressStore } from "@/lib/store/progress-store";
import domains from "@/data/domains.json";

export default function TextbookPage() {
  const { textbookProgress, questionStats } = useProgressStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">教科書</h1>
        <p className="mt-2 text-muted-foreground">
          CCST Networking の全範囲をカバーする学習コンテンツ
        </p>
      </div>

      {domains.map(domain => {
        const completedCount = domain.topics.filter(t =>
          textbookProgress.completedTopics.includes(t.id)
        ).length;

        return (
          <section key={domain.id}>
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Domain {domain.id}
              </Badge>
              <h2 className="text-xl font-bold">{domain.titleJa}</h2>
              <span className="text-sm text-muted-foreground">
                {completedCount} / {domain.topics.length} 読了
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domain.topics.map(topic => {
                const isCompleted = textbookProgress.completedTopics.includes(topic.id);
                const topicQuestionIds = Object.keys(questionStats).filter(id =>
                  id.startsWith(`q-${domain.id}-${topic.id.split(".")[1]}-`)
                );
                const attempted = topicQuestionIds.filter(id => questionStats[id]?.totalAttempts > 0);
                const correct = topicQuestionIds.filter(id => questionStats[id]?.lastResult);
                const accuracy = attempted.length > 0 ? Math.round((correct.length / attempted.length) * 100) : null;

                return (
                  <Link key={topic.id} href={`/textbook/${topic.id.replace(".", "-")}`}>
                    <Card className="h-full transition-colors hover:bg-accent/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            isCompleted
                              ? "bg-success text-white"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {isCompleted ? "\u2713" : topic.id}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium leading-snug">{topic.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{topic.titleEn}</p>
                            {accuracy !== null && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                正答率 {accuracy}%
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
