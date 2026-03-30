import { z } from "zod";

export const articleStatusSchema = z.enum(["queued", "digesting", "stocked"]);

export const postArticleBodySchema = z.object({
  url: z.string().url(),
  /** OGP で取れたタイトルまたはユーザー入力。空は不可 */
  title: z.string().trim().min(1, "タイトルを入力してください").max(500),
  /** OGP で取れた説明のみ想定（任意） */
  description: z.string().max(20000).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  siteName: z.string().nullable().optional(),
  note: z.string().max(20000).nullable().optional(),
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
