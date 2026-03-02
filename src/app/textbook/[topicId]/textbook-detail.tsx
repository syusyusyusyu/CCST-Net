"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgressStore } from "@/lib/store/progress-store";

interface TextbookDetailProps {
  topicId: string;
  title: string;
  titleEn: string;
  domainTitle: string;
  domainId: number;
  markdownContent: string;
  prevTopic: { id: string; title: string } | null;
  nextTopic: { id: string; title: string } | null;
}

function renderMarkdown(content: string): string {
  let html = content;

  // Remove custom components — render as styled HTML
  // <KeyTerm term="X" reading="Y">definition</KeyTerm> → <strong>X</strong>
  html = html.replace(/<KeyTerm\s+term="([^"]+)"[^>]*>([^<]*)<\/KeyTerm>/g,
    '<strong class="text-primary border-b border-dashed border-primary">$1</strong>');

  // <KeyPoint>content</KeyPoint> → styled box
  html = html.replace(/<KeyPoint>([\s\S]*?)<\/KeyPoint>/g,
    '<div class="my-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4"><p class="mb-2 text-sm font-bold text-blue-600 dark:text-blue-400">ここがポイント</p><div class="text-sm leading-relaxed">$1</div></div>');

  // <Figure .../> → skip (no images yet)
  html = html.replace(/<Figure[^/]*\/>/g, '');

  // Convert markdown headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="mb-3 mt-6 text-xl font-bold">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="mb-4 mt-8 border-b pb-2 text-2xl font-bold">$1</h2>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono">$1</code>');

  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g, (match, header, body) => {
    const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
    const rows = body.trim().split('\n').map((row: string) =>
      row.split('|').map((c: string) => c.trim()).filter(Boolean)
    );
    let table = '<div class="my-4 overflow-x-auto"><table class="w-full border-collapse text-sm"><thead><tr>';
    for (const h of headers) {
      table += `<th class="border bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left font-bold">${h}</th>`;
    }
    table += '</tr></thead><tbody>';
    for (const row of rows) {
      table += '<tr>';
      for (const cell of row) {
        table += `<td class="border px-3 py-2">${cell}</td>`;
      }
      table += '</tr>';
    }
    table += '</tbody></table></div>';
    return table;
  });

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="leading-relaxed ml-6 list-disc">$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="mb-4 space-y-1">$1</ul>');

  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="leading-relaxed ml-6 list-decimal">$1</li>');

  // Paragraphs (lines that aren't tags)
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
    } else if (trimmed.startsWith('<')) {
      result.push(line);
    } else {
      result.push(`<p class="mb-4 leading-relaxed">${trimmed}</p>`);
    }
  }

  return result.join('\n');
}

export function TextbookDetail({
  topicId,
  title,
  titleEn,
  domainTitle,
  domainId,
  markdownContent,
  prevTopic,
  nextTopic,
}: TextbookDetailProps) {
  const { textbookProgress, markTopicComplete, unmarkTopicComplete } = useProgressStore();
  const isCompleted = textbookProgress.completedTopics.includes(topicId);

  const htmlContent = renderMarkdown(markdownContent);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/textbook" className="hover:text-foreground">教科書</Link>
          <span>/</span>
          <Badge variant="outline">Domain {domainId}</Badge>
          <span>{domainTitle}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-muted-foreground">{titleEn}</p>
      </div>

      <article
        className="max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      <div className="mt-8 flex flex-col gap-4 border-t pt-6">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <>
              <span className="text-sm font-medium text-success">読了済み</span>
              <Button variant="outline" size="sm" onClick={() => unmarkTopicComplete(topicId)}>
                未読に戻す
              </Button>
            </>
          ) : (
            <Button onClick={() => markTopicComplete(topicId)}>
              読了にする
            </Button>
          )}
        </div>

        <Link href={`/study?topic=${topicId}`}>
          <Button variant="outline" className="w-full sm:w-auto">
            このトピックの問題を解く →
          </Button>
        </Link>

        <div className="flex justify-between">
          {prevTopic ? (
            <Link href={`/textbook/${prevTopic.id.replace(".", "-")}`} className="text-sm text-primary hover:underline">
              ← {prevTopic.title}
            </Link>
          ) : <span />}
          {nextTopic ? (
            <Link href={`/textbook/${nextTopic.id.replace(".", "-")}`} className="text-sm text-primary hover:underline">
              {nextTopic.title} →
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
