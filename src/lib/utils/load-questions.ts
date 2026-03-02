import type { Question } from "@/lib/schemas/question-schema";
import domain1 from "@/data/questions/domain-1.json";
import domain2 from "@/data/questions/domain-2.json";
import domain3 from "@/data/questions/domain-3.json";
import domain4 from "@/data/questions/domain-4.json";
import domain5 from "@/data/questions/domain-5.json";
import domain6 from "@/data/questions/domain-6.json";

export function getAllQuestions(): Question[] {
  return [
    ...domain1,
    ...domain2,
    ...domain3,
    ...domain4,
    ...domain5,
    ...domain6,
  ] as Question[];
}

export function getQuestionsByDomain(domainId: number): Question[] {
  const all = getAllQuestions();
  return all.filter(q => q.domainId === domainId);
}

export function getQuestionsByTopic(topicId: string): Question[] {
  const all = getAllQuestions();
  return all.filter(q => q.topicId === topicId);
}

export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find(q => q.id === id);
}
