"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { DomainRadarChart } from "@/components/dashboard/domain-radar-chart";
import { ScoreTrendChart } from "@/components/dashboard/score-trend-chart";
import { WeakTopics } from "@/components/dashboard/weak-topics";
import { useProgressStore } from "@/lib/store/progress-store";
import { getAllQuestions } from "@/lib/utils/load-questions";
import { TOTAL_TOPICS, WEAK_TOPIC_MIN_ATTEMPTS, WEAK_TOPIC_COUNT } from "@/lib/constants";
import domains from "@/data/domains.json";
import { useMemo } from "react";

export default function DashboardPage() {
  const { questionStats, examResults, textbookProgress, streakDays } = useProgressStore();
  const allQuestions = useMemo(() => getAllQuestions(), []);

  const textbookRatio = textbookProgress.completedTopics.length / TOTAL_TOPICS;
  const attemptedQuestions = Object.keys(questionStats).filter(id => questionStats[id].totalAttempts > 0).length;
  const questionRatio = allQuestions.length > 0 ? attemptedQuestions / allQuestions.length : 0;
  const overallProgress = Math.round((textbookRatio * 0.5 + questionRatio * 0.5) * 100);

  const domainAccuracies = useMemo(() => {
    const result: Record<number, number> = {};
    for (const domain of domains) {
      const domainQuestions = allQuestions.filter(q => q.domainId === domain.id);
      const attempted = domainQuestions.filter(q => questionStats[q.id]?.totalAttempts > 0);
      if (attempted.length === 0) {
        result[domain.id] = 0;
        continue;
      }
      const correct = attempted.filter(q => questionStats[q.id]?.correctCount > 0).length;
      result[domain.id] = Math.round((correct / attempted.length) * 100);
    }
    return result;
  }, [allQuestions, questionStats]);

  const weakTopics = useMemo(() => {
    const topicStats = new Map<string, { correct: number; total: number }>();
    for (const question of allQuestions) {
      const stat = questionStats[question.id];
      if (!stat || stat.totalAttempts === 0) continue;
      const existing = topicStats.get(question.topicId) ?? { correct: 0, total: 0 };
      existing.total += 1;
      if (stat.lastResult) existing.correct += 1;
      topicStats.set(question.topicId, existing);
    }
    return Array.from(topicStats.entries())
      .filter(([, s]) => s.total >= WEAK_TOPIC_MIN_ATTEMPTS)
      .map(([topicId, s]) => ({
        topicId,
        accuracy: Math.round((s.correct / s.total) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, WEAK_TOPIC_COUNT);
  }, [allQuestions, questionStats]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">CCST Networking 試験対策</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/textbook">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex flex-col items-center gap-2 py-4">
              <span className="text-2xl">📖</span>
              <span className="text-sm font-medium">教科書</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/study">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex flex-col items-center gap-2 py-4">
              <span className="text-2xl">✏️</span>
              <span className="text-sm font-medium">問題演習</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/exam">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex flex-col items-center gap-2 py-4">
              <span className="text-2xl">📝</span>
              <span className="text-sm font-medium">模擬試験</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/review">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex flex-col items-center gap-2 py-4">
              <span className="text-2xl">🔄</span>
              <span className="text-sm font-medium">復習</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StreakCounter streakDays={streakDays} />

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">全体進捗</p>
            <p className="mt-1 text-2xl font-bold">{overallProgress}%</p>
            <Progress value={overallProgress} className="mt-2 h-2" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>教科書: {textbookProgress.completedTopics.length}/{TOTAL_TOPICS}</span>
              <span>問題: {attemptedQuestions}/{allQuestions.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">模擬試験</p>
            {examResults.filter(r => r.mode === "exam").length > 0 ? (
              <>
                <p className="mt-1 text-2xl font-bold">
                  {examResults.filter(r => r.mode === "exam").slice(-1)[0]?.score ?? "-"} 点
                </p>
                <p className="text-xs text-muted-foreground">
                  受験回数: {examResults.filter(r => r.mode === "exam").length}回
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">まだ受験していません</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DomainRadarChart domainAccuracies={domainAccuracies} />
        <ScoreTrendChart examResults={examResults} />
      </div>

      <WeakTopics weakTopics={weakTopics} />
    </div>
  );
}
