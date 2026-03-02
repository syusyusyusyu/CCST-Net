"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/store/progress-store";
import { useQuizStore } from "@/lib/store/quiz-store";
import { getLocalDateString, getReviewDueQuestions } from "@/lib/utils/spaced-repetition";
import { getAllQuestions } from "@/lib/utils/load-questions";
import Link from "next/link";

export default function ReviewPage() {
  const router = useRouter();
  const { questionStats } = useProgressStore();
  const startSession = useQuizStore(s => s.startSession);
  const allQuestions = useMemo(() => getAllQuestions(), []);

  const today = getLocalDateString();
  const dueIds = useMemo(
    () => getReviewDueQuestions(questionStats, today),
    [questionStats, today]
  );

  const dueQuestions = useMemo(
    () => allQuestions.filter(q => dueIds.includes(q.id)),
    [allQuestions, dueIds]
  );

  const handleStart = () => {
    if (dueQuestions.length === 0) return;
    startSession("study", dueQuestions, null);
    router.push("/study/session");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">復習</h1>
        <p className="mt-2 text-muted-foreground">スペースド・リペティションによる効率的な復習</p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          {dueQuestions.length > 0 ? (
            <>
              <p className="text-lg font-medium">
                今日復習する問題: <span className="text-2xl font-bold text-primary">{dueQuestions.length} 問</span>
              </p>
              <Button onClick={handleStart} className="mt-4" size="lg">
                復習を開始する
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">今日復習する問題はありません</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {Object.keys(questionStats).length === 0
                  ? "問題を解くと、復習スケジュールが自動的に作成されます。"
                  : "素晴らしい！次の復習日まで新しい問題に挑戦しましょう。"}
              </p>
              <Link href="/study">
                <Button variant="outline" className="mt-4">新しい問題に挑戦する</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
