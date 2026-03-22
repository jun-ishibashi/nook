"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { markFollowFeedViewed } from "@/app/actions/follow-feed";
import { buildHomeHref } from "@/lib/home-href";

/**
 * ホームの「みんなの部屋 / フォロー中」切り替え（他の query は維持）
 * ログイン済みのときだけマウントすること（未ログインは `page.tsx` で出し分け）
 */
export default function HomeFeedTabs() {
  const sp = useSearchParams();
  const isFollowing = sp.get("feed") === "following";

  useEffect(() => {
    if (!isFollowing) return;
    void markFollowFeedViewed();
  }, [isFollowing]);

  const allHref = buildHomeHref(sp, (p) => p.delete("feed"));
  const followingHref = buildHomeHref(sp, (p) => p.set("feed", "following"));

  return (
    <nav className="home-feed-nav home-feed-nav--home flex" aria-label="一覧の切り替え">
      <Link
        href={allHref}
        scroll={false}
        aria-current={!isFollowing ? "page" : undefined}
        className={`feed-tab ${!isFollowing ? "feed-tab--active" : ""}`}
      >
        みんなの部屋
      </Link>
      <Link
        href={followingHref}
        scroll={false}
        aria-current={isFollowing ? "page" : undefined}
        className={`feed-tab ${isFollowing ? "feed-tab--active" : ""}`}
      >
        フォロー中
      </Link>
    </nav>
  );
}
