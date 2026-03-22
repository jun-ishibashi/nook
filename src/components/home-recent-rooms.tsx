"use client";

import Link from "next/link";
import NookImage from "@/components/nook-image";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function HomeRecentRooms() {
  const { recentPosts } = useRecentlyViewed();

  if (recentPosts.length === 0) return null;

  return (
    <section className="home-recent-rooms" aria-labelledby="recent-rooms-heading">
      <div className="mb-2 flex items-baseline justify-between gap-3 sm:mb-2.5">
        <h2 id="recent-rooms-heading" className="home-browse-label">
          最近見た部屋
        </h2>
      </div>
      <div className="nook-hscroll-mask nook-hscroll-mask-sm-clear -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-0 sm:gap-3.5 sm:px-0 sm:pb-2">
        {recentPosts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group relative flex w-[5.5rem] shrink-0 flex-col gap-1 transition active:scale-[0.98] sm:w-24"
          >
            <div className="relative aspect-square overflow-hidden rounded-md border transition-all duration-300 group-hover:shadow-md nook-border-hairline nook-bg-sunken">
              {post.thumbnail ? (
                <NookImage
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 639px) 5.5rem, 6rem"
                />
              ) : (
                <div className="nook-fg-faint flex h-full items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
            <p className="nook-fg-muted truncate nook-caption-sm font-medium">
              {post.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
