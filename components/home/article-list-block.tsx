"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { TagPill } from "@/components/tag-pill";
import type { Article, ArticleStatus } from "@/types/article";
import { formatRelativeJa } from "@/lib/format-time";
import { STATUS_LABEL_JA, STATUS_OPTIONS } from "@/lib/status-labels";
import { displayHost } from "@/lib/url";

export type FilterState = {
  status: ArticleStatus | "all";
  tag: string;
  keyword: string;
};

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
    <section ref={listRef} className="flex flex-col gap-6" aria-labelledby="list-heading">
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

      <ul className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {filtered.map((a) => (
          <li key={a.id} className="flex min-h-0">
            <ArticleListCard article={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleListCard({ article }: { article: Article }) {
  const detailHref = `/articles/${article.id}`;
  const title = article.title?.trim() || article.url;
  const host = displayHost(article.url);
  const when = formatRelativeJa(article.updatedAt);
  const tags = article.tags.slice(0, 3);
  const moreTags = article.tags.length - tags.length;

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-md shadow-stone-300/30 ring-1 ring-stone-200/40 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-lg hover:shadow-stone-400/35 dark:border-stone-700/90 dark:bg-stone-900/90 dark:shadow-black/25 dark:ring-stone-700/50 dark:hover:border-amber-700/50 dark:hover:shadow-black/40">
      <Link
        href={detailHref}
        className="flex min-h-0 flex-1 flex-col rounded-t-2xl outline-none transition duration-300 ease-out focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f3ed] dark:focus-visible:ring-amber-500/40 dark:focus-visible:ring-offset-[#141210]"
      >
        {/* サムネ: 全カード同一の固定高さ（アスペクトではなく px で統一） */}
        <div className="relative h-[104px] w-full shrink-0 overflow-hidden bg-stone-100 dark:bg-stone-900">
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt=""
              className="h-full w-full object-cover object-top transition duration-500 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-stone-400">画像なし</div>
          )}
        </div>

        {/* 本文: 高さをブロック単位で揃え、説明は最大3行で省略 */}
        <div className="flex min-h-[11.5rem] flex-1 flex-col gap-1.5 px-3 pb-2.5 pt-2">
          <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-h-[2.25rem] flex-1 text-[13px] font-semibold leading-tight tracking-tight text-stone-800 dark:text-stone-50">
            {title}
          </h3>
          <span
            className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
              title={article.status}
            >
              {STATUS_LABEL_JA[article.status]}
            </span>
          </div>

          <p className="shrink-0 truncate text-[11px] leading-none text-stone-400" title={host || undefined}>
            {host || "\u00a0"}
          </p>

          {(tags.length > 0 || moreTags > 0) && (
            <div className="flex min-h-[1.375rem] flex-wrap gap-1">
              {tags.map((t) => (
                <TagPill key={t} tag={t} className="!px-2 !py-0.5 !text-[10px]" />
              ))}
              {moreTags > 0 && (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                  +{moreTags}
                </span>
              )}
            </div>
          )}

          <p className="line-clamp-3 min-h-[3.15rem] text-[11px] leading-snug text-stone-500 dark:text-stone-400">
            {article.description?.trim() ? article.description : "\u00a0"}
          </p>

          <p
            className="mt-auto shrink-0 text-[10px] tabular-nums text-stone-400"
            suppressHydrationWarning
          >
            {when}
          </p>
        </div>
      </Link>

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
          aria-label={`元のページを新しいタブで開く（${host || article.url}）`}
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
