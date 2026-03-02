"use client";

import { create } from "zustand";
import type { Question } from "@/lib/schemas/question-schema";

type SessionMode = "study" | "exam";
type QuizPhase = "answering" | "answered" | "reviewing" | "complete";

export interface QuizSession {
  mode: SessionMode;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string[]>;
  dndAnswers: Record<string, string[]>;
  flaggedQuestions: string[];
  phase: QuizPhase;
  startedAt: number;
  timeLimit: number | null;
  correctCount: number;
}

interface QuizStore {
  session: QuizSession | null;
  startSession: (mode: SessionMode, questions: Question[], timeLimit: number | null) => void;
  selectAnswer: (questionId: string, answerIds: string[]) => void;
  selectDndAnswer: (questionId: string, orderedIds: string[]) => void;
  confirmAnswer: () => void;
  showExplanation: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  toggleFlag: (questionId: string) => void;
  submitExam: () => { correctCount: number; totalQuestions: number; answers: Record<string, string[]>; dndAnswers: Record<string, string[]> } | null;
  resetSession: () => void;
}

function checkAnswer(question: Question, answers: string[], dndAnswers: string[]): boolean {
  if (question.type === "drag-and-drop") {
    if (!question.correctOrder) return false;
    return dndAnswers.every((id, i) => id === question.correctOrder![i]);
  }
  if (!question.correctAnswers) return false;
  if (question.type === "single-choice") {
    return answers[0] === question.correctAnswers[0];
  }
  // multiple-choice
  return (
    answers.length === question.correctAnswers.length &&
    answers.every(a => question.correctAnswers!.includes(a))
  );
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  session: null,

  startSession: (mode, questions, timeLimit) => {
    set({
      session: {
        mode,
        questions,
        currentIndex: 0,
        answers: {},
        dndAnswers: {},
        flaggedQuestions: [],
        phase: "answering",
        startedAt: Date.now(),
        timeLimit,
        correctCount: 0,
      },
    });
  },

  selectAnswer: (questionId, answerIds) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        answers: { ...session.answers, [questionId]: answerIds },
      },
    });
  },

  selectDndAnswer: (questionId, orderedIds) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        dndAnswers: { ...session.dndAnswers, [questionId]: orderedIds },
      },
    });
  },

  confirmAnswer: () => {
    const { session } = get();
    if (!session || session.phase !== "answering") return;
    const question = session.questions[session.currentIndex];
    const answers = session.answers[question.id] ?? [];
    const dndAnswers = session.dndAnswers[question.id] ?? [];
    const isCorrect = checkAnswer(question, answers, dndAnswers);

    set({
      session: {
        ...session,
        phase: session.mode === "exam" ? "answering" : "answered",
        correctCount: isCorrect ? session.correctCount + 1 : session.correctCount,
      },
    });

    // 模擬試験モードでは自動的に次へ進まない (ナビゲーターで自由に移動)
    if (session.mode === "exam") return;

    return isCorrect;
  },

  showExplanation: () => {
    const { session } = get();
    if (!session || session.phase !== "answered") return;
    set({ session: { ...session, phase: "reviewing" } });
  },

  nextQuestion: () => {
    const { session } = get();
    if (!session) return;
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      set({ session: { ...session, phase: "complete" } });
      return;
    }
    set({
      session: {
        ...session,
        currentIndex: nextIndex,
        phase: "answering",
      },
    });
  },

  prevQuestion: () => {
    const { session } = get();
    if (!session || session.currentIndex === 0) return;
    set({
      session: {
        ...session,
        currentIndex: session.currentIndex - 1,
        phase: session.mode === "study" ? "reviewing" : "answering",
      },
    });
  },

  jumpToQuestion: (index) => {
    const { session } = get();
    if (!session || index < 0 || index >= session.questions.length) return;
    set({
      session: {
        ...session,
        currentIndex: index,
        phase: "answering",
      },
    });
  },

  toggleFlag: (questionId) => {
    const { session } = get();
    if (!session) return;
    const flagged = session.flaggedQuestions.includes(questionId)
      ? session.flaggedQuestions.filter(id => id !== questionId)
      : [...session.flaggedQuestions, questionId];
    set({ session: { ...session, flaggedQuestions: flagged } });
  },

  submitExam: () => {
    const { session } = get();
    if (!session) return null;

    let correctCount = 0;
    for (const question of session.questions) {
      const answers = session.answers[question.id] ?? [];
      const dndAnswers = session.dndAnswers[question.id] ?? [];
      if (checkAnswer(question, answers, dndAnswers)) {
        correctCount++;
      }
    }

    set({ session: { ...session, phase: "complete", correctCount } });
    return {
      correctCount,
      totalQuestions: session.questions.length,
      answers: session.answers,
      dndAnswers: session.dndAnswers,
    };
  },

  resetSession: () => {
    set({ session: null });
  },
}));
