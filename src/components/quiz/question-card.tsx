"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SingleChoice } from "./single-choice";
import { MultipleChoice } from "./multiple-choice";
import { DragAndDrop } from "./drag-and-drop";
import { AnswerFeedback } from "./answer-feedback";
import type { Question } from "@/lib/schemas/question-schema";
import { useProgressStore } from "@/lib/store/progress-store";

interface QuestionCardProps {
  question: Question;
  onNext: () => void;
  onPrev?: () => void;
  showNavigation?: boolean;
  isLast?: boolean;
  mode?: "study" | "exam";
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function QuestionCard({
  question,
  onNext,
  onPrev,
  showNavigation = true,
  isLast = false,
  mode = "study",
  bookmarked = false,
  onToggleBookmark,
}: QuestionCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [dndOrder, setDndOrder] = useState<string[]>(
    question.type === "drag-and-drop" && question.dragItems && !question.dropZones
      ? question.dragItems.map(i => i.id)
      : []
  );
  const [phase, setPhase] = useState<"answering" | "answered" | "reviewing">("answering");
  const [isCorrect, setIsCorrect] = useState(false);
  const recordAnswer = useProgressStore(s => s.recordAnswer);

  const handleConfirm = () => {
    let correct = false;
    if (question.type === "drag-and-drop") {
      correct = question.correctOrder?.every((id, i) => dndOrder[i] === id) ?? false;
    } else if (question.type === "single-choice") {
      correct = selectedAnswers[0] === question.correctAnswers?.[0];
    } else {
      correct = (
        selectedAnswers.length === (question.correctAnswers?.length ?? 0) &&
        selectedAnswers.every(a => question.correctAnswers?.includes(a))
      );
    }
    setIsCorrect(correct);
    setPhase("answered");
    recordAnswer(question.id, correct);

    if (mode === "study") {
      // 自動的に解説表示
      setTimeout(() => setPhase("reviewing"), 100);
    }
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setDndOrder([]);
    setPhase("answering");
    setIsCorrect(false);
    onNext();
  };

  const canConfirm = () => {
    if (question.type === "single-choice") return selectedAnswers.length === 1;
    if (question.type === "multiple-choice") return selectedAnswers.length === (question.correctAnswers?.length ?? 0);
    if (question.type === "drag-and-drop") {
      if (question.dropZones) {
        return dndOrder.length === question.dragItems?.length && dndOrder.every(id => id !== "");
      }
      return dndOrder.length === (question.dragItems?.length ?? 0);
    }
    return false;
  };

  const handleToggleMultiple = (id: string) => {
    setSelectedAnswers(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const showResult = phase === "answered" || phase === "reviewing";
  const difficultyColors: Record<string, string> = {
    easy: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    hard: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={difficultyColors[question.difficulty]}>
              {question.difficulty === "easy" ? "初級" : question.difficulty === "medium" ? "中級" : "上級"}
            </Badge>
            {question.type === "multiple-choice" && (
              <Badge variant="outline">
                {question.correctAnswers?.length}つ選択
              </Badge>
            )}
            {question.type === "drag-and-drop" && (
              <Badge variant="outline">
                {question.dropZones ? "マッチング" : "並べ替え"}
              </Badge>
            )}
          </div>
          {onToggleBookmark && (
            <Button variant="ghost" size="sm" onClick={onToggleBookmark} aria-label="ブックマーク">
              {bookmarked ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-warning"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              )}
            </Button>
          )}
        </div>
        <h2 className="text-lg font-medium leading-relaxed">{question.text}</h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {question.type === "single-choice" && question.options && (
          <SingleChoice
            options={question.options}
            selected={selectedAnswers[0] ?? null}
            correctAnswer={showResult ? question.correctAnswers?.[0] : undefined}
            showResult={showResult}
            onSelect={(id) => setSelectedAnswers([id])}
            disabled={showResult}
          />
        )}

        {question.type === "multiple-choice" && question.options && (
          <MultipleChoice
            options={question.options}
            selected={selectedAnswers}
            correctAnswers={showResult ? question.correctAnswers : undefined}
            showResult={showResult}
            onToggle={handleToggleMultiple}
            disabled={showResult}
            requiredCount={question.correctAnswers?.length ?? 0}
          />
        )}

        {question.type === "drag-and-drop" && question.dragItems && (
          <DragAndDrop
            dragItems={question.dragItems}
            dropZones={question.dropZones}
            correctOrder={showResult ? question.correctOrder : undefined}
            currentOrder={dndOrder}
            showResult={showResult}
            onOrderChange={setDndOrder}
            disabled={showResult}
          />
        )}

        {mode === "study" && showResult && (
          <AnswerFeedback
            question={question}
            isCorrect={isCorrect}
            userAnswers={selectedAnswers}
          />
        )}

        {showNavigation && (
          <div className="flex items-center justify-between pt-4">
            <div>
              {onPrev && (
                <Button variant="outline" onClick={onPrev}>
                  ← 前の問題
                </Button>
              )}
            </div>
            <div>
              {phase === "answering" && (
                <Button onClick={handleConfirm} disabled={!canConfirm()}>
                  回答する
                </Button>
              )}
              {showResult && (
                <Button onClick={handleNext}>
                  {isLast ? "結果を見る" : "次の問題 →"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
