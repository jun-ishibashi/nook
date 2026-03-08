"use client";

import Link from "next/link";
import LikeButton from "./like-button";
import BookmarkButton from "./bookmark-button";
import CategoryIcon from "./category-icon";
import { getCategoryLabel } from "@/lib/categories";

type Post = {
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
  createdAt: string;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export default function HomePostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`} className="group block">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl" style={{ background: "var(--bg-wash)" }}>
            {post.thumbnail ? (
              <img
                src={post.thumbnail}
                alt=""
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            {/* Bookmark */}
            <div className="absolute right-1.5 top-1.5"><BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} size="sm" /></div>
            {/* Category pill */}
            {post.category && post.category !== "other" && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm" style={{ background: "rgba(247,246,244,0.85)", color: "var(--text-secondary)" }}>
                <CategoryIcon value={post.category} size={10} />
                {getCategoryLabel(post.category)}
              </span>
            )}
            {/* Item count */}
            {post.itemCount > 0 && (
              <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm" style={{ background: "rgba(44,40,37,0.6)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                {post.itemCount}
              </span>
            )}
          </div>
          {/* Info */}
          <div className="mt-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: "var(--bg-wash)", color: "var(--text-secondary)" }}>
                {post.user.name[0]}
              </div>
              <span className="truncate text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{post.user.name}</span>
              <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>{formatDate(post.createdAt)}</span>
            </div>
            <p className="mt-1 text-[13px] font-bold leading-tight line-clamp-2 group-hover:underline" style={{ color: "var(--text)" }}>
              {post.title}
            </p>
            <div className="mt-1 flex items-center">
              <LikeButton postId={post.id} initialLiked={post.liked} initialCount={post.likeCount} size="sm" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
