"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FollowButton({
  userId,
  initialFollowing,
  initialFollowerCount,
  size = "md",
  className = "",
}: {
  userId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isPending, startTransition] = useTransition();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/login");
      return;
    }
    const next = !following;
    setFollowing(next);
    setFollowerCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    startTransition(async () => {
      try {
        const res = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          const data = (await res.json()) as { following: boolean; followerCount: number };
          setFollowing(data.following);
          setFollowerCount(data.followerCount);
          router.refresh();
        }
      } catch {
        setFollowing((prev) => !prev);
        setFollowerCount((c) => (next ? Math.max(0, c - 1) : c + 1));
      }
    });
  }

  const pad = size === "sm" ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-xs";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-busy={isPending}
      className={`inline-flex items-center justify-center rounded-full font-bold transition active:scale-[0.97] disabled:opacity-60 ${pad} ${className}`}
      style={
        following
          ? {
              background: "var(--bg-sunken)",
              color: "var(--text-secondary)",
              border: "1px solid var(--hairline)",
            }
          : {
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--hairline)",
            }
      }
      aria-pressed={following}
    >
      {following ? "フォロー中" : "フォロー"}
      <span className="ml-1.5 tabular-nums opacity-80" aria-hidden>
        {followerCount}
      </span>
    </button>
  );
}
