import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import domains from "@/data/domains.json";
import { TextbookDetail } from "./textbook-detail";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

function findTopic(topicId: string) {
  const dotId = topicId.replace("-", ".");
  for (const domain of domains) {
    const topic = domain.topics.find(t => t.id === dotId);
    if (topic) return { domain, topic };
  }
  return null;
}

function getAdjacentTopics(topicId: string) {
  const allTopics = domains.flatMap(d => d.topics);
  const dotId = topicId.replace("-", ".");
  const idx = allTopics.findIndex(t => t.id === dotId);
  return {
    prev: idx > 0 ? allTopics[idx - 1] : null,
    next: idx < allTopics.length - 1 ? allTopics[idx + 1] : null,
  };
}

export default async function TextbookTopicPage({ params }: PageProps) {
  const { topicId } = await params;
  const result = findTopic(topicId);
  if (!result) notFound();

  const { domain, topic } = result;
  const mdPath = path.join(process.cwd(), "src/data/textbook", `topic-${topicId}.md`);

  let content = "このトピックは準備中です。";
  try {
    const raw = fs.readFileSync(mdPath, "utf-8");
    if (raw.trim()) {
      content = raw;
    }
  } catch {
    // file doesn't exist
  }

  const { prev, next } = getAdjacentTopics(topicId);

  return (
    <TextbookDetail
      topicId={topic.id}
      title={topic.title}
      titleEn={topic.titleEn}
      domainTitle={domain.titleJa}
      domainId={domain.id}
      markdownContent={content}
      prevTopic={prev}
      nextTopic={next}
    />
  );
}

export function generateStaticParams() {
  return domains.flatMap(d =>
    d.topics.map(t => ({ topicId: t.id.replace(".", "-") }))
  );
}
