"use client";

import type { RefObject } from "react";
import { useState } from "react";
import Link from "next/link";
import type { Article, ArticleStatus } from "@/types/article";
import { formatRelativeJa } from "@/lib/format-time";
import { articleLinkCardTitle, googleFaviconUrl } from "@/lib/link-card-display";
import { STATUS_LABEL_JA, STATUS_OPTIONS } from "@/lib/status-labels";
import { displayHost } from "@/lib/url";

export type FilterState = {
  status: ArticleStatus | "all";
  tag: string;
  keyword: string;
};

/** 一覧カード本文の固定高さ（フッター除く） */
const LIST_CARD_BODY_H = "h-[100px]";

type Props = {
  listRef: RefObject<HTMLElement | null>;
  loadingList: boolean;
  listError: string | null;
  articles: Article[];
  filtered: Article[];
  filter: FilterState;
  onFilterChange: (next: FilterState) => void;
  hasActiveFilter: boolean;
  saveNotice: string | null;
};

export function ArticleListBlock({
  listRef,
  loadingList,
  listError,
  articles,
  filtered,
  filter,
  onFilterChange,
  hasActiveFilter,
  saveNotice,
}: Props) {
  return (
    <section ref={listRef} className="flex w-full min-w-0 flex-col gap-6" aria-labelledby="list-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="list-heading" className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            一覧
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {loadingList
              ? "読み込み中…"
              : `全 ${articles.length} 件${hasActiveFilter ? ` · 表示 ${filtered.length} 件` : ""}`}
          </p>
        </div>
        {saveNotice && (
          <p
            className="rounded-full bg-amber-100/90 px-3 py-1.5 text-xs font-medium text-amber-950 shadow-sm dark:bg-amber-900/35 dark:text-amber-100"
            role="status"
          >
            {saveNotice}
          </p>
        )}
      </div>

      <div className="grid gap-4 rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-md shadow-stone-300/25 ring-1 ring-stone-200/40 dark:border-stone-700/90 dark:bg-stone-900/80 dark:shadow-black/20 dark:ring-stone-700/50 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">状態</span>
          <select
            value={filter.status}
            onChange={(e) =>
              onFilterChange({ ...filter, status: e.target.value as FilterState["status"] })
            }
            className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-sm transition-colors duration-200 focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/70 dark:focus:border-amber-500/70"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-1">
          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">タグ</span>
          <input
            type="text"
            value={filter.tag}
            onChange={(e) => onFilterChange({ ...filter, tag: e.target.value })}
            placeholder="部分一致（例: react）"
            className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-sm transition-colors duration-200 focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/70 dark:focus:border-amber-500/70"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-1">
          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">キーワード</span>
          <input
            type="search"
            value={filter.keyword}
            onChange={(e) => onFilterChange({ ...filter, keyword: e.target.value })}
            placeholder="タイトル・説明・メモ・タグ・URL"
            className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-sm transition-colors duration-200 focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/70 dark:focus:border-amber-500/70"
          />
        </label>
      </div>

      {listError && (
        <p className="rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200" role="alert">
          {listError}
        </p>
      )}

      {!loadingList && articles.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone-300/90 bg-stone-50/80 px-5 py-10 text-center text-sm leading-relaxed text-stone-600 dark:border-stone-600 dark:bg-stone-900/40 dark:text-stone-400">
          まだ記事がありません。
          <br />
          上の入力欄に URL を貼り、プレビューを確認して保存してください。
        </p>
      )}

      {!loadingList && articles.length > 0 && filtered.length === 0 && hasActiveFilter && (
        <p className="text-sm text-stone-500 dark:text-stone-400">条件に一致する記事がありません。フィルタを変えてみてください。</p>
      )}

      <ul className="flex w-full min-w-0 flex-col gap-3">
        {filtered.map((a) => (
          <li key={a.id} className="w-full min-w-0">
            <ArticleListRowCard article={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function listCardSummary(article: Article): { text: string | null; isPlaceholder: boolean } {
  const note = article.note?.trim();
  if (note) return { text: note, isPlaceholder: false };
  const desc = article.description?.trim();
  if (desc) return { text: desc, isPlaceholder: false };
  return { text: null, isPlaceholder: true };
}

function domainInitialLetter(domain: string): string {
  const d = domain.replace(/^www\./, "").trim();
  if (!d) return "?";
  const m = /[a-z0-9\u3040-\u30ff\u3400-\u4dbf]/i.exec(d);
  return (m?.[0] ?? d[0] ?? "?").toUpperCase();
}

function ListFavicon({ host }: { host: string }) {
  const [broken, setBroken] = useState(false);
  const initial = domainInitialLetter(host);
  const src = host.trim() ? googleFaviconUrl(host.replace(/^www\./, "").toLowerCase(), 32) : null;

  if (!src || broken) {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-stone-200/80 bg-stone-100 text-[11px] font-semibold text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 rounded-md border border-stone-200/80 bg-white object-contain dark:border-stone-600 dark:bg-stone-900"
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function ArticleListRowCard({ article }: { article: Article }) {
  const detailHref = `/articles/${article.id}`;
  const title = articleLinkCardTitle(article);
  const host = displayHost(article.url);
  const when = formatRelativeJa(article.updatedAt);
  const { text: summaryText, isPlaceholder } = listCardSummary(article);

  return (
    <div className="group flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-md shadow-stone-300/25 ring-1 ring-stone-200/40 transition duration-200 ease-out hover:border-amber-300/50 dark:border-stone-700/90 dark:bg-stone-900/90 dark:shadow-black/20 dark:ring-stone-700/50 dark:hover:border-amber-700/45">
      <Link
        href={detailHref}
        className={`flex ${LIST_CARD_BODY_H} shrink-0 gap-3 p-3 outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f3ed] dark:focus-visible:ring-amber-500/40 dark:focus-visible:ring-offset-[#141210]`}
      >
        <ListFavicon host={host} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <h3
              className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-snug text-stone-800 dark:text-stone-50"
              title={title}
            >
              {title}
            </h3>
            <span
              className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
              title={article.status}
            >
              {STATUS_LABEL_JA[article.status]}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] leading-snug text-stone-600 dark:text-stone-400">
            {isPlaceholder ? (
              <span className="text-stone-400 dark:text-stone-500">メモなし</span>
            ) : (
              summaryText
            )}
          </p>
          <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-0.5 leading-none text-[10px] text-stone-400 tabular-nums dark:text-stone-500">
            <span className="min-w-0 truncate" title={host || undefined}>
              {host || "\u00a0"}
            </span>
            <span className="shrink-0" suppressHydrationWarning>
              {when}
            </span>
          </div>
        </div>
      </Link>

      <ArticleListCardFooter article={article} detailHref={detailHref} host={host} />
    </div>
  );
}

function ArticleListCardFooter({
  article,
  detailHref,
  host,
}: {
  article: Article;
  detailHref: string;
  host: string;
}) {
  return (
    <div
      className="grid shrink-0 grid-cols-2 divide-x divide-stone-200/90 border-t border-stone-200/90 dark:divide-stone-700 dark:border-stone-700"
      role="group"
      aria-label="記事の開き方"
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-amber-900/95 transition duration-200 ease-out hover:bg-amber-50/95 active:bg-amber-100/80 dark:text-amber-200/95 dark:hover:bg-amber-950/40"
        aria-label={`元のページを新しいタブで開く（${host || "外部"}）`}
      >
        <ExternalPageIcon className="shrink-0 opacity-90" />
        ページを開く
      </a>
      <Link
        href={detailHref}
        className="flex items-center justify-center py-2.5 text-[11px] font-medium text-stone-700 transition duration-200 ease-out hover:bg-stone-50/95 active:bg-stone-100/80 dark:text-stone-200 dark:hover:bg-stone-800/80"
        aria-label="tokutoku の詳細画面を開く"
      >
        詳細
      </Link>
    </div>
  );
}

function ExternalPageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14 21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
