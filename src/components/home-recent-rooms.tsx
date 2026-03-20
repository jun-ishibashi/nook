"use client";

import Link from "next/link";
import NookImage from "@/components/nook-image";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function HomeRecentRooms() {
  const { recentPosts } = useRecentlyViewed();

  if (recentPosts.length === 0) return null;

  return (
    <section className="home-recent-rooms mb-8" aria-labelledby="recent-rooms-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="recent-rooms-heading" className="nook-section-label">最近見た部屋</h2>
        <span className="text-[10px] font-medium tracking-wide" style={{ color: "var(--text-faint)" }}>
          履歴
        </span>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6">
        {recentPosts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group relative flex w-24 shrink-0 flex-col gap-1.5 transition active:scale-[0.97]"
          >
            <div
              className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
            >
              {post.thumbnail ? (
                <NookImage
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-110"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
            <p className="truncate text-[10px] font-medium leading-snug" style={{ color: "var(--text-muted)" }}>
              {post.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
