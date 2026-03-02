import { SR_INITIAL_EASE_FACTOR, SR_MIN_EASE_FACTOR } from "@/lib/constants";

export interface SRState {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

export function createInitialSRState(): SRState {
  return {
    easeFactor: SR_INITIAL_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: getLocalDateString(),
  };
}

export function updateSR(state: SRState, isCorrect: boolean): SRState {
  const quality = isCorrect ? 4 : 1;
  let { easeFactor, interval, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(SR_MIN_EASE_FACTOR, easeFactor);

  const next = new Date();
  next.setDate(next.getDate() + interval);
  const nextReviewDate = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;

  return { easeFactor, interval, repetitions, nextReviewDate };
}

export function getLocalDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getReviewDueQuestions(
  questionStats: Record<string, { totalAttempts: number; nextReviewDate: string }>,
  today: string
): string[] {
  return Object.entries(questionStats)
    .filter(([, stat]) => {
      if (stat.totalAttempts === 0) return false;
      return stat.nextReviewDate <= today;
    })
    .map(([id]) => id);
}
