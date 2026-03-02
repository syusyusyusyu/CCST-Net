import { QuestionSchema } from "../src/lib/schemas/question-schema";
import { DomainsFileSchema } from "../src/lib/schemas/domain-schema";
import { GlossaryFileSchema } from "../src/lib/schemas/glossary-schema";
import domainsData from "../src/data/domains.json";
import glossaryData from "../src/data/glossary.json";
import domain1 from "../src/data/questions/domain-1.json";
import domain2 from "../src/data/questions/domain-2.json";
import domain3 from "../src/data/questions/domain-3.json";
import domain4 from "../src/data/questions/domain-4.json";
import domain5 from "../src/data/questions/domain-5.json";
import domain6 from "../src/data/questions/domain-6.json";
import * as fs from "fs";
import * as path from "path";

let hasError = false;

function logError(message: string) {
  console.error(`❌ ${message}`);
  hasError = true;
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

// domains.json バリデーション
const domainsResult = DomainsFileSchema.safeParse(domainsData);
if (!domainsResult.success) {
  logError("domains.json のバリデーションエラー:");
  console.error(domainsResult.error.issues);
} else {
  logSuccess("domains.json: OK");
}

// glossary.json バリデーション
const glossaryResult = GlossaryFileSchema.safeParse(glossaryData);
if (!glossaryResult.success) {
  logError("glossary.json のバリデーションエラー:");
  console.error(glossaryResult.error.issues);
} else {
  logSuccess(`glossary.json: ${glossaryData.length} 用語 OK`);
}

// 問題バリデーション
const allQuestions = [...domain1, ...domain2, ...domain3, ...domain4, ...domain5, ...domain6];
const allIds = new Set<string>();
let questionErrors = 0;

for (const q of allQuestions) {
  // ID 一意性チェック
  if (allIds.has((q as { id: string }).id)) {
    logError(`重複ID: ${(q as { id: string }).id}`);
    questionErrors++;
  }
  allIds.add((q as { id: string }).id);

  // Zodバリデーション
  const result = QuestionSchema.safeParse(q);
  if (!result.success) {
    logError(`問題 ${(q as { id: string }).id} のバリデーションエラー:`);
    for (const issue of result.error.issues) {
      console.error(`  - [${issue.path.join(".")}] ${issue.message}`);
    }
    questionErrors++;
  }
}

if (questionErrors === 0) {
  logSuccess(`問題データ: ${allQuestions.length} 問 OK`);
} else {
  logError(`${questionErrors} 件のエラーが見つかりました`);
}

// relatedTopicIds の存在チェック
const validTopicIds = new Set(
  (domainsData as { topics: { id: string }[] }[]).flatMap(d => d.topics.map(t => t.id))
);
for (const q of allQuestions) {
  const question = q as { id: string; relatedTopicIds?: string[] };
  for (const tid of question.relatedTopicIds ?? []) {
    if (!validTopicIds.has(tid)) {
      logError(`問題 ${question.id} の relatedTopicId "${tid}" が domains.json に存在しない`);
    }
  }
}

// 教科書ファイルの存在チェック
const textbookDir = path.join(__dirname, "../src/data/textbook");
for (const domain of domainsData as { topics: { id: string }[] }[]) {
  for (const topic of domain.topics) {
    const filename = `topic-${topic.id.replace(".", "-")}.md`;
    const filepath = path.join(textbookDir, filename);
    if (!fs.existsSync(filepath)) {
      logError(`教科書ファイルが見つかりません: ${filename}`);
    }
  }
}
logSuccess("教科書ファイル: 存在チェック完了");

// ドメイン別問題数
const domainCounts: Record<number, number> = {};
for (const q of allQuestions) {
  const domainId = (q as { domainId: number }).domainId;
  domainCounts[domainId] = (domainCounts[domainId] ?? 0) + 1;
}
console.log("\n📊 ドメイン別問題数:");
for (const [domainId, count] of Object.entries(domainCounts).sort()) {
  console.log(`  Domain ${domainId}: ${count} 問`);
}
console.log(`  合計: ${allQuestions.length} 問`);

if (hasError) {
  console.error("\n❌ バリデーションに失敗しました");
  process.exit(1);
} else {
  console.log("\n✅ すべてのバリデーションに成功しました！");
}
