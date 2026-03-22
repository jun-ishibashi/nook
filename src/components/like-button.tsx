"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { loginCallbackHref } from "@/lib/login-href";

export default function LikeButton({ postId, initialLiked, initialCount, size = "md", showCount = true }: {
  postId: string; initialLiked: boolean; initialCount: number; size?: "sm" | "md"; showCount?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push(loginCallbackHref(pathname));
      return;
    }
    if (pending) return;
    setPending(true);

    const wasLiked = liked;
    const prevCount = count;
    setLiked(!wasLiked);
    setCount(wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { liked?: boolean; likeCount?: number };
        if (typeof data.liked === "boolean") setLiked(data.liked);
        if (typeof data.likeCount === "number") setCount(data.likeCount);
      } else {
        setLiked(wasLiked);
        setCount(prevCount);
      }
    } catch {
      setLiked(wasLiked);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  const iconSize = size === "sm" ? 16 : 20;
  return (
    <button
      type="button"
      onClick={toggleLike}
      aria-busy={pending}
      className={`group inline-flex items-center justify-center gap-1 transition active:scale-[0.96] ${pending ? "pointer-events-none opacity-80" : ""} ${liked ? "nook-like-fg-on" : "nook-fg-muted"} ${size === "sm" ? "min-h-11 min-w-11 rounded-md px-1 py-1 text-xs sm:min-h-9 sm:min-w-9 sm:text-[11px]" : "min-h-11 px-3 py-2 text-xs sm:min-h-0 sm:px-2 sm:py-1.5"}`}
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
