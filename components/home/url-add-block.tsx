"use client";

import { STATUS_LABEL_JA } from "@/lib/status-labels";
import type { ArticleStatus } from "@/types/article";
import {
  googleFaviconUrl,
  linkCardHelperText,
  normalizeDomainFromUrl,
  primaryTitleForLinkDisplay,
  siteLabelFromSource,
  shouldUseLinkStylePreview,
  type PreviewDisplayKind,
} from "@/lib/link-card-display";
import { extractFirstHttpUrl, normalizeHttpUrl } from "@/lib/url";

export type PreviewData = {
  url: string;
  title: string | null;
  /** OGP 由来のタイトルのみ（未取得は null／undefined） */
  titleFromOgp?: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
  error: string | null;
  displayKind?: PreviewDisplayKind;
};

const STATUS_SAVE_OPTIONS: ArticleStatus[] = ["queued", "digesting", "stocked"];

type Props = {
  url: string;
  onUrlChange: (v: string) => void;
  onPreview: (urlOverride?: string) => void;
  onSave: () => void;
  /** プレビューカードを閉じる（×）— URL はそのまま */
  onDismissPreview: () => void;
  loadingOgp: boolean;
  saving: boolean;
  preview: PreviewData | null;
  actionError: string | null;
  saveTitleManual: string;
  onSaveTitleManualChange: (v: string) => void;
  /** OGP でタイトルが無いとき true（このときタイトル手入力が必要） */
  needsManualTitle: boolean;
  saveNote: string;
  onSaveNoteChange: (v: string) => void;
  tagsInput: string;
  onTagsInputChange: (v: string) => void;
  saveStatus: "" | ArticleStatus;
  onSaveStatusChange: (v: "" | ArticleStatus) => void;
  saveButtonEnabled: boolean;
};

export function UrlAddBlock({
  url,
  onUrlChange,
  onPreview,
  onSave,
  onDismissPreview,
  loadingOgp,
  saving,
  preview,
  actionError,
  saveTitleManual,
  onSaveTitleManualChange,
  needsManualTitle,
  saveNote,
  onSaveNoteChange,
  tagsInput,
  onTagsInputChange,
  saveStatus,
  onSaveStatusChange,
  saveButtonEnabled,
}: Props) {
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text/plain");
    const extracted = extractFirstHttpUrl(text);
    const firstLine = text.split(/\r?\n/)[0]?.trim() ?? "";
    const candidate = extracted ?? firstLine;
    if (!candidate) return;
    const normalized = normalizeHttpUrl(candidate);
    if (!normalized) return;
    onUrlChange(normalized);
    e.preventDefault();
    queueMicrotask(() => onPreview(normalized));
  }

  const showPreviewArea = loadingOgp || Boolean(preview);
  /** プレビュー取得後〜保存前まで、状態・任意欄を出す（保存中は非表示） */
  const showPostPreviewFields = Boolean(preview) && !loadingOgp && !saving;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="add-heading">
      <h2 id="add-heading" className="sr-only">
        なに見つけた？
      </h2>

      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-md shadow-stone-300/30 ring-1 ring-stone-200/40 transition-shadow duration-300 ease-out hover:shadow-lg hover:shadow-stone-300/35 dark:border-stone-700/90 dark:bg-stone-900/85 dark:shadow-black/25 dark:ring-stone-700/50 dark:hover:shadow-black/35">
        <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800/80">
          <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100">なに見つけた？</p>
          <p className="mt-0.5 text-[11px] leading-snug text-stone-500 dark:text-stone-400">
            貼り付けでプレビューを表示します。状態を選んで保存（Enter でも同じ）
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="article-url-input">
            記事の URL
          </label>
          <input
            id="article-url-input"
            type="text"
            inputMode="url"
            name="url"
            autoComplete="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!saveButtonEnabled) return;
                void onSave();
              }
            }}
            className="min-h-[44px] w-full flex-1 rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-[15px] text-stone-900 outline-none transition-colors duration-200 placeholder:text-stone-400 focus:border-amber-400/90 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:focus:border-amber-500/80 dark:focus:ring-amber-500/25"
          />
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={!saveButtonEnabled}
            className="inline-flex h-11 min-w-[5.5rem] shrink-0 items-center justify-center rounded-full bg-stone-800 px-5 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:bg-stone-700 hover:shadow disabled:pointer-events-none disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            {saving ? "保存中…" : loadingOgp ? "取得中…" : "保存"}
          </button>
        </div>

        {actionError && (
          <div
            className="mx-4 mb-3 rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {actionError}
          </div>
        )}

        {showPreviewArea && (
          <div className="relative border-t border-stone-100 dark:border-stone-800/80">
            {loadingOgp && (
              <>
                <button
                  type="button"
                  onClick={onDismissPreview}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition duration-200 hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                  aria-label="プレビュー取得をキャンセル"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    ×
                  </span>
                </button>
                <PreviewSkeleton />
              </>
            )}
            {!loadingOgp && preview && (
              <PreviewCard
                preview={preview}
                saving={saving}
                onRetry={() => onPreview()}
                onDismiss={onDismissPreview}
              />
            )}
            {showPostPreviewFields && (
              <div className="flex flex-col gap-3 border-t border-stone-100 px-4 pb-4 pt-3 dark:border-stone-800/80">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                    状態 <span className="text-red-600 dark:text-red-400">*</span>
                  </span>
                  <select
                    name="save-status"
                    value={saveStatus}
                    onChange={(e) => {
                      const v = e.target.value;
                      onSaveStatusChange(v === "" ? "" : (v as ArticleStatus));
                    }}
                    className="min-h-[40px] w-full rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-[14px] text-stone-900 outline-none transition-colors duration-200 focus:border-amber-400/90 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:focus:border-amber-500/80 dark:focus:ring-amber-500/25"
                  >
                    <option value="" disabled>
                      選んでください
                    </option>
                    {STATUS_SAVE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL_JA[s]}
                      </option>
                    ))}
                  </select>
                </label>
                {needsManualTitle && (
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                      タイトル <span className="text-red-600 dark:text-red-400">*</span>
                    </span>
                    <input
                      type="text"
                      name="save-title-manual"
                      value={saveTitleManual}
                      onChange={(e) => onSaveTitleManualChange(e.target.value)}
                      placeholder="ページ内容がわかる短いタイトル"
                      className="min-h-[44px] w-full rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-[14px] text-stone-900 outline-none transition-colors duration-200 placeholder:text-stone-400 focus:border-amber-400/90 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:focus:border-amber-500/80 dark:focus:ring-amber-500/25"
                    />
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      プレビューは参考表示です（ドメインからの仮題）。保存には入力が必要です。
                    </span>
                  </label>
                )}
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">メモ（任意）</span>
                  <textarea
                    name="save-note"
                    rows={2}
                    value={saveNote}
                    onChange={(e) => onSaveNoteChange(e.target.value)}
                    placeholder="なぜ保存したかメモすると後で見返しやすいです"
                    className="min-h-[52px] w-full resize-y rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-[14px] text-stone-900 outline-none transition-colors duration-200 placeholder:text-stone-400 focus:border-amber-400/90 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:focus:border-amber-500/80 dark:focus:ring-amber-500/25"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">タグ（任意）</span>
                  <input
                    type="text"
                    name="tags"
                    value={tagsInput}
                    onChange={(e) => onTagsInputChange(e.target.value)}
                    placeholder="例: frontend, 記事メモ"
                    className="min-h-[40px] w-full rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 text-[14px] text-stone-900 outline-none transition-colors duration-200 placeholder:text-stone-400 focus:border-amber-400/90 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:focus:border-amber-500/80 dark:focus:ring-amber-500/25"
                  />
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">カンマまたは読点で区切れます</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="px-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
        プレビュー直下で状態を選び、URL 欄の保存で一覧に追加できます。
      </p>
    </section>
  );
}

function PreviewSkeleton() {
  return (
    <div className="px-4 py-3" aria-busy="true" aria-label="プレビューを読み込み中">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-0.5">
          <div className="h-3 w-24 animate-pulse rounded-md bg-stone-200 dark:bg-stone-600" />
          <div className="h-4 w-[88%] animate-pulse rounded-md bg-stone-200 dark:bg-stone-600" />
          <div className="h-3 w-1/2 animate-pulse rounded-md bg-stone-200 dark:bg-stone-600" />
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  preview,
  saving,
  onRetry,
  onDismiss,
}: {
  preview: PreviewData;
  saving: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const linkLayout = preview.displayKind === "link" || shouldUseLinkStylePreview(preview);
  if (linkLayout) {
    return <PreviewLinkCard preview={preview} saving={saving} onRetry={onRetry} onDismiss={onDismiss} />;
  }
  return <PreviewOgpCard preview={preview} saving={saving} onRetry={onRetry} onDismiss={onDismiss} />;
}

function PreviewCloseButton({
  onDismiss,
  saving,
}: {
  onDismiss: () => void;
  saving: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      disabled={saving}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition duration-200 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-40 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      aria-label="プレビューを閉じる"
    >
      <span className="text-lg leading-none" aria-hidden>
        ×
      </span>
    </button>
  );
}

/** Slack 風: 画像エリアなし・ドメイン＋favicon＋タイトル＋補助文言（URL は出さない） */
function PreviewLinkCard({
  preview,
  saving,
  onRetry,
  onDismiss,
}: {
  preview: PreviewData;
  saving: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const domain = normalizeDomainFromUrl(preview.url);
  const favicon = googleFaviconUrl(domain, 64);
  const site = siteLabelFromSource(preview);
  const title = primaryTitleForLinkDisplay(preview);
  const helper = linkCardHelperText(domain);
  const showRetry = Boolean(preview.error);

  return (
    <div className="relative px-4 py-3">
      <PreviewCloseButton onDismiss={onDismiss} saving={saving} />

      <div className="flex gap-3 pr-8">
        <div className="shrink-0 pt-0.5">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="h-10 w-10 rounded-lg border border-stone-200/80 bg-white object-contain dark:border-stone-600 dark:bg-stone-900" width={40} height={40} />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-stone-100 dark:bg-stone-800" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {showRetry && (
            <div className="mb-2 rounded-lg border border-amber-200/90 bg-amber-50/95 px-2.5 py-1.5 text-[11px] text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/35 dark:text-amber-100">
              <p className="opacity-90">{preview.error}</p>
              <button
                type="button"
                onClick={onRetry}
                disabled={saving}
                className="mt-1 font-medium text-amber-900 underline underline-offset-2 dark:text-amber-200"
              >
                再取得
              </button>
            </div>
          )}
          <p className="truncate text-[12px] font-medium text-stone-500 dark:text-stone-400">{site || "\u00a0"}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-stone-800 dark:text-stone-50">
            {title}
          </h3>
          <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">{helper}</p>
        </div>
      </div>
    </div>
  );
}

/** OGP サムネありの従来レイアウト */
function PreviewOgpCard({
  preview,
  saving,
  onRetry,
  onDismiss,
}: {
  preview: PreviewData;
  saving: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const hasPartialFailure = Boolean(preview.error);
  const title = primaryTitleForLinkDisplay(preview);
  const domain =
    preview.siteName?.trim() ||
    (() => {
      try {
        return new URL(preview.url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })();
  const faviconUrl = googleFaviconUrl(normalizeDomainFromUrl(preview.url), 64);

  return (
    <div className="relative p-4">
      <PreviewCloseButton onDismiss={onDismiss} saving={saving} />

      <div className="flex gap-3 pr-8">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800/80">
          {preview.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.imageUrl} alt="" className="h-full w-full object-cover object-top" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {hasPartialFailure && (
            <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="font-medium">取得できなかった情報があります</p>
              <p className="mt-0.5 opacity-90">{preview.error}</p>
              <button
                type="button"
                onClick={onRetry}
                disabled={saving}
                className="mt-1 text-[11px] font-medium text-amber-900 underline underline-offset-2 dark:text-amber-200"
              >
                再取得
              </button>
            </div>
          )}

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-stone-800 dark:text-stone-50">{title}</h3>
          {domain && (
            <p className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-stone-500 dark:text-stone-400">
              {faviconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconUrl} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
              )}
              <span className="truncate">{domain}</span>
            </p>
          )}
          {preview.description && !hasPartialFailure && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-stone-600 dark:text-stone-400">{preview.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
