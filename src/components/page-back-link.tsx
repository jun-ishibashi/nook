import Link from "next/link";
import type { ReactNode } from "react";

/** 法務ページなど、トップへの戻り（タッチ領域・矢印を統一） */
export default function PageBackLink({
  href = "/",
  children = "みんなの部屋へ",
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="nook-fg-muted inline-flex min-h-[var(--touch)] items-center gap-2 text-sm font-medium transition hover:opacity-75 sm:text-xs"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M10 12L6 8l4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}
