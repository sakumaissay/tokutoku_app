import { tagPillClass } from "@/lib/tag-style";

type Props = {
  tag: string;
  className?: string;
};

/** 一覧・詳細で使うタグバッジ */
export function TagPill({ tag, className = "" }: Props) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center truncate rounded-full px-2.5 py-1 text-xs font-medium ${tagPillClass(tag)} ${className}`}
      title={tag}
    >
      {tag}
    </span>
  );
}
