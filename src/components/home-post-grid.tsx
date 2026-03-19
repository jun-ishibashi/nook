"use client";

import Link from "next/link";
import NookImage from "@/components/nook-image";
import LikeButton from "./like-button";
import BookmarkButton from "./bookmark-button";

export type HomePostGridItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  user: { id: string; name: string; image: string | null };
  itemCount: number;
  likeCount: number;
  liked: boolean;
  bookmarked: boolean;
  styleTags: string[];
  createdAt: string;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分`;
  if (diffHours < 24) return `${diffHours}時間`;
  if (diffDays < 7) return `${diffDays}日`;
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export default function HomePostGrid({
  posts,
  ariaLabelledBy,
}: {
  posts: HomePostGridItem[];
  /** ページ上部の見出し id（スクリーンリーダで一覧のラベルに紐づける） */
  ariaLabelledBy?: string;
}) {
  if (posts.length === 0) return null;

  const grid = (
    <div className="home-post-grid grid grid-cols-2 gap-3 sm:gap-4">
      {posts.map((post) => (
        <article key={post.id} className="group flex flex-col">
          {/* Image — 単体リンク（保存はオーバーレイ） */}
          <div
            className="home-post-tile__media relative aspect-[3/4] overflow-hidden"
            style={{ background: "var(--bg-wash)" }}
          >
            <Link href={`/post/${post.id}`} className="absolute inset-0 z-0 block">
              {post.thumbnail ? (
                <NookImage
                  src={post.thumbnail}
                  alt={post.title ? `${post.title}の写真` : "部屋の写真"}
                  fill
                  className="object-cover transition duration-300 group-hover:opacity-[0.96]"
                  sizes="(max-width: 640px) 50vw, 400px"
                />
              ) : (
                <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </Link>
            <div className="absolute right-0 top-0 z-10 p-0.5 opacity-80 transition group-hover:opacity-100">
              <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} size="sm" />
            </div>
          </div>

          <div className="mt-1.5 px-0">
            <Link href={`/post/${post.id}`}>
              <p
                className="text-[13px] font-medium leading-snug line-clamp-2 transition group-hover:underline"
                style={{ color: "var(--text)" }}
              >
                {post.title}
              </p>
            </Link>
            {post.itemCount > 0 ? (
              <p className="mt-0.5 text-[10px] font-medium tabular-nums" style={{ color: "var(--text-faint)" }}>
                家具・雑貨 {post.itemCount}
              </p>
            ) : null}
            <div className="mt-1 flex items-center justify-between gap-1">
              <Link
                href={`/user/${post.user.id}`}
                className="flex min-h-9 min-w-0 flex-1 items-center gap-1 rounded-md py-0.5 transition hover:opacity-80"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold"
                  style={{ background: "var(--bg-sunken)", color: "var(--text-secondary)" }}
                >
                  {(post.user.name && post.user.name.trim()[0]) || "?"}
                </div>
                <span className="truncate text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {post.user.name}
                </span>
              </Link>
              <div className="flex shrink-0 items-center gap-0">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.liked}
                  initialCount={post.likeCount}
                  size="sm"
                  showCount={false}
                />
                <Link
                  href={`/post/${post.id}`}
                  className="-mr-1 inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-1 text-[10px] tabular-nums transition hover:opacity-80"
                  style={{ color: "var(--text-faint)" }}
                  title={formatDate(post.createdAt)}
                >
                  {formatDate(post.createdAt)}
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  if (ariaLabelledBy) {
    return (
      <div role="region" aria-labelledby={ariaLabelledBy}>
        {grid}
      </div>
    );
  }

  return grid;
}
