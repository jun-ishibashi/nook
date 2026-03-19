"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import DashboardPosts from "./dashboard-posts";
import DashboardWishlist, { type WishlistRow } from "./dashboard-wishlist";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "@/components/category-icon";

type MyPost = {
  id: string;
  title: string;
  category: string;
  thumbnail: string | null;
  itemCount: number;
  likeCount: number;
  createdAt: string;
};
type BookmarkedPost = { id: string; title: string; thumbnail: string | null; userName: string; itemCount: number; likeCount: number; createdAt: string };

const TABS = [
  { id: "posts" as const, label: "部屋", countKey: "posts" as const },
  { id: "bookmarks" as const, label: "保存", countKey: "bookmarks" as const },
  { id: "wishlist" as const, label: "欲しい", countKey: "wishlist" as const },
];

export default function DashboardContent({
  posts,
  bookmarks,
  wishlist,
}: {
  posts: MyPost[];
  bookmarks: BookmarkedPost[];
  wishlist: WishlistRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spTab = searchParams.get("tab");
  const tab: "posts" | "bookmarks" | "wishlist" =
    spTab === "bookmarks" || spTab === "wishlist" || spTab === "posts" ? spTab : "posts";
  const [postCategory, setPostCategory] = useState<string>("");
  const [postQuery, setPostQuery] = useState("");

  function goTab(next: "posts" | "bookmarks" | "wishlist") {
    router.replace(next === "posts" ? "/dashboard" : `/dashboard?tab=${next}`, { scroll: false });
  }

  const filteredPosts = useMemo(() => {
    const q = postQuery.trim().toLowerCase();
    return posts.filter((p) => {
      if (postCategory && p.category !== postCategory) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, postCategory, postQuery]);

  return (
    <section className="dashboard-main-section" aria-labelledby="dashboard-main-heading">
      <p id="dashboard-main-heading" className="nook-section-label mb-2">
        部屋・保存・欲しい
      </p>

      <div
        className="flex"
        role="tablist"
        aria-label="マイページのタブ"
        style={{ borderBottom: "1px solid var(--hairline)" }}
      >
        {TABS.map((t) => {
          const count =
            t.countKey === "posts"
              ? posts.length
              : t.countKey === "bookmarks"
                ? bookmarks.length
                : wishlist.length;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`dashboard-tab-${t.id}`}
              aria-controls="dashboard-panel"
              aria-selected={tab === t.id}
              onClick={() => goTab(t.id)}
              className="nook-tab flex-1 sm:text-sm"
            >
              {t.label}
              {count > 0 ? <span className="ml-0.5 tabular-nums opacity-80">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <div id="dashboard-panel" role="tabpanel" aria-labelledby={`dashboard-tab-${tab}`} className="mt-4">
        {tab === "posts" && posts.length > 0 && (
          <div className="mb-4 space-y-3">
            <label className="block">
              <span className="nook-overline normal-case tracking-[0.12em]">タイトルでさがす</span>
              <input
                type="search"
                value={postQuery}
                onChange={(e) => setPostQuery(e.target.value)}
                placeholder="タイトルの一部…"
                className="nook-input-line"
                aria-label="自分の部屋をタイトルでさがす"
              />
            </label>
            <div>
              <span className="nook-overline">カテゴリ</span>
              <div className="flex gap-0 overflow-x-auto scrollbar-hide" role="tablist" aria-label="カテゴリ">
                <button
                  type="button"
                  role="tab"
                  aria-selected={postCategory === ""}
                  onClick={() => setPostCategory("")}
                  className="filter-chip text-[11px]"
                >
                  すべて
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="tab"
                    aria-selected={postCategory === c.value}
                    onClick={() => setPostCategory(c.value)}
                    className="filter-chip flex items-center gap-1 text-[11px]"
                  >
                    <CategoryIcon value={c.value} size={12} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            {(postQuery || postCategory) && (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                表示 {filteredPosts.length}・全 {posts.length}
              </p>
            )}
          </div>
        )}
        {tab === "posts" && (
          posts.length > 0 ? (
            filteredPosts.length > 0 ? (
              <DashboardPosts posts={filteredPosts} />
            ) : (
              <p className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                該当する部屋がありません
              </p>
            )
          ) : (
            <EmptyState icon="camera" title="まだ写真を載せていません" description="写真を載せると、自分の部屋がここに並びます。" />
          )
        )}
        {tab === "bookmarks" && (
          bookmarks.length > 0 ? (
            <div className="dashboard-tile-grid grid grid-cols-3 gap-2 sm:gap-2.5">
              {bookmarks.map((bm) => (
                <Link
                  key={bm.id}
                  href={`/post/${bm.id}`}
                  className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)]"
                  style={{ background: "var(--bg-sunken)" }}
                >
                  {bm.thumbnail ? (
                    <img
                      src={bm.thumbnail}
                      alt={bm.title ? `${bm.title}の写真` : "保存した部屋の写真"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="bookmark" title="保存した部屋はまだありません" description="気になった部屋の詳細から保存できます。" />
          )
        )}
        {tab === "wishlist" && (
          wishlist.length > 0 ? (
            <DashboardWishlist items={wishlist} />
          ) : (
            <EmptyState icon="wish" title="欲しいはまだありません" description="部屋の詳細から、気になった家具・雑貨を欲しいに入れられます。" />
          )
        )}
      </div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: "camera" | "bookmark" | "wish";
  title: string;
  description: string;
}) {
  return (
    <div className="dashboard-empty-state flex flex-col items-center rounded-[var(--radius-card)] border py-16 text-center sm:py-20" style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}>
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--bg-sunken)" }}>
        {icon === "camera" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : icon === "bookmark" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }}>
            <path
              d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }} aria-hidden>
            <path
              d="M12 21s-7-4.35-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.65-7 10-7 10z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </p>
      <p className="mt-1 max-w-xs px-4 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
      {icon === "camera" ? (
        <label htmlFor="post_modal" className="btn-primary mt-6 cursor-pointer text-xs">
          写真を載せる
        </label>
      ) : null}
    </div>
  );
}
