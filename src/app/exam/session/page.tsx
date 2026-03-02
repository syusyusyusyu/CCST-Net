"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuizStore } from "@/lib/store/quiz-store";
import { useProgressStore } from "@/lib/store/progress-store";
import { useTimer } from "@/lib/hooks/use-timer";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { QuestionNavigator } from "@/components/quiz/question-navigator";
import { ConfirmSubmitDialog } from "@/components/quiz/confirm-submit-dialog";
import { SingleChoice } from "@/components/quiz/single-choice";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import { DragAndDrop } from "@/components/quiz/drag-and-drop";
import { calculateScore, isPassed } from "@/lib/utils/scoring";
import { EXAM_TIME_LIMIT_SECONDS } from "@/lib/constants";

export default function ExamSessionPage() {
  const router = useRouter();
  const session = useQuizStore(s => s.session);
  const selectAnswer = useQuizStore(s => s.selectAnswer);
  const selectDndAnswer = useQuizStore(s => s.selectDndAnswer);
  const jumpToQuestion = useQuizStore(s => s.jumpToQuestion);
  const toggleFlag = useQuizStore(s => s.toggleFlag);
  const submitExam = useQuizStore(s => s.submitExam);
  const resetSession = useQuizStore(s => s.resetSession);
  const saveExamResult = useProgressStore(s => s.saveExamResult);
  const recordAnswer = useProgressStore(s => s.recordAnswer);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!session) return;
    const result = submitExam();
    if (!result) return;

    // 全問の回答を記録
    for (const q of session.questions) {
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
      recordAnswer(q.id, isCorrect);
    }

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

    const score = calculateScore(result.correctCount, result.totalQuestions);
    const examResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mode: "exam" as const,
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      score,
      passed: isPassed(score),
      timeSpent: Math.floor((Date.now() - session.startedAt) / 1000),
      domainScores,
      answers: result.answers,
    };
    saveExamResult(examResult);
    resetSession();
    router.push(`/results/${examResult.id}`);
  }, [session, submitExam, saveExamResult, recordAnswer, resetSession, router]);

  const { remaining } = useTimer({
    initialSeconds: EXAM_TIME_LIMIT_SECONDS,
    onExpire: handleSubmit,
    autoStart: true,
  });

  useEffect(() => {
    if (!session) {
      router.replace("/exam");
      return;
    }

    const handler = (e: BeforeUnloadEvent) => {
      if (session.phase !== "complete") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [session, router]);

  if (!session) return null;

  const question = session.questions[session.currentIndex];
  const answeredIds = Object.keys(session.answers).concat(Object.keys(session.dndAnswers));
  const unansweredCount = session.questions.filter(q =>
    !session.answers[q.id]?.length && !session.dndAnswers[q.id]?.length
  ).length;

  const handleToggleMultiple = (id: string) => {
    const current = session.answers[question.id] ?? [];
    const updated = current.includes(id)
      ? current.filter(a => a !== id)
      : [...current, id];
    selectAnswer(question.id, updated);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Exam header */}
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("試験を中断しますか？回答は保存されません。")) {
                resetSession();
                router.push("/");
              }
            }}
          >
            ✕ 中断
          </Button>
          <span className="text-sm text-muted-foreground">
            問題 {session.currentIndex + 1} / {session.questions.length}
          </span>
        </div>
        <QuizTimer remaining={remaining} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Q{session.currentIndex + 1}</Badge>
                {question.type === "multiple-choice" && (
                  <Badge variant="outline">{question.correctAnswers?.length}つ選択</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(question.id)}
                className={session.flaggedQuestions.includes(question.id) ? "text-warning" : ""}
              >
                {session.flaggedQuestions.includes(question.id) ? "🚩" : "⚑"} フラグ
              </Button>
            </div>
            <h2 className="text-lg font-medium leading-relaxed">{question.text}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === "single-choice" && question.options && (
              <SingleChoice
                options={question.options}
                selected={(session.answers[question.id] ?? [])[0] ?? null}
                showResult={false}
                onSelect={(id) => selectAnswer(question.id, [id])}
              />
            )}

            {question.type === "multiple-choice" && question.options && (
              <MultipleChoice
                options={question.options}
                selected={session.answers[question.id] ?? []}
                showResult={false}
                onToggle={handleToggleMultiple}
                requiredCount={question.correctAnswers?.length ?? 0}
              />
            )}

            {question.type === "drag-and-drop" && question.dragItems && (
              <DragAndDrop
                dragItems={question.dragItems}
                dropZones={question.dropZones}
                currentOrder={session.dndAnswers[question.id] ?? []}
                showResult={false}
                onOrderChange={(order) => selectDndAnswer(question.id, order)}
              />
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => jumpToQuestion(session.currentIndex - 1)}
                disabled={session.currentIndex === 0}
              >
                ← 前
              </Button>
              <div className="flex gap-2">
                {session.currentIndex < session.questions.length - 1 ? (
                  <Button onClick={() => jumpToQuestion(session.currentIndex + 1)}>
                    次 →
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    試験を提出する
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigator (desktop) */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">問題一覧</p>
              <QuestionNavigator
                total={session.questions.length}
                currentIndex={session.currentIndex}
                answeredQuestions={answeredIds}
                flaggedQuestions={session.flaggedQuestions}
                questionIds={session.questions.map(q => q.id)}
                onJump={jumpToQuestion}
              />
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  試験を提出する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmSubmitDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleSubmit}
        unansweredCount={unansweredCount}
      />
    </div>
  );
}
