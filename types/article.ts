export type ArticleStatus = "reading" | "thinking" | "stocked";

export type Article = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
  note: string | null;
  status: ArticleStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ArticleRow = {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
  note: string | null;
  status: ArticleStatus;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export function articleFromRow(row: ArticleRow): Article {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    siteName: row.site_name,
    note: row.note,
    status: row.status,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
