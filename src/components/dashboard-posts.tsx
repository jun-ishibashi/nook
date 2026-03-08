"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Post = { id: string; title: string; thumbnail: string | null; itemCount: number; likeCount: number; createdAt: string };

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
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div key={post.id} className="group relative aspect-square overflow-hidden" style={{ background: "var(--bg-sunken)" }}>
          <Link href={`/post/${post.id}`}>
            {post.thumbnail ? <img src={post.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" /> : (
              <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg></div>
            )}
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100" style={{ background: "rgba(44,40,37,0.45)" }}>
            <div className="flex items-center gap-3 text-sm font-bold text-white">
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
              <div className="mt-1 flex gap-1">
                <button type="button" onClick={() => handleDelete(post.id)} disabled={!!deleting} className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white">{deleting === post.id ? "..." : "削除"}</button>
                <button type="button" onClick={() => setConfirmId(null)} className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.8)", color: "var(--text)" }}>取消</button>
              </div>
            ) : (
              <button type="button" onClick={(e) => { e.preventDefault(); setConfirmId(post.id); }} className="mt-1 rounded-full px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm transition" style={{ background: "rgba(255,255,255,0.2)" }}>削除</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
