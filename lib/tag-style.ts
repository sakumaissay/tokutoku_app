/** タグ文字列から安定したパステル系クラスを返す（一覧・詳細で共通） */
const PALETTES = [
  "bg-fuchsia-100 text-fuchsia-900 ring-1 ring-fuchsia-200/90 dark:bg-fuchsia-950/55 dark:text-fuchsia-100 dark:ring-fuchsia-800/50",
  "bg-sky-100 text-sky-900 ring-1 ring-sky-200/90 dark:bg-sky-950/55 dark:text-sky-100 dark:ring-sky-800/50",
  "bg-amber-100 text-amber-950 ring-1 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/50",
  "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800/50",
  "bg-violet-100 text-violet-900 ring-1 ring-violet-200/90 dark:bg-violet-950/55 dark:text-violet-100 dark:ring-violet-800/50",
  "bg-orange-100 text-orange-900 ring-1 ring-orange-200/90 dark:bg-orange-950/50 dark:text-orange-100 dark:ring-orange-800/50",
  "bg-cyan-100 text-cyan-900 ring-1 ring-cyan-200/90 dark:bg-cyan-950/55 dark:text-cyan-100 dark:ring-cyan-800/50",
  "bg-rose-100 text-rose-900 ring-1 ring-rose-200/90 dark:bg-rose-950/55 dark:text-rose-100 dark:ring-rose-800/50",
] as const;

export function tagPillClass(tag: string): string {
  let h = 2166136261;
  for (let i = 0; i < tag.length; i++) {
    h ^= tag.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % PALETTES.length;
  return PALETTES[idx]!;
}
