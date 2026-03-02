"use client";

import Link from "next/link";
import type { Question } from "@/lib/schemas/question-schema";

interface AnswerFeedbackProps {
  question: Question;
  isCorrect: boolean;
  userAnswers: string[];
}

export function AnswerFeedback({ question, isCorrect, userAnswers }: AnswerFeedbackProps) {
  return (
    <div className="mt-4 space-y-3">
      <div role="alert" aria-live="assertive" className={`rounded-lg p-3 text-sm font-medium ${
        isCorrect
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      }`}>
        {isCorrect ? "✓ 正解！" : "✕ 不正解"}
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="mb-2 text-sm font-medium">解説</p>
        <p className="text-sm leading-relaxed">{question.explanation}</p>

        {!isCorrect && question.explanationWrong && (
          <div className="mt-3 space-y-2">
            {userAnswers
              .filter(a => !question.correctAnswers?.includes(a))
              .map(a => {
                const wrongExplanation = question.explanationWrong?.[a];
                if (!wrongExplanation) return null;
                const optionText = question.options?.find(o => o.id === a)?.text;
                return (
                  <div key={a} className="text-sm">
                    <span className="font-medium text-destructive">{optionText}:</span>{" "}
                    <span className="text-muted-foreground">{wrongExplanation}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {question.relatedTopicIds && question.relatedTopicIds.length > 0 && (
        <div className="text-sm">
          <span className="text-muted-foreground">関連トピック: </span>
          {question.relatedTopicIds.map((tid, i) => (
            <span key={tid}>
              {i > 0 && ", "}
              <Link href={`/textbook/${tid.replace(".", "-")}`} className="text-primary hover:underline">
                {tid}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
