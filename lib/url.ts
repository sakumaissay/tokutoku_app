/** 貼り付けで scheme が無い URL も扱えるようにする */
export function normalizeHttpUrl(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/** テキスト内の最初の http(s) URL を取り出す（文章ごと貼られた場合用） */
export function extractFirstHttpUrl(text: string): string | null {
  const m = text.trim().match(/https?:\/\/[^\s<>"'{}|\\^`[\]]+/i);
  return m ? m[0] : null;
}

/** 一覧カード用: 表示用ホスト名 */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

