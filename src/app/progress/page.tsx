"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/store/progress-store";
import { getAllQuestions } from "@/lib/utils/load-questions";
import { formatDate } from "@/lib/utils/format";
import domains from "@/data/domains.json";

export default function ProgressPage() {
  const { questionStats, examResults, textbookProgress, streakDays, totalStudyTime, resetAllProgress } = useProgressStore();
  const allQuestions = useMemo(() => getAllQuestions(), []);

  const handleReset = () => {
    if (window.confirm("すべての学習データをリセットしますか？この操作は元に戻せません。")) {
      resetAllProgress();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">学習の進捗</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">連続学習</p>
            <p className="text-2xl font-bold">{streakDays} 日</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">学習時間</p>
            <p className="text-2xl font-bold">{Math.floor(totalStudyTime / 3600)} 時間</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">挑戦済み問題</p>
            <p className="text-2xl font-bold">
              {Object.keys(questionStats).filter(id => questionStats[id].totalAttempts > 0).length} / {allQuestions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ドメイン別進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {domains.map(domain => {
            const domainQuestions = allQuestions.filter(q => q.domainId === domain.id);
            const attempted = domainQuestions.filter(q => questionStats[q.id]?.totalAttempts > 0);
            const correct = attempted.filter(q => questionStats[q.id]?.correctCount > 0);
            const topicsCompleted = domain.topics.filter(t => textbookProgress.completedTopics.includes(t.id));

            return (
              <div key={domain.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{domain.id}. {domain.titleJa}</span>
                  <span className="text-sm text-muted-foreground">
                    教科書: {topicsCompleted.length}/{domain.topics.length} | 問題: {correct.length}/{attempted.length}/{domainQuestions.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${domainQuestions.length > 0 ? (attempted.length / domainQuestions.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {examResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>試験履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...examResults].reverse().map(result => (
                <Link key={result.id} href={`/results/${result.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                    <div>
                      <span className="text-sm">{formatDate(result.date)}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{result.mode === "exam" ? "模擬試験" : "演習"}</span>
                    </div>
                    <span className={`font-medium ${result.passed ? "text-success" : "text-destructive"}`}>
                      {result.score} 点
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={handleReset}>
          学習データをリセット
        </Button>
      </div>
    </div>
  );
}
