"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import glossaryData from "@/data/glossary.json";
import type { GlossaryEntry } from "@/lib/schemas/glossary-schema";

type SortMode = "abc" | "aiueo";

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("abc");

  const entries = glossaryData as GlossaryEntry[];

  const filtered = useMemo(() => {
    if (!search) return entries;
    const lower = search.toLowerCase();
    return entries.filter(
      e => e.term.toLowerCase().includes(lower) || e.termJa.includes(search) || e.reading.includes(search)
    );
  }, [entries, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, GlossaryEntry[]>();
    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "abc") return a.term.localeCompare(b.term);
      return a.reading.localeCompare(b.reading);
    });
    for (const entry of sorted) {
      const key = sortMode === "abc"
        ? entry.term[0]?.toUpperCase() ?? "#"
        : getKanaGroup(entry.reading);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }
    return groups;
  }, [filtered, sortMode]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用語集</h1>
        <p className="mt-2 text-muted-foreground">CCST Networking の重要用語</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="用語を検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <div className="flex gap-1">
          <Button variant={sortMode === "abc" ? "default" : "outline"} size="sm" onClick={() => setSortMode("abc")}>
            ABC順
          </Button>
          <Button variant={sortMode === "aiueo" ? "default" : "outline"} size="sm" onClick={() => setSortMode("aiueo")}>
            あいうえお順
          </Button>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([group, items]) => (
        <div key={group}>
          <h2 className="mb-2 text-lg font-bold text-primary">{group}</h2>
          <Accordion type="multiple">
            {items.map(entry => (
              <AccordionItem key={entry.id} value={entry.id}>
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{entry.term}</span>
                    <span className="text-muted-foreground">({entry.termJa})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2 text-sm">{entry.definition}</p>
                  {entry.relatedTopicIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.relatedTopicIds.map(tid => (
                        <Link key={tid} href={`/textbook/${tid.replace(".", "-")}`} className="text-xs text-primary hover:underline">
                          {tid}
                        </Link>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            該当する用語がありません
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getKanaGroup(reading: string): string {
  const first = reading[0];
  if (!first) return "#";
  const groups: Record<string, string> = {
    あ: "あ行", い: "あ行", う: "あ行", え: "あ行", お: "あ行",
    か: "か行", き: "か行", く: "か行", け: "か行", こ: "か行",
    さ: "さ行", し: "さ行", す: "さ行", せ: "さ行", そ: "さ行",
    た: "た行", ち: "た行", つ: "た行", て: "た行", と: "た行",
    な: "な行", に: "な行", ぬ: "な行", ね: "な行", の: "な行",
    は: "は行", ひ: "は行", ふ: "は行", へ: "は行", ほ: "は行",
    ま: "ま行", み: "ま行", む: "ま行", め: "ま行", も: "ま行",
    や: "や行", ゆ: "や行", よ: "や行",
    ら: "ら行", り: "ら行", る: "ら行", れ: "ら行", ろ: "ら行",
    わ: "わ行", を: "わ行", ん: "わ行",
    が: "か行", ぎ: "か行", ぐ: "か行", げ: "か行", ご: "か行",
    ざ: "さ行", じ: "さ行", ず: "さ行", ぜ: "さ行", ぞ: "さ行",
    だ: "た行", ぢ: "た行", づ: "た行", で: "た行", ど: "た行",
    ば: "は行", び: "は行", ぶ: "は行", べ: "は行", ぼ: "は行",
    ぱ: "は行", ぴ: "は行", ぷ: "は行", ぺ: "は行", ぽ: "は行",
  };
  return groups[first] ?? "#";
}
