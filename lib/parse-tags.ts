/** カンマ・読点区切りのタグ入力を正規化（空要素除去・重複除去はしない） */
export function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,\u3001]/)
    .map((t) => t.trim())
    .filter(Boolean);
}
