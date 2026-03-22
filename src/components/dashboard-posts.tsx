"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  category?: string;
  thumbnail: string | null;
  itemCount: number;
  likeCount: number;
  createdAt: string;
};

export default function DashboardPosts({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleDelete(postId: string) {
    setDeleting(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) startTransition(() => router.refresh());
    } finally { setDeleting(null); setConfirmId(null); }
  }

  return (
    <div className="dashboard-tile-grid grid grid-cols-3 gap-2 sm:gap-2.5">
      {posts.map((post) => (
        <div
          key={post.id}
          className="nook-bg-sunken relative aspect-square overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)]"
        >
          <Link href={`/post/${post.id}`} className="block h-full w-full">
            {post.thumbnail ? (
              <img
                src={post.thumbnail}
                alt={post.title ? `${post.title}の写真` : "自分の部屋の写真"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="nook-fg-faint flex h-full items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </Link>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-2">
            <div className="nook-dash-post-bar flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1.5">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-white">
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                {post.likeCount}
              </span>
              {post.itemCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  {post.itemCount}
                </span>
              )}
              </div>
              {confirmId === post.id ? (
                <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="nook-dash-post-btn-outline rounded-full px-3 py-1.5 text-[10px] font-semibold text-white transition"
                  >
                    戻る
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={!!deleting}
                    className="nook-dash-post-btn-danger rounded-full px-3 py-1.5 text-[10px] font-semibold text-white transition disabled:opacity-50"
                  >
                    {deleting === post.id ? "…" : "削除する"}
                  </button>
                </div>
              ) : (
                <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
                  <Link
                    href={`/post/${post.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="nook-dash-post-btn-outline-soft rounded-full px-3 py-1.5 text-[10px] font-semibold text-white transition"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmId(post.id);
                    }}
                    className="nook-dash-post-btn-ghost rounded-full px-3 py-1.5 text-[10px] font-semibold text-white transition"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
