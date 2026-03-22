import type { CSSProperties } from "react";
import { getMoodFilter } from "@/lib/image-mood";

type Props = {
  /** スクリーンリーダー向け（空なら既定文言） */
  label?: string;
  mood?: string;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 親が `relative` のとき、画像と同様に領域を埋める */
  absoluteFill?: boolean;
};

/**
 * 外部 URL・画像最適化の失敗時などに表示するプレースホルダー（next/image の代替）
 */
export function BrokenImagePlaceholder({
  label = "画像を読み込めませんでした",
  mood,
  compact = false,
  className = "",
  style,
  absoluteFill = false,
}: Props) {
  const size = compact ? 20 : 32;
  const filterStyle: CSSProperties | undefined = mood
    ? { filter: getMoodFilter(mood) }
    : undefined;

  return (
    <div
      className={`flex items-center justify-center nook-bg-wash nook-fg-faint ${absoluteFill ? "absolute inset-0" : ""} ${className}`.trim()}
      style={{ ...filterStyle, ...style }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
