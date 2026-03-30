"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteLogo } from "@/components/site-logo";
import { TagPill } from "@/components/tag-pill";
import { apiErrorMessage } from "@/lib/api-error";
import { STATUS_LABEL_JA, STATUS_OPTIONS } from "@/lib/status-labels";
import type { Article, ArticleStatus } from "@/types/article";

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("queued");
  const [tagsRaw, setTagsRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${id}`);
      const json = (await res.json()) as { error?: unknown; article?: Article };
      if (!res.ok) {
        throw new Error(apiErrorMessage(json));
      }
      const a = json.article;
      if (!a) throw new Error("記事が見つかりません");
      setArticle(a);
      setNote(a.note ?? "");
      setStatus(a.status);
      setTagsRaw(a.tags.join(", "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const draftTags = useMemo(
    () =>
      tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsRaw],
  );

  async function handleSave() {
    if (!article) return;
    setSaving(true);
    setError(null);
    setSaveOk(false);
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note || null, status, tags }),
      });
      const json = (await res.json()) as { error?: unknown; article?: Article };
      if (!res.ok) {
        throw new Error(apiErrorMessage(json));
      }
      if (json.article) setArticle(json.article);
      setSaveOk(true);
      window.setTimeout(() => setSaveOk(false), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("この記事を削除しますか？")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: unknown };
        throw new Error(apiErrorMessage(json));
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-14">
        <div className="h-4 w-24 animate-pulse rounded-md bg-stone-200 dark:bg-stone-700" />
        <div className="mt-6 aspect-[2/1] w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-700" />
        <div className="mt-4 space-y-2">
          <div className="h-6 w-2/3 animate-pulse rounded-md bg-stone-200 dark:bg-stone-700" />
          <div className="h-4 w-full animate-pulse rounded-md bg-stone-200 dark:bg-stone-700" />
        </div>
        <p className="mt-6 text-sm text-stone-500">読み込み中…</p>
      </div>
    );
  }
  if (error && !article) {
    return (
      <div className="p-8 md:p-10">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-stone-600 underline transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200">
          一覧へ
        </Link>
      </div>
    );
  }
  if (!article) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SiteLogo variant="compact" />
        <Link
          href="/"
          className="text-sm text-stone-500 transition duration-200 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 sm:shrink-0"
        >
          ← 一覧
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-md shadow-stone-300/25 ring-1 ring-stone-200/40 dark:border-stone-700/90 dark:bg-stone-900/90 dark:shadow-black/25 dark:ring-stone-700/50">
        <div className="relative aspect-[2/1] w-full bg-stone-100 dark:bg-stone-900">
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.imageUrl} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400">No image</div>
          )}
        </div>
        <div className="space-y-3 p-6 md:p-7">
          <h1 className="text-xl font-semibold leading-snug text-stone-800 dark:text-stone-50">
            {article.title?.trim() || article.url}
          </h1>
          {article.siteName && <p className="text-sm text-stone-500 dark:text-stone-400">{article.siteName}</p>}
          {article.description && (
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{article.description}</p>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block break-all text-sm text-amber-800 underline transition hover:text-amber-950 dark:text-amber-300/95 dark:hover:text-amber-200"
          >
            {article.url}
          </a>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {saveOk && (
        <p className="mt-5 text-sm font-medium text-amber-800 dark:text-amber-200/95" role="status">
          保存しました
        </p>
      )}

      <div className="mt-10 flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">メモ</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-sm leading-relaxed outline-none transition duration-200 focus:border-amber-400/90 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/70 dark:focus:border-amber-500/80 dark:focus:ring-amber-500/25"
            placeholder="あとで読むメモ、思考のメモなど…"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">状態</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ArticleStatus)}
            className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-sm transition duration-200 focus:border-amber-400/90 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/70 dark:focus:border-amber-500/80"
          >
            {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
              <option key={o.value} value={o.value}>
                {STATUS_LABEL_JA[o.value as ArticleStatus]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">タグ（カンマ区切り）</span>
          <input
            type="text"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-sm transition duration-200 focus:border-amber-400/90 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/70 dark:focus:border-amber-500/80"
            placeholder="例: frontend, あとで読む"
          />
          {draftTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1" aria-label="タグのプレビュー">
              {draftTags.map((t, i) => (
                <TagPill key={`${t}-${i}`} tag={t} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 ease-out hover:bg-stone-700 hover:shadow disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            {saving ? "保存中…" : "変更を保存"}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={saving}
            className="rounded-xl border border-red-200/90 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50/90 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
