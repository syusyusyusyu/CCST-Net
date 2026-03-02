"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuizStore } from "@/lib/store/quiz-store";
import { useProgressStore } from "@/lib/store/progress-store";
import { getAllQuestions } from "@/lib/utils/load-questions";
import { fisherYatesShuffle } from "@/lib/utils/shuffle";
import domains from "@/data/domains.json";

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">読み込み中...</div>}>
      <StudyPageContent />
    </Suspense>
  );
}

function StudyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTopic = searchParams.get("topic");

  const [selectedDomains, setSelectedDomains] = useState<number[]>(
    preselectedTopic
      ? [parseInt(preselectedTopic.split(".")[0])]
      : domains.map(d => d.id)
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    preselectedTopic ? [preselectedTopic] : domains.flatMap(d => d.topics.map(t => t.id))
  );
  const [difficulties, setDifficulties] = useState<string[]>(["easy", "medium", "hard"]);
  const [questionFilter, setQuestionFilter] = useState("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [shuffled, setShuffled] = useState(false);

  const allQuestions = useMemo(() => getAllQuestions(), []);
  const { questionStats, bookmarkedQuestions } = useProgressStore();
  const startSession = useQuizStore(s => s.startSession);

  const filteredQuestions = useMemo(() => {
    let qs = allQuestions.filter(q =>
      selectedTopics.includes(q.topicId) &&
      difficulties.includes(q.difficulty)
    );

    if (questionFilter === "unattempted") {
      qs = qs.filter(q => !questionStats[q.id] || questionStats[q.id].totalAttempts === 0);
    } else if (questionFilter === "incorrect") {
      qs = qs.filter(q => questionStats[q.id]?.lastResult === false);
    } else if (questionFilter === "bookmarked") {
      qs = qs.filter(q => bookmarkedQuestions.includes(q.id));
    }

    return qs;
  }, [allQuestions, selectedTopics, difficulties, questionFilter, questionStats, bookmarkedQuestions]);

  const handleStart = () => {
    let questions = [...filteredQuestions];
    if (shuffled) {
      questions = fisherYatesShuffle(questions);
    }
    if (questionCount !== 0) {
      questions = questions.slice(0, questionCount);
    }
    startSession("study", questions, null);
    router.push("/study/session");
  };

  const toggleDomain = (domainId: number) => {
    const domain = domains.find(d => d.id === domainId)!;
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(prev => prev.filter(id => id !== domainId));
      setSelectedTopics(prev => prev.filter(t => !domain.topics.some(dt => dt.id === t)));
    } else {
      setSelectedDomains(prev => [...prev, domainId]);
      setSelectedTopics(prev => [...prev, ...domain.topics.map(t => t.id)]);
    }
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(t => t !== topicId) : [...prev, topicId]
    );
  };

  const toggleDifficulty = (diff: string) => {
    setDifficulties(prev =>
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">問題演習</h1>
        <p className="mt-2 text-muted-foreground">学習する範囲を選択してください</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ドメイン・トピック</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {domains.map(domain => (
            <div key={domain.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDomains.includes(domain.id)}
                  onCheckedChange={() => toggleDomain(domain.id)}
                />
                <Label className="font-medium">
                  {domain.id}. {domain.titleJa}
                </Label>
              </div>
              {selectedDomains.includes(domain.id) && (
                <div className="ml-6 space-y-1">
                  {domain.topics.map(topic => (
                    <div key={topic.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTopics.includes(topic.id)}
                        onCheckedChange={() => toggleTopic(topic.id)}
                      />
                      <Label className="text-sm">{topic.id} {topic.title}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">難易度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {[
              { value: "easy", label: "初級" },
              { value: "medium", label: "中級" },
              { value: "hard", label: "上級" },
            ].map(d => (
              <div key={d.value} className="flex items-center gap-2">
                <Checkbox checked={difficulties.includes(d.value)} onCheckedChange={() => toggleDifficulty(d.value)} />
                <Label>{d.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">出題設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">問題フィルター</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "すべて" },
                { value: "unattempted", label: "未挑戦のみ" },
                { value: "incorrect", label: "不正解のみ" },
                { value: "bookmarked", label: "ブックマークのみ" },
              ].map(f => (
                <Button
                  key={f.value}
                  variant={questionFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestionFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">出題数</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
              >
                {[10, 20, 30, 50, 0].map(n => (
                  <option key={n} value={n}>{n === 0 ? "全問" : `${n}問`}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={shuffled} onCheckedChange={(checked) => setShuffled(!!checked)} />
              <Label>シャッフル</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleStart}
        disabled={filteredQuestions.length === 0}
        className="w-full"
        size="lg"
      >
        {filteredQuestions.length === 0
          ? "条件に合う問題がありません"
          : `${Math.min(filteredQuestions.length, questionCount || filteredQuestions.length)}問で開始`}
      </Button>
    </div>
  );
}
