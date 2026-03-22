"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { loginCallbackHref } from "@/lib/login-href";

export default function BookmarkButton({ postId, initialBookmarked, size = "md" }: {
  postId: string; initialBookmarked: boolean; size?: "sm" | "md";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push(loginCallbackHref(pathname));
      return;
    }
    if (pending) return;
    setPending(true);

    const was = bookmarked;
    setBookmarked(!was);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { bookmarked?: boolean };
        if (typeof data.bookmarked === "boolean") setBookmarked(data.bookmarked);
      } else {
        setBookmarked(was);
      }
    } catch {
      setBookmarked(was);
    } finally {
      setPending(false);
    }
  }

  const iconSize = size === "sm" ? 16 : 20;
  return (
    <button
      type="button"
      onClick={toggleBookmark}
      aria-busy={pending}
      className={`group inline-flex items-center justify-center transition active:scale-[0.96] ${pending ? "pointer-events-none opacity-80" : ""} ${bookmarked ? "nook-fg" : "nook-fg-muted"} ${size === "sm" ? "min-h-11 min-w-11 rounded-md p-1 sm:min-h-9 sm:min-w-9" : "min-h-11 min-w-11 px-2 py-2 sm:min-h-0 sm:min-w-0 sm:px-2 sm:py-1.5"}`}
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
