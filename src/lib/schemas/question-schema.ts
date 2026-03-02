import { z } from "zod";

export const QuestionTypeSchema = z.enum(["single-choice", "multiple-choice", "drag-and-drop"]);
export const DifficultySchema = z.enum(["easy", "medium", "hard"]);

export const QuestionOptionSchema = z.object({
  id: z.string().regex(/^[a-f]$/, "選択肢 ID は a〜f"),
  text: z.string().min(1, "選択肢テキストは必須"),
});

export const DragDropItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const QuestionSchema = z.object({
  id: z.string().regex(/^q-\d-\d{1,2}-\d{3}$/, "形式: q-{domain}-{topic}-{number}"),
  domainId: z.number().int().min(1).max(6),
  topicId: z.string().regex(/^\d\.\d{1,2}$/, "形式: X.Y"),
  type: QuestionTypeSchema,
  difficulty: DifficultySchema,
  text: z.string().min(10, "問題文は10文字以上"),
  options: z.array(QuestionOptionSchema).min(2).max(6).optional(),
  correctAnswers: z.array(z.string()).min(1).optional(),
  dragItems: z.array(DragDropItemSchema).min(2).optional(),
  dropZones: z.array(DragDropItemSchema).optional(),
  correctOrder: z.array(z.string()).min(2).optional(),
  explanation: z.string().min(10, "解説は10文字以上"),
  explanationWrong: z.record(z.string(), z.string()).optional(),
  relatedTopicIds: z.array(z.string()).optional(),
  tags: z.array(z.string()),
}).superRefine((data, ctx) => {
  if (data.type === "single-choice" || data.type === "multiple-choice") {
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "選択式問題には options が必要", path: ["options"] });
    }
    if (!data.correctAnswers || data.correctAnswers.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "選択式問題には correctAnswers が必要", path: ["correctAnswers"] });
    }
    if (data.options && data.correctAnswers) {
      const optionIds = new Set(data.options.map(o => o.id));
      for (const ans of data.correctAnswers) {
        if (!optionIds.has(ans)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `correctAnswer "${ans}" が options に存在しない`, path: ["correctAnswers"] });
        }
      }
    }
    if (data.type === "single-choice" && data.correctAnswers && data.correctAnswers.length !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "single-choice の correctAnswers は 1 つ", path: ["correctAnswers"] });
    }
    if (data.type === "multiple-choice" && data.correctAnswers && data.correctAnswers.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "multiple-choice の correctAnswers は 2 つ以上", path: ["correctAnswers"] });
    }
  }
  if (data.type === "drag-and-drop") {
    if (!data.dragItems || data.dragItems.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "D&D問題には dragItems が必要", path: ["dragItems"] });
    }
    if (!data.correctOrder || data.correctOrder.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "D&D問題には correctOrder が必要", path: ["correctOrder"] });
    }
    if (data.dragItems && data.correctOrder && data.dragItems.length !== data.correctOrder.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "dragItems と correctOrder の長さが不一致", path: ["correctOrder"] });
    }
  }
  const expectedDomain = parseInt(data.topicId.split(".")[0]);
  if (data.domainId !== expectedDomain) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `domainId(${data.domainId}) と topicId(${data.topicId}) の不一致`, path: ["domainId"] });
  }
  const idDomain = parseInt(data.id.split("-")[1]);
  if (data.domainId !== idDomain) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `id のドメイン部(${idDomain}) と domainId(${data.domainId}) の不一致`, path: ["id"] });
  }
});

export type Question = z.infer<typeof QuestionSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
