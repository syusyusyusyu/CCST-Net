"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateSR, getLocalDateString, createInitialSRState } from "@/lib/utils/spaced-repetition";

interface QuestionStat {
  totalAttempts: number;
  correctCount: number;
  lastAttemptDate: string;
  lastResult: boolean;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

export interface ExamResult {
  id: string;
  date: string;
  mode: "study" | "exam";
  totalQuestions: number;
  correctCount: number;
  score: number;
  passed: boolean;
  timeSpent: number;
  domainScores: Record<number, { correct: number; total: number }>;
  answers: Record<string, string[]>;
}

interface ProgressStore {
  questionStats: Record<string, QuestionStat>;
  examResults: ExamResult[];
  textbookProgress: {
    completedTopics: string[];
  };
  bookmarkedQuestions: string[];
  streakDays: number;
  lastStudyDate: string;
  totalStudyTime: number;

  recordAnswer: (questionId: string, isCorrect: boolean) => void;
  saveExamResult: (result: ExamResult) => void;
  markTopicComplete: (topicId: string) => void;
  unmarkTopicComplete: (topicId: string) => void;
  toggleBookmark: (questionId: string) => void;
  updateStudyTime: (seconds: number) => void;
  resetAllProgress: () => void;
}

function updateStreak(streakDays: number, lastStudyDate: string): { streakDays: number; lastStudyDate: string } {
  const today = getLocalDateString();
  if (lastStudyDate === today) {
    return { streakDays, lastStudyDate: today };
  }
  if (lastStudyDate === "") {
    return { streakDays: 1, lastStudyDate: today };
  }
  const lastDateObj = new Date(lastStudyDate + "T00:00:00");
  const todayObj = new Date(today + "T00:00:00");
  const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (86400 * 1000));
  if (diffDays === 1) {
    return { streakDays: streakDays + 1, lastStudyDate: today };
  }
  return { streakDays: 1, lastStudyDate: today };
}

const initialState = {
  questionStats: {} as Record<string, QuestionStat>,
  examResults: [] as ExamResult[],
  textbookProgress: { completedTopics: [] as string[] },
  bookmarkedQuestions: [] as string[],
  streakDays: 0,
  lastStudyDate: "",
  totalStudyTime: 0,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordAnswer: (questionId, isCorrect) => {
        const state = get();
        const existing = state.questionStats[questionId];
        const srState = existing
          ? { easeFactor: existing.easeFactor, interval: existing.interval, repetitions: existing.repetitions, nextReviewDate: existing.nextReviewDate }
          : createInitialSRState();
        const newSR = updateSR(srState, isCorrect);
        const streak = updateStreak(state.streakDays, state.lastStudyDate);

        set({
          questionStats: {
            ...state.questionStats,
            [questionId]: {
              totalAttempts: (existing?.totalAttempts ?? 0) + 1,
              correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
              lastAttemptDate: new Date().toISOString(),
              lastResult: isCorrect,
              ...newSR,
            },
          },
          streakDays: streak.streakDays,
          lastStudyDate: streak.lastStudyDate,
        });
      },

      saveExamResult: (result) => {
        set(state => ({
          examResults: [...state.examResults, result],
        }));
      },

      markTopicComplete: (topicId) => {
        const state = get();
        if (state.textbookProgress.completedTopics.includes(topicId)) return;
        const streak = updateStreak(state.streakDays, state.lastStudyDate);
        set({
          textbookProgress: {
            ...state.textbookProgress,
            completedTopics: [...state.textbookProgress.completedTopics, topicId],
          },
          streakDays: streak.streakDays,
          lastStudyDate: streak.lastStudyDate,
        });
      },

      unmarkTopicComplete: (topicId) => {
        set(state => ({
          textbookProgress: {
            ...state.textbookProgress,
            completedTopics: state.textbookProgress.completedTopics.filter(id => id !== topicId),
          },
        }));
      },

      toggleBookmark: (questionId) => {
        set(state => ({
          bookmarkedQuestions: state.bookmarkedQuestions.includes(questionId)
            ? state.bookmarkedQuestions.filter(id => id !== questionId)
            : [...state.bookmarkedQuestions, questionId],
        }));
      },

      updateStudyTime: (seconds) => {
        set(state => ({ totalStudyTime: state.totalStudyTime + seconds }));
      },

      resetAllProgress: () => {
        set(initialState);
      },
    }),
    {
      name: "ccst-progress",
      version: 1,
    }
  )
);
