"use client";

import Link from "next/link";
import NookImage from "@/components/nook-image";
import { formatFeedRelativeTime } from "@/lib/relative-time";
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
                    sizes={
                      isFeatured
                        ? "(max-width: 639px) 100vw, 672px"
                        : "(max-width: 640px) 50vw, 400px"
                    }
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
              <div className="nook-overlay-action-reveal absolute right-0 top-0 z-10 p-1.5">
                <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} size="sm" />
              </div>
              <div className="nook-overlay-action-reveal absolute bottom-0 left-0 z-10 p-1.5">
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
                <p className="nook-fg text-sm font-semibold leading-snug line-clamp-2 transition group-hover:opacity-88 sm:text-[13px]">
                  {post.title}
                </p>
              </Link>
              <div className="mt-1 flex items-center justify-between gap-2">
                <Link
                  href={`/user/${post.user.id}`}
                  className="flex min-h-[var(--touch)] min-w-0 flex-1 items-center gap-1.5 py-1 transition hover:opacity-80 sm:min-h-7 sm:py-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="nook-bg-sunken nook-fg-secondary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold sm:h-4 sm:w-4 sm:text-[8px]">
                    {(post.user.name && post.user.name.trim()[0]) || "?"}
                  </div>
                  <span className="nook-fg-muted truncate text-xs font-medium sm:text-[10px]">
                    {post.user.name}
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  {post.itemCount > 0 ? (
                    <span
                      className="nook-fg-faint text-[10px] font-medium tabular-nums sm:text-[9px]"
                      title="家具・雑貨（商品ページの行）"
                    >
                      {post.itemCount}
                    </span>
                  ) : null}
                  <time
                    dateTime={post.createdAt}
                    className="nook-fg-faint inline-flex items-center justify-end tabular-nums text-[10px] sm:text-[9px]"
                  >
                    {formatFeedRelativeTime(post.createdAt)}
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
