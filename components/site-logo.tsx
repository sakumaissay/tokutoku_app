"use client";

import Link from "next/link";

const MARK_SRC = "/brand/tokkuri-pour-stroke-tonal.svg";

type Props = {
  /** 一覧トップ: 大きめ / 詳細: 小さめ */
  variant?: "header" | "compact";
  className?: string;
};

export function SiteLogo({ variant = "header", className = "" }: Props) {
  const isCompact = variant === "compact";
  const imgSize = isCompact ? 32 : 40;
  const textClass = isCompact
    ? "text-lg font-bold tracking-tight text-stone-800 dark:text-stone-50"
    : "text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-50";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f3ed] dark:focus-visible:ring-offset-[#141210] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG マークは img で十分 */}
      <img
        src={MARK_SRC}
        alt=""
        width={imgSize}
        height={imgSize}
        className={`shrink-0 ${isCompact ? "h-8 w-8" : "h-10 w-10"}`}
        decoding="async"
      />
      <span className={textClass}>tokutoku</span>
    </Link>
  );
}
