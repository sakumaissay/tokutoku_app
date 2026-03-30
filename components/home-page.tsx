"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleListBlock, type FilterState } from "@/components/home/article-list-block";
import { UrlAddBlock, type PreviewData } from "@/components/home/url-add-block";
import { apiErrorMessage } from "@/lib/api-error";
import { parseTagsInput } from "@/lib/parse-tags";
import { normalizeHttpUrl } from "@/lib/url";
import { SiteLogo } from "@/components/site-logo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Article, ArticleStatus } from "@/types/article";

const defaultFilter: FilterState = { status: "all", tag: "", keyword: "" };

const ARTICLES_CACHE_PREFIX = "tokutoku:articles:v1:";
const OGP_CACHE_PREFIX = "tokutoku:ogp:v1:";

function filterArticles(articles: Article[], f: FilterState): Article[] {
  let list = articles;
  if (f.status !== "all") {
    list = list.filter((a) => a.status === f.status);
  }
  const tag = f.tag.trim().toLowerCase();
  if (tag) {
    list = list.filter((a) => a.tags.some((t) => t.toLowerCase().includes(tag)));
  }
  const q = f.keyword.trim().toLowerCase();
  if (q) {
    list = list.filter((a) => {
      const tagsHay = a.tags.join(" ");
      const hay = [a.url, a.title ?? "", a.description ?? "", a.note ?? "", tagsHay]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
}

export function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingOgp, setLoadingOgp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"" | ArticleStatus>("");
  const listSectionRef = useRef<HTMLElement | null>(null);
  /** URL クリアや新規プレビューで古い OGP 応答を捨てる */
  const ogpGenRef = useRef(0);

  const handleSignOut = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();

    // ログアウト時はユーザー単位の一覧キャッシュをクリアする（別ユーザーの一覧が一瞬見える事故を避ける）
    try {
      if (userId) {
        localStorage.removeItem(`${ARTICLES_CACHE_PREFIX}${userId}`);
      } else {
        // userId が確定していないケースに備えて prefix ベースで掃除
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith(ARTICLES_CACHE_PREFIX)) localStorage.removeItem(k);
        }
      }
    } catch {
      // localStorage が使えない環境でも致命的にしない
    }

    setArticles([]);
    setPreview(null);
    setActionError(null);

    router.push("/");
    router.refresh();
  }, [router, userId]);

  useEffect(() => {
    // userId を取得して、一覧キャッシュをユーザー単位に分離する
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    // ユーザー切り替え時の「旧一覧が一瞬見える」事故を避ける
    setArticles([]);
    setListError(null);
    setPreview(null);
  }, [userId]);

  const handleUrlChange = useCallback((v: string) => {
    setUrl(v);
    if (!v.trim()) {
      ogpGenRef.current += 1;
      setPreview(null);
      setActionError(null);
      setLoadingOgp(false);
      setSaveNote("");
      setTagsInput("");
      setSaveStatus("");
    }
  }, []);

  /** × でプレビューエリアを閉じる（URL は残す）。取得中なら中断表示 */
  const handleDismissPreview = useCallback(() => {
    ogpGenRef.current += 1;
    setPreview(null);
    setActionError(null);
    setLoadingOgp(false);
    setSaveStatus("");
  }, []);

  const loadArticles = useCallback(async () => {
    if (!userId) return;

    setListError(null);
    let hadCache = false;

    // stale を先に出す（キャッシュ優先）
    try {
      const cacheRaw = localStorage.getItem(`${ARTICLES_CACHE_PREFIX}${userId}`);
      if (cacheRaw) {
        const parsed = JSON.parse(cacheRaw) as { articles?: Article[] } | Article[];
        const cachedArticles = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.articles)
            ? parsed.articles
            : null;
        if (cachedArticles) {
          hadCache = true;
          setArticles(cachedArticles);
        }
      }
    } catch {
      // cache が壊れていても先にネット取得する（詳細エラーは出さない）
    }

    setLoadingList(!hadCache);
    try {
      const res = await fetch("/api/articles");
      const json = (await res.json().catch(() => ({}))) as { error?: unknown; articles?: Article[] };
      if (!res.ok) {
        throw new Error(apiErrorMessage(json));
      }

      const latest = json.articles ?? [];
      setArticles(latest);

      // 取得できた最新をキャッシュに保存
      try {
        localStorage.setItem(`${ARTICLES_CACHE_PREFIX}${userId}`, JSON.stringify({ articles: latest }));
      } catch {
        // 保存失敗は無視（ブラウザの容量や制限など）
      }
    } catch (e) {
      // stale があるなら表示は維持し、エラーは控えめにする
      if (!hadCache) {
        setListError(e instanceof Error ? e.message : "一覧の取得に失敗しました");
      }
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    if (!saveNotice) return;
    const t = window.setTimeout(() => setSaveNotice(null), 4500);
    return () => window.clearTimeout(t);
  }, [saveNotice]);

  const filtered = useMemo(() => filterArticles(articles, filter), [articles, filter]);
  const hasActiveFilter =
    filter.status !== "all" || filter.tag.trim() !== "" || filter.keyword.trim() !== "";

  const normalizedUrl = useMemo(() => normalizeHttpUrl(url), [url]);
  /** 入力 URL とプレビューが一致している（取得済み） */
  const previewMatchesUrl = useMemo(
    () => Boolean(normalizedUrl && preview && preview.url === normalizedUrl),
    [normalizedUrl, preview],
  );
  /**
   * 未取得なら取得のため押せる。取得済みなら状態が選ばれるまで無効。
   */
  const saveButtonEnabled = useMemo(
    () =>
      Boolean(url.trim()) && !loadingOgp && !saving && (!previewMatchesUrl || Boolean(saveStatus)),
    [url, loadingOgp, saving, previewMatchesUrl, saveStatus],
  );

  const performOgpFetch = useCallback(async (normalized: string): Promise<PreviewData | null> => {
    const myGen = ++ogpGenRef.current;
    const cacheKey = `${OGP_CACHE_PREFIX}${normalized}`;

    // キャッシュヒットなら即表示（ただし世代管理に従って、最新呼び出しのみ反映する）
    try {
      const cacheRaw = localStorage.getItem(cacheKey);
      if (cacheRaw && myGen === ogpGenRef.current) {
        const parsed = JSON.parse(cacheRaw) as PreviewData;
        // URL が一致するキャッシュだけ採用（壊れていても例外にしない）
        if (parsed && typeof parsed.url === "string" && parsed.url === normalized) {
          setPreview(parsed);
          setLoadingOgp(false);
          return parsed;
        }
      }
    } catch {
      // cache が壊れていても API を叩く
    }

    setLoadingOgp(true);
    setPreview(null);
    try {
      const res = await fetch("/api/ogp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        title?: string | null;
        description?: string | null;
        imageUrl?: string | null;
        siteName?: string | null;
        error?: unknown;
      };
      if (myGen !== ogpGenRef.current) return null;
      if (!res.ok) {
        throw new Error(apiErrorMessage(json));
      }
      const data: PreviewData = {
        url: json.url ?? normalized,
        title: json.title ?? null,
        description: json.description ?? null,
        imageUrl: json.imageUrl ?? null,
        siteName: json.siteName ?? null,
        error: typeof json.error === "string" ? json.error : null,
      };
      setPreview(data);

      // OGP は軽いキャッシュ（壊れたら読み直しで復旧）
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // 保存失敗は無視
      }

      return data;
    } catch (e) {
      if (myGen !== ogpGenRef.current) return null;
      setActionError(e instanceof Error ? e.message : "プレビュー取得に失敗しました");
      return null;
    } finally {
      if (myGen === ogpGenRef.current) {
        setLoadingOgp(false);
      }
    }
  }, []);

  const handlePreview = useCallback(
    async (urlOverride?: string) => {
      setActionError(null);
      const raw = urlOverride ?? url;
      const normalized = normalizeHttpUrl(raw);
      if (!normalized) {
        setActionError("URL を入力してください");
        return;
      }
      if (urlOverride !== undefined) {
        setUrl(normalized);
      }
      await performOgpFetch(normalized);
    },
    [url, performOgpFetch],
  );

  const handleSave = useCallback(async () => {
    setActionError(null);
    const normalized = normalizeHttpUrl(url);
    if (!normalized) {
      setActionError("URL を入力してください");
      return;
    }
    let data = preview;
    if (!data || data.url !== normalized) {
      data = await performOgpFetch(normalized);
      if (!data) return;
    }
    if (!saveStatus) {
      setActionError("状態を選んでください");
      return;
    }
    setSaving(true);
    setSaveNotice(null);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.url,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          siteName: data.siteName,
          status: saveStatus,
          note: saveNote.trim() || null,
          tags: parseTagsInput(tagsInput),
        }),
      });
      const json = (await res.json()) as { error?: unknown };
      if (!res.ok) {
        throw new Error(apiErrorMessage(json));
      }
      setUrl("");
      setPreview(null);
      setSaveNote("");
      setTagsInput("");
      setSaveStatus("");
      await loadArticles();
      setSaveNotice("保存しました。一覧に追加されています。");
      listSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [url, preview, performOgpFetch, loadArticles, saveNote, tagsInput, saveStatus]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 md:gap-14 md:px-8 md:py-14">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="m-0">
            <SiteLogo />
          </h1>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-stone-500 transition hover:bg-stone-200/80 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            ログアウト
          </button>
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          URL を貼る → プレビューで確認 → 保存。あとから一覧で見返せます。
        </p>
      </header>

      <UrlAddBlock
        url={url}
        onUrlChange={handleUrlChange}
        onPreview={handlePreview}
        onSave={handleSave}
        onDismissPreview={handleDismissPreview}
        loadingOgp={loadingOgp}
        saving={saving}
        preview={preview}
        actionError={actionError}
        saveNote={saveNote}
        onSaveNoteChange={setSaveNote}
        tagsInput={tagsInput}
        onTagsInputChange={setTagsInput}
        saveStatus={saveStatus}
        onSaveStatusChange={setSaveStatus}
        saveButtonEnabled={saveButtonEnabled}
      />

      <ArticleListBlock
        listRef={listSectionRef}
        loadingList={loadingList}
        listError={listError}
        articles={articles}
        filtered={filtered}
        filter={filter}
        onFilterChange={setFilter}
        hasActiveFilter={hasActiveFilter}
        saveNotice={saveNotice}
      />
    </div>
  );
}
