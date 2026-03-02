import { z } from "zod";

export const TopicSchema = z.object({
  id: z.string().regex(/^\d\.\d{1,2}$/),
  title: z.string().min(1),
  titleEn: z.string().min(1),
  description: z.string().min(1),
});

export const DomainSchema = z.object({
  id: z.number().int().min(1).max(6),
  title: z.string().min(1),
  titleJa: z.string().min(1),
  topics: z.array(TopicSchema).min(1),
});

export const DomainsFileSchema = z.array(DomainSchema).length(6);

export type Topic = z.infer<typeof TopicSchema>;
export type Domain = z.infer<typeof DomainSchema>;
