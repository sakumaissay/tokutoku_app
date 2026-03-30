import type { Article } from "@/types/article";
import { displayHost } from "@/lib/url";

/** プレビュー用（url-add-block の PreviewData と整合） */
export type PreviewDisplayKind = "ogp" | "link";

export type LinkFieldsSource = {
  url: string;
  title: string | null;
  imageUrl: string | null;
  siteName: string | null;
  displayKind?: PreviewDisplayKind;
};

/** OGP / リンクラベル共通の拡張フィールド */
export type RichLinkPreview = LinkFieldsSource & {
  description: string | null;
  error: string | null;
  /** OGP/API が返したタイトルのみ。推定タイトル（ドメインからの仮題）は含めない */
  titleFromOgp?: string | null;
};

export function normalizeDomainFromUrl(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function googleFaviconUrl(domain: string, size = 64): string | null {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function isGoogleFaviconImageUrl(url: string | null | undefined): boolean {
  return Boolean(url?.includes("google.com/s2/favicons"));
}

/** DB/API の生データが「ヒーロー画像もタイトルも無い」 */
export function isWeakOgpPayload(data: { title?: string | null; imageUrl?: string | null }): boolean {
  return !data.title?.trim() && !data.imageUrl?.trim();
}

/** リンクカード（Slack 風）を使うか — ヒーロー画像が無い／favicon だけは OGP カードにしない */
export function shouldUseLinkStylePreview(p: LinkFieldsSource): boolean {
  if (p.displayKind === "link") return true;
  if (!p.imageUrl?.trim()) return true;
  if (isGoogleFaviconImageUrl(p.imageUrl)) return true;
  return false;
}

export function linkCardEstimatedTitle(domain: string): string {
  if (!domain) return "ページ";
  if (domain === "x.com" || domain === "twitter.com") return "Xの投稿";
  if (domain === "note.com") return "noteの記事";
  if (domain === "youtube.com" || domain === "youtu.be") return "YouTube動画";
  if (domain === "zenn.dev" || domain.endsWith(".zenn.dev")) return "Zennの記事";
  if (domain === "qiita.com" || domain.endsWith(".qiita.com")) return "Qiitaの記事";
  return `${domain} のページ`;
}

export function linkCardHelperText(domain: string): string {
  if (!domain) return "ページへのリンク";
  if (domain === "x.com" || domain === "twitter.com") return "投稿ページへのリンク";
  if (domain === "note.com") return "記事ページへのリンク";
  if (domain === "youtube.com" || domain === "youtu.be") return "動画ページへのリンク";
  if (domain === "zenn.dev" || domain.endsWith(".zenn.dev")) return "記事ページへのリンク";
  if (domain === "qiita.com" || domain.endsWith(".qiita.com")) return "記事ページへのリンク";
  return "ページへのリンク";
}

export function siteLabelFromSource(src: LinkFieldsSource): string {
  const fromOgp = src.siteName?.trim();
  if (fromOgp) return fromOgp;
  return displayHost(src.url) || normalizeDomainFromUrl(src.url);
}

export function primaryTitleForLinkDisplay(src: LinkFieldsSource): string {
  const domain = normalizeDomainFromUrl(src.url);
  return src.title?.trim() || linkCardEstimatedTitle(domain);
}

/** 表示用に displayKind・タイトル・画像を正規化（キャッシュや古いデータもここで揃える） */
export function normalizePreviewForDisplay<T extends LinkFieldsSource>(p: T): T & { displayKind: PreviewDisplayKind } {
  const domain = normalizeDomainFromUrl(p.url);
  const link = shouldUseLinkStylePreview(p);
  if (!link) {
    return { ...p, displayKind: "ogp" };
  }
  return {
    ...p,
    displayKind: "link",
    imageUrl: null,
    title: p.title?.trim() || linkCardEstimatedTitle(domain),
    siteName: p.siteName?.trim() || domain || null,
  };
}

/** 説明文はリンクカードでは使わない（一覧では Article の description を別途表示） */
export function normalizeRichPreview(p: RichLinkPreview): RichLinkPreview & { displayKind: PreviewDisplayKind } {
  const base = normalizePreviewForDisplay(p);
  if (base.displayKind === "link") {
    return { ...base, description: null };
  }
  return { ...base };
}

export function createLinkStylePreview(
  url: string,
  error?: string | null,
): RichLinkPreview & { displayKind: PreviewDisplayKind } {
  const domain = normalizeDomainFromUrl(url);
  return normalizeRichPreview({
    url,
    title: linkCardEstimatedTitle(domain),
    titleFromOgp: null,
    description: null,
    imageUrl: null,
    siteName: domain || null,
    error: error ?? null,
    displayKind: "link",
  });
}

/** 古い localStorage キャッシュ用: titleFromOgp が無い場合に推定タイトルと比較して推論する */
export function inferLegacyTitleFromOgp(p: { url: string; title?: string | null }): string | null {
  const domain = normalizeDomainFromUrl(p.url);
  const est = linkCardEstimatedTitle(domain);
  const t = p.title?.trim();
  if (!t) return null;
  if (t === est) return null;
  return t;
}

/** 保存前チェック: OGP 由来のタイトルが無ければユーザー入力が必要 */
export function previewNeedsManualTitle(p: { titleFromOgp?: string | null } | null): boolean {
  if (!p) return false;
  return !p.titleFromOgp?.trim();
}

/** `/api/ogp` の JSON から表示用プレビューへ（キャッシュに保存する値にも使う） */
export function richPreviewFromOgpJson(
  normalized: string,
  json: {
    url?: string;
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    siteName?: string | null;
    error?: unknown;
  },
): RichLinkPreview & { displayKind: PreviewDisplayKind } {
  const titleOgp = (json.title ?? "").trim() || null;
  const raw: RichLinkPreview = {
    url: json.url ?? normalized,
    title: json.title ?? null,
    titleFromOgp: titleOgp,
    description: json.description ?? null,
    imageUrl: json.imageUrl ?? null,
    siteName: json.siteName ?? null,
    error: typeof json.error === "string" ? json.error : null,
  };
  if (isWeakOgpPayload(raw)) {
    return createLinkStylePreview(normalized, raw.error);
  }
  return normalizeRichPreview(raw);
}

export function articleUsesLinkCardLayout(a: Article): boolean {
  return shouldUseLinkStylePreview({
    url: a.url,
    title: a.title,
    imageUrl: a.imageUrl,
    siteName: a.siteName,
  });
}

export function articleLinkCardTitle(a: Article): string {
  return primaryTitleForLinkDisplay({
    url: a.url,
    title: a.title,
    imageUrl: a.imageUrl,
    siteName: a.siteName,
  });
}

export function articleLinkCardSiteLabel(a: Article): string {
  return siteLabelFromSource({
    url: a.url,
    title: a.title,
    imageUrl: a.imageUrl,
    siteName: a.siteName,
  });
}

export function articleLinkCardHelper(a: Article): string {
  return linkCardHelperText(normalizeDomainFromUrl(a.url));
}
