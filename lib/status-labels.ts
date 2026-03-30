import type { ArticleStatus } from "@/types/article";

/** UI 表示用（一覧・フィルタ・詳細） */
export const STATUS_LABEL_JA: Record<ArticleStatus, string> = {
  queued: "あとで読む",
  digesting: "考え中",
  stocked: "ストック済み",
};

export const STATUS_OPTIONS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "queued", label: STATUS_LABEL_JA.queued },
  { value: "digesting", label: STATUS_LABEL_JA.digesting },
  { value: "stocked", label: STATUS_LABEL_JA.stocked },
];
