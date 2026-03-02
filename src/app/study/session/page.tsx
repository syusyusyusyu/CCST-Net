"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store/quiz-store";
import { useProgressStore } from "@/lib/store/progress-store";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuizProgressBar } from "@/components/quiz/quiz-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateScore, isPassed } from "@/lib/utils/scoring";
import Link from "next/link";

export default function StudySessionPage() {
  const router = useRouter();
  const session = useQuizStore(s => s.session);
  const resetSession = useQuizStore(s => s.resetSession);
  const { saveExamResult, bookmarkedQuestions, toggleBookmark } = useProgressStore();

  useEffect(() => {
    if (!session) {
      router.replace("/study");
    }
  }, [session, router]);

  if (!session) return null;

  if (session.phase === "complete") {
    const score = calculateScore(session.correctCount, session.questions.length);
    const passed = isPassed(score);

    const handleSave = () => {
      const domainScores: Record<number, { correct: number; total: number }> = {};
      for (const q of session.questions) {
        if (!domainScores[q.domainId]) domainScores[q.domainId] = { correct: 0, total: 0 };
        domainScores[q.domainId].total++;
        const answers = session.answers[q.id] ?? [];
        const dndAnswers = session.dndAnswers[q.id] ?? [];
        let isCorrect = false;
        if (q.type === "drag-and-drop") {
          isCorrect = q.correctOrder?.every((id, i) => dndAnswers[i] === id) ?? false;
        } else if (q.type === "single-choice") {
          isCorrect = answers[0] === q.correctAnswers?.[0];
        } else {
          isCorrect = answers.length === (q.correctAnswers?.length ?? 0) && answers.every(a => q.correctAnswers?.includes(a));
        }
        if (isCorrect) domainScores[q.domainId].correct++;
      }

      const result = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode: "study" as const,
        totalQuestions: session.questions.length,
        correctCount: session.correctCount,
        score,
        passed,
        timeSpent: Math.floor((Date.now() - session.startedAt) / 1000),
        domainScores,
        answers: session.answers,
      };
      saveExamResult(result);
      resetSession();
      router.push(`/results/${result.id}`);
    };

    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold">学習完了!</h1>
            <p className="mt-4 text-4xl font-bold">{session.correctCount} / {session.questions.length}</p>
            <p className="mt-2 text-muted-foreground">正解</p>
            <p className="mt-4 text-lg">正答率: {Math.round((session.correctCount / session.questions.length) * 100)}%</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={handleSave}>結果を保存</Button>
              <Button variant="outline" onClick={() => { resetSession(); router.push("/study"); }}>
                もう一度
              </Button>
              <Link href="/">
                <Button variant="outline">ホームに戻る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = session.questions[session.currentIndex];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <QuizProgressBar
        current={session.currentIndex}
        total={session.questions.length}
        correctCount={session.correctCount}
      />

      <QuestionCard
        key={question.id}
        question={question}
        onNext={() => {
          if (session.currentIndex === session.questions.length - 1) {
            useQuizStore.getState().nextQuestion();
          } else {
            useQuizStore.getState().nextQuestion();
          }
        }}
        onPrev={session.currentIndex > 0 ? () => useQuizStore.getState().prevQuestion() : undefined}
        isLast={session.currentIndex === session.questions.length - 1}
        mode="study"
        bookmarked={bookmarkedQuestions.includes(question.id)}
        onToggleBookmark={() => toggleBookmark(question.id)}
      />
    </div>
  );
}
