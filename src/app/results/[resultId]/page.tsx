"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgressStore } from "@/lib/store/progress-store";
import { getAllQuestions } from "@/lib/utils/load-questions";
import { formatDate } from "@/lib/utils/format";
import domains from "@/data/domains.json";

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const examResults = useProgressStore(s => s.examResults);
  const result = examResults.find(r => r.id === resultId);
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect" | "correct">("all");

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h1 className="text-2xl font-bold">結果が見つかりません</h1>
        <p className="mt-2 text-muted-foreground">この結果は存在しないか、削除されました。</p>
        <Link href="/">
          <Button className="mt-4">ホームに戻る</Button>
        </Link>
      </div>
    );
  }

  const allQuestions = getAllQuestions();
  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);

  // 各問題の正誤判定
  const questionResults = allQuestions
    .filter(q => result.answers[q.id] !== undefined)
    .map(q => {
      const userAnswers = result.answers[q.id] ?? [];
      let isCorrect = false;
      if (q.type === "single-choice") {
        isCorrect = userAnswers[0] === q.correctAnswers?.[0];
      } else if (q.type === "multiple-choice") {
        isCorrect = userAnswers.length === (q.correctAnswers?.length ?? 0) && userAnswers.every(a => q.correctAnswers?.includes(a));
      }
      return { question: q, userAnswers, isCorrect };
    });

  const filteredResults = questionResults.filter(r => {
    if (reviewFilter === "incorrect") return !r.isCorrect;
    if (reviewFilter === "correct") return r.isCorrect;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Score banner */}
      <Card className={result.passed ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}>
        <CardContent className="py-8 text-center">
          <h1 className="text-3xl font-bold">{result.passed ? "合格！" : "不合格"}</h1>
          <p className="mt-4 text-5xl font-bold">{result.score} <span className="text-2xl text-muted-foreground">/ 1000</span></p>
          <p className="mt-2 text-muted-foreground">
            {result.correctCount} / {result.totalQuestions} 問正解 (正答率 {accuracy}%)
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(result.date)}</p>
        </CardContent>
      </Card>

      {/* Domain scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ドメイン別スコア</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(result.domainScores).map(([domainId, scores]) => {
            const domain = domains.find(d => d.id === Number(domainId));
            const pct = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
            return (
              <div key={domainId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{domain?.titleJa ?? `Domain ${domainId}`}</span>
                  <span className="font-medium">{scores.correct}/{scores.total} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/exam">
          <Button>もう一度受験する</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>

      {/* Review */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setReviewFilter("all")}>すべて ({questionResults.length})</TabsTrigger>
          <TabsTrigger value="incorrect" onClick={() => setReviewFilter("incorrect")}>不正解のみ ({questionResults.filter(r => !r.isCorrect).length})</TabsTrigger>
          <TabsTrigger value="correct" onClick={() => setReviewFilter("correct")}>正解のみ ({questionResults.filter(r => r.isCorrect).length})</TabsTrigger>
        </TabsList>
        <TabsContent value={reviewFilter} className="mt-4 space-y-4">
          {filteredResults.map(({ question, userAnswers, isCorrect }) => (
            <Card key={question.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "bg-success" : ""}>
                    {isCorrect ? "✓" : "✕"}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">{question.text}</p>
                    {question.options && (
                      <div className="space-y-1">
                        {question.options.map(opt => (
                          <div key={opt.id} className={`text-sm rounded px-2 py-1 ${
                            question.correctAnswers?.includes(opt.id) ? "bg-success/10 text-success" :
                            userAnswers.includes(opt.id) ? "bg-destructive/10 text-destructive" : ""
                          }`}>
                            {opt.text}
                            {userAnswers.includes(opt.id) && " (あなたの回答)"}
                            {question.correctAnswers?.includes(opt.id) && " (正解)"}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    {question.relatedTopicIds?.map(tid => (
                      <Link key={tid} href={`/textbook/${tid.replace(".", "-")}`} className="text-sm text-primary hover:underline">
                        教科書で復習: {tid}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
