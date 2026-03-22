"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LikeButton({ postId, initialLiked, initialCount, size = "md", showCount = true }: {
  postId: string; initialLiked: boolean; initialCount: number; size?: "sm" | "md"; showCount?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!session) { router.push("/login"); return; }
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));
    startTransition(async () => {
      try {
        const res = await fetch("/api/likes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
        if (res.ok) { const data = await res.json(); setLiked(data.liked); setCount(data.likeCount); }
      } catch { setLiked((prev) => !prev); setCount((prev) => (liked ? prev + 1 : prev - 1)); }
    });
  }

  const iconSize = size === "sm" ? 16 : 20;
  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={isPending}
      aria-busy={isPending}
      className={`group inline-flex items-center justify-center gap-1 transition active:scale-[0.96] ${liked ? "nook-like-fg-on" : "nook-fg-muted"} ${size === "sm" ? "min-h-9 min-w-9 rounded-md px-1 py-1 text-[11px]" : "px-2 py-1.5 text-xs"}`}
      aria-label={liked ? "いいねを取り消す" : "いいねする"} aria-pressed={liked}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" aria-hidden>
        {liked ? (
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="currentColor"/>
        ) : (
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </svg>
      {showCount ? <span className="font-bold tabular-nums">{count}</span> : null}
    </button>
  );
}
