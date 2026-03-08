"use client";

import { useState } from "react";
import DashboardPosts from "./dashboard-posts";
import Link from "next/link";

type MyPost = { id: string; title: string; thumbnail: string | null; itemCount: number; likeCount: number; createdAt: string };
type BookmarkedPost = { id: string; title: string; thumbnail: string | null; userName: string; itemCount: number; likeCount: number; createdAt: string };

export default function DashboardContent({ posts, bookmarks }: { posts: MyPost[]; bookmarks: BookmarkedPost[] }) {
  const [tab, setTab] = useState<"posts" | "bookmarks">("posts");

  return (
    <section className="mt-6">
      <div className="flex" role="tablist" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["posts", "bookmarks"] as const).map((t) => (
          <button
            key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-center text-sm font-bold transition"
            style={tab === t ? { color: "var(--text)", borderBottom: "2px solid var(--text)" } : { color: "var(--text-muted)" }}
          >
            {t === "posts" ? "投稿" : "保存"}
            {(t === "posts" ? posts.length : bookmarks.length) > 0 && (
              <span className="ml-1 text-xs">{t === "posts" ? posts.length : bookmarks.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "posts" && (
          posts.length > 0 ? <DashboardPosts posts={posts} /> : <EmptyState icon="camera" title="まだ投稿がないよ" description="お部屋の写真をシェアしよう" />
        )}
        {tab === "bookmarks" && (
          bookmarks.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {bookmarks.map((bm) => (
                <Link key={bm.id} href={`/post/${bm.id}`} className="relative aspect-square overflow-hidden" style={{ background: "var(--bg-sunken)" }}>
                  {bm.thumbnail ? <img src={bm.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" /> : (
                    <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg></div>
                  )}
                </Link>
              ))}
            </div>
          ) : <EmptyState icon="bookmark" title="保存した投稿がないよ" description="気になる投稿をブックマークしよう" />
        )}
      </div>
    </section>
  );
}

function EmptyState({ icon, title, description }: { icon: "camera" | "bookmark"; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--bg-sunken)" }}>
        {icon === "camera" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{title}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
    </div>
  );
}
