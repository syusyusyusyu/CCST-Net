import { z } from "zod";

export const GlossaryEntrySchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  termJa: z.string().min(1),
  reading: z.string().min(1),
  definition: z.string().min(1),
  relatedTopicIds: z.array(z.string()),
});

export const GlossaryFileSchema = z.array(GlossaryEntrySchema);

export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;
