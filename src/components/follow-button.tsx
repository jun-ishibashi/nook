"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { loginCallbackHref } from "@/lib/login-href";

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
  const pathname = usePathname();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push(loginCallbackHref(pathname));
      return;
    }
    if (pending) return;
    setPending(true);

    const wasFollowing = following;
    const prevCount = followerCount;
    const next = !wasFollowing;
    setFollowing(next);
    setFollowerCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

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
      } else {
        setFollowing(wasFollowing);
        setFollowerCount(prevCount);
      }
    } catch {
      setFollowing(wasFollowing);
      setFollowerCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  const pad =
    size === "sm"
      ? "min-h-11 px-3 py-2 text-xs sm:min-h-0 sm:py-1 sm:text-[11px]"
      : "min-h-11 px-4 py-2 text-xs sm:min-h-0 sm:py-1.5";

  const label = following
    ? `フォロー中、フォロワー${followerCount}人`
    : `フォローする（フォロワー${followerCount}人）`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-busy={pending}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full font-bold transition active:scale-[0.97] ${pending ? "pointer-events-none opacity-80" : ""} ${pad} ${className}`}
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
      <span aria-hidden>{following ? "フォロー中" : "フォロー"}</span>
      <span className="ml-1.5 tabular-nums opacity-80" aria-hidden>
        {followerCount}
      </span>
    </button>
  );
}
