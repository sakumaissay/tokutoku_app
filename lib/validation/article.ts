import { z } from "zod";

export const articleStatusSchema = z.enum(["reading", "thinking", "stocked"]);

export const postArticleBodySchema = z.object({
  url: z.string().url(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  siteName: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: articleStatusSchema,
  tags: z.array(z.string()).optional(),
});

export const patchArticleBodySchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  siteName: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: articleStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const ogpRequestSchema = z.object({
  url: z.string().url(),
});
