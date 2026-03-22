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
  totalPrice: number | null;
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

/**
 * アスペクト比パターン: 雑誌的リズム（フィードの視線導線）
 * featured (index=0): フル幅 16:9
 * 奇数: 3:4（やや縦長）
 * 偶数: 4:5（標準）
 */
function tileAspect(index: number, featured: boolean): string {
  if (featured && index === 0) return "aspect-[16/9]";
  // 1-indexed pattern after featured
  const pos = featured ? index : index + 1;
  return pos % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/5]";
}

export default function HomePostGrid({
  posts,
  ariaLabelledBy,
  enableFeatured = false,
}: {
  posts: HomePostGridItem[];
  ariaLabelledBy?: string;
  enableFeatured?: boolean;
}) {
  if (posts.length === 0) return null;

  const hasFeatured = enableFeatured && posts.length >= 3;

  const grid = (
    <div className="home-post-grid">
      {posts.map((post, index) => {
        const isFeatured = hasFeatured && index === 0;
        return (
          <article
            key={post.id}
            className={`stagger-item group flex flex-col ${isFeatured ? "home-post-tile--featured" : ""}`}
          >
            <div
              className={`home-post-tile__media home-post-tile__media--renewed nook-bg-wash relative overflow-hidden ${tileAspect(index, hasFeatured)}`}
            >
              <Link href={`/post/${post.id}`} className="absolute inset-0 z-0 block">
                {post.thumbnail ? (
                  <NookImage
                    src={post.thumbnail}
                    alt={post.title ? `${post.title}の写真` : "部屋の写真"}
                    fill
                    className="object-cover transition duration-300 group-hover:opacity-[0.97]"
                    sizes={isFeatured ? "100vw" : "(max-width: 640px) 50vw, 400px"}
                    priority={index < 4}
                  />
                ) : (
                  <div className="nook-fg-faint flex h-full items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </Link>
              {/* 右上：保存ボタン */}
              <div className="absolute right-0 top-0 z-10 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} size="sm" />
              </div>
              {/* 左下：いいねボタン（写真オーバーレイ） */}
              <div className="absolute bottom-0 left-0 z-10 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.liked}
                  initialCount={post.likeCount}
                  size="sm"
                  showCount={false}
                />
              </div>
            </div>

            <div className="mt-2 px-0 sm:mt-2.5">
              <Link href={`/post/${post.id}`} className="block">
                <p className="nook-fg text-[13px] font-semibold leading-snug line-clamp-2 transition group-hover:opacity-88">
                  {post.title}
                </p>
              </Link>
              <div className="mt-1 flex items-center justify-between gap-2">
                <Link
                  href={`/user/${post.user.id}`}
                  className="flex min-h-7 min-w-0 flex-1 items-center gap-1.5 py-0.5 transition hover:opacity-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="nook-bg-sunken nook-fg-secondary flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold">
                    {(post.user.name && post.user.name.trim()[0]) || "?"}
                  </div>
                  <span className="nook-fg-muted truncate text-[10px] font-medium">
                    {post.user.name}
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  {post.itemCount > 0 ? (
                    <span
                      className="nook-fg-faint text-[9px] font-medium tabular-nums"
                      title="家具・雑貨（購入リンクの行）"
                    >
                      {post.itemCount}
                    </span>
                  ) : null}
                  <time
                    dateTime={post.createdAt}
                    className="nook-fg-faint inline-flex items-center justify-end tabular-nums text-[9px]"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          </article>
        );
      })}
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
