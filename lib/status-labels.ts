import type { ArticleStatus } from "@/types/article";

/** UI 表示用（一覧・フィルタ・詳細） */
export const STATUS_LABEL_JA: Record<ArticleStatus, string> = {
  reading: "読む",
  thinking: "考え中",
  stocked: "ストック化",
};

export const STATUS_OPTIONS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "reading", label: STATUS_LABEL_JA.reading },
  { value: "thinking", label: STATUS_LABEL_JA.thinking },
  { value: "stocked", label: STATUS_LABEL_JA.stocked },
];
