import type { Question } from "@/lib/schemas/question-schema";
import { EXAM_QUESTION_COUNT } from "@/lib/constants";
import { fisherYatesShuffle } from "./shuffle";

const DOMAIN_ALLOCATION: Record<number, number> = {
  1: 9,
  2: 7,
  3: 7,
  4: 9,
  5: 9,
  6: 5,
};

const MAX_PER_TOPIC = 4;

function groupBy<T>(items: T[], keyFn: (item: T) => number): Record<number, T[]> {
  const groups: Record<number, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function selectExamQuestions(allQuestions: Question[]): Question[] {
  const byDomain = groupBy(allQuestions, q => q.domainId);
  const selected: Question[] = [];

  for (const [domainIdStr, count] of Object.entries(DOMAIN_ALLOCATION)) {
    const domainId = Number(domainIdStr);
    const pool = byDomain[domainId] ?? [];
    const shuffled = fisherYatesShuffle([...pool]);

    // トピックごとの偏り防止
    const topicCounts: Record<string, number> = {};
    const domainSelected: Question[] = [];

    for (const q of shuffled) {
      if (domainSelected.length >= count) break;
      const tc = topicCounts[q.topicId] ?? 0;
      if (tc >= MAX_PER_TOPIC) continue;
      domainSelected.push(q);
      topicCounts[q.topicId] = tc + 1;
    }

    selected.push(...domainSelected);
  }

  // 足りない場合は残りからランダム追加
  if (selected.length < EXAM_QUESTION_COUNT) {
    const selectedIds = new Set(selected.map(q => q.id));
    const remaining = fisherYatesShuffle(
      allQuestions.filter(q => !selectedIds.has(q.id))
    );
    for (const q of remaining) {
      if (selected.length >= EXAM_QUESTION_COUNT) break;
      selected.push(q);
    }
  }

  return fisherYatesShuffle(selected);
}
