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
  { id: "posts" as const, label: "投稿", countKey: "posts" as const },
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
      <p id="dashboard-main-heading" className="nook-section-label mb-3">
        投稿・保存・欲しい
      </p>

      <div className="flex border-b nook-border-hairline" role="tablist" aria-label="マイページのタブ">
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
                aria-label="自分の投稿をタイトルでさがす"
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
              <p className="nook-fg-muted text-[11px]">
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
              <p className="nook-fg-muted py-12 text-center text-sm">
                該当する投稿がありません
              </p>
            )
          ) : (
            <EmptyState icon="camera" title="まだ投稿がありません" description="一枚からで大丈夫です。写真を載せると、ここに並びます。" />
          )
        )}
        {tab === "bookmarks" && (
          bookmarks.length > 0 ? (
            <div className="dashboard-tile-grid grid grid-cols-3 gap-2 sm:gap-2.5">
              {bookmarks.map((bm) => (
                <Link
                  key={bm.id}
                  href={`/post/${bm.id}`}
                  className="nook-bg-sunken relative aspect-square overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)]"
                >
                  {bm.thumbnail ? (
                    <img
                      src={bm.thumbnail}
                      alt={bm.title ? `${bm.title}の写真` : "保存した部屋の写真"}
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
              ))}
            </div>
          ) : (
            <EmptyState icon="bookmark" title="保存した部屋はまだありません" description="気になった部屋を保存しておくと、あとから見返せます。" />
          )
        )}
        {tab === "wishlist" && (
          wishlist.length > 0 ? (
            <DashboardWishlist items={wishlist} />
          ) : (
            <EmptyState icon="wish" title="欲しいはまだありません" description="気になった家具・雑貨を入れておくと、あとからゆっくり見返せます。" />
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
    <div className="dashboard-empty-state nook-elevated-surface flex flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20">
      <div className="nook-bg-sunken mb-3 flex h-14 w-14 items-center justify-center rounded-full">
        {icon === "camera" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="nook-fg-faint">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : icon === "bookmark" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="nook-fg-faint">
            <path
              d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="nook-fg-faint" aria-hidden>
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
      <p className="nook-fg text-sm font-semibold">{title}</p>
      <p className="nook-fg-muted mt-1 max-w-xs px-4 text-xs leading-relaxed">
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
