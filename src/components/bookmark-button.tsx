"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BookmarkButton({ postId, initialBookmarked, size = "md" }: {
  postId: string; initialBookmarked: boolean; size?: "sm" | "md";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!session) { router.push("/login"); return; }
    setBookmarked((prev) => !prev);
    startTransition(async () => {
      try {
        const res = await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
        if (res.ok) { const data = await res.json(); setBookmarked(data.bookmarked); }
      } catch { setBookmarked((prev) => !prev); }
    });
  }

  const iconSize = size === "sm" ? 16 : 20;
  return (
    <button
      type="button" onClick={toggleBookmark} disabled={isPending}
      className={`group inline-flex items-center transition active:scale-90 ${size === "sm" ? "p-1" : "px-2 py-1.5"}`}
      style={{ color: bookmarked ? "var(--text)" : "var(--text-muted)" }}
      aria-label={bookmarked ? "保存を取り消す" : "保存する"} aria-pressed={bookmarked}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" aria-hidden>
        {bookmarked ? (
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        ) : (
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </svg>
    </button>
  );
}
