"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { KeyTerm } from "./key-term-tooltip";
import { KeyPoint } from "./key-point-box";

const mdxComponents = {
  KeyTerm,
  KeyPoint,
  Figure: ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/images/${src}`} alt={alt} className="mx-auto max-w-full rounded-lg" />
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-4 mt-8 border-b pb-2 text-2xl font-bold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-3 mt-6 text-xl font-bold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 ml-6 list-disc space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border bg-muted px-3 py-2 text-left font-bold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border px-3 py-2" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold" {...props} />
  ),
};

interface TopicContentProps {
  mdxSource: MDXRemoteSerializeResult;
}

export function TopicContent({ mdxSource }: TopicContentProps) {
  return (
    <article className="prose-custom max-w-none">
      <MDXRemote {...mdxSource} components={mdxComponents} />
    </article>
  );
}
