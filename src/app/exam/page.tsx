"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizStore } from "@/lib/store/quiz-store";
import { useProgressStore } from "@/lib/store/progress-store";
import { getAllQuestions } from "@/lib/utils/load-questions";
import { selectExamQuestions } from "@/lib/utils/exam-generator";
import { EXAM_TIME_LIMIT_SECONDS, EXAM_QUESTION_COUNT } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export default function ExamPage() {
  const router = useRouter();
  const startSession = useQuizStore(s => s.startSession);
  const examResults = useProgressStore(s => s.examResults);

  const recentExams = examResults
    .filter(r => r.mode === "exam")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const handleStart = () => {
    const allQuestions = getAllQuestions();
    const questions = selectExamQuestions(allQuestions);
    startSession("exam", questions, EXAM_TIME_LIMIT_SECONDS);
    router.push("/exam/session");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">模擬試験</h1>
        <p className="mt-2 text-muted-foreground">本番と同じ条件で出題されます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>試験情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">出題数</span>
            <span className="font-medium">{EXAM_QUESTION_COUNT} 問</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">制限時間</span>
            <span className="font-medium">50 分</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">合格ライン</span>
            <span className="font-medium">750 / 1000 点</span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            ※ ブラウザを閉じると進捗は失われます。本番と同じ緊張感で取り組みましょう。
          </p>
        </CardContent>
      </Card>

      {recentExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">直近の結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentExams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatDate(exam.date)}</span>
                  <span className={exam.passed ? "font-medium text-success" : "font-medium text-destructive"}>
                    {exam.score} 点 {exam.passed ? "(合格)" : "(不合格)"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleStart} className="w-full" size="lg">
        模擬試験を開始
      </Button>
    </div>
  );
}
