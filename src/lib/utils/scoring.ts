import { MIN_SCORE, MAX_SCORE, PASSING_SCORE } from "@/lib/constants";

export function calculateScore(correctCount: number, totalQuestions: number): number {
  const ratio = correctCount / totalQuestions;
  return Math.round(MIN_SCORE + ratio * (MAX_SCORE - MIN_SCORE));
}

export function isPassed(score: number): boolean {
  return score >= PASSING_SCORE;
}
