import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/session-user";
import DashboardContent from "@/components/dashboard-content";
import type { WishlistRow } from "@/components/dashboard-wishlist";
import ProfileSettings from "@/components/profile-settings";

export const metadata: Metadata = {
  title: "マイページ",
  description: "写真を載せた部屋・保存・欲しい・プロフィール。ムードと購入先をセットで残せます。",
};

export default async function DashboardPage() {
  const user = await getOptionalSessionUser({
    id: true,
    name: true,
    email: true,
    bio: true,
    profileLink: true,
    createdAt: true,
    _count: { select: { followsReceived: true, followsInitiated: true } },
  });
  if (!user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { medias: { take: 1, orderBy: { id: "asc" } }, _count: { select: { furnitureItems: true, likes: true } } },
  });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          medias: { take: 1, orderBy: { id: "asc" } },
          user: { select: { id: true, name: true } },
          _count: { select: { furnitureItems: true, likes: true } },
        },
      },
    },
  });

  const wishlistItems = await prisma.itemWishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    postCount: posts.length,
    totalLikes: posts.reduce((sum, p) => sum + p._count.likes, 0),
    totalItems: posts.reduce((sum, p) => sum + p._count.furnitureItems, 0),
    bookmarkCount: bookmarks.length,
    wishlistCount: wishlistItems.length,
  };

  const postList = posts.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    thumbnail: p.medias[0]?.path ?? null,
    itemCount: p._count.furnitureItems,
    likeCount: p._count.likes,
    createdAt: p.createdAt.toISOString(),
  }));

  const bookmarkList = bookmarks.map((b) => ({
    id: b.post.id,
    title: b.post.title,
    thumbnail: b.post.medias[0]?.path ?? null,
    userName: b.post.user.name,
    itemCount: b.post._count.furnitureItems,
    likeCount: b.post._count.likes,
    createdAt: b.post.createdAt.toISOString(),
  }));

  const wishlistList: WishlistRow[] = wishlistItems.map((w) => ({
    id: w.id,
    name: w.name,
    productUrl: w.productUrl,
    note: w.note,
    sourcePostId: w.sourcePostId,
    createdAt: w.createdAt.toISOString(),
  }));

  const statItems = [
    { n: stats.postCount, l: "部屋" },
    { n: user._count.followsReceived, l: "フォロワー" },
    { n: user._count.followsInitiated, l: "フォロー中" },
    { n: stats.totalLikes, l: "いいね" },
    { n: stats.totalItems, l: "家具・雑貨" },
    { n: stats.bookmarkCount, l: "保存" },
    { n: stats.wishlistCount, l: "欲しい" },
  ];

  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page py-8 sm:py-10">
        <header className="dashboard-page-header nook-elevated-surface mb-8 overflow-hidden p-5 sm:mb-10 sm:p-6">
          <p className="nook-section-label mb-3">マイページ</p>

          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--hairline)",
                color: "var(--text-secondary)",
              }}
            >
              {(user.name && user.name.trim()[0]) || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                {user.name}
              </h1>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                {user.email}
              </p>
              {user.bio?.trim() ? (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {user.bio.trim()}
                </p>
              ) : null}
              <p className="mt-2 text-[10px]" style={{ color: "var(--text-faint)" }}>
                NOOK 利用開始 {user.createdAt.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
              </p>
            </div>
          </div>

          <div
            className="dashboard-stats-row nook-hscroll-mask nook-hscroll-mask-sm-clear mt-6 flex overflow-x-auto border-t border-b py-4 scrollbar-hide sm:justify-center sm:overflow-visible"
            style={{ borderColor: "var(--hairline)" }}
            aria-label="集計"
          >
            {statItems.map((s, i) => (
              <div
                key={s.l}
                className={`min-w-[3.75rem] shrink-0 px-2.5 text-center sm:min-w-[4rem] sm:px-4 ${i > 0 ? "border-l" : ""}`}
                style={{ borderColor: "var(--hairline)" }}
              >
                <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                  {s.n}
                </p>
                <p className="text-[10px] font-medium sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <label htmlFor="post_modal" className="btn-primary cursor-pointer text-xs">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              写真を載せる
            </label>
            <Link href="/" className="btn-secondary text-xs">
              みんなの部屋
            </Link>
            <Link href="/?feed=following" className="btn-secondary text-xs">
              フォロー中
            </Link>
            <Link href={`/user/${user.id}`} className="btn-secondary text-xs">
              プロフィールを見る
            </Link>
          </div>
        </header>

        {/* §5 写真・一覧を先に。プロフィール編集は下へ */}
        <Suspense
          fallback={
            <div
              className="mb-8 h-40 animate-pulse rounded-xl border"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
              aria-hidden
            />
          }
        >
          <DashboardContent posts={postList} bookmarks={bookmarkList} wishlist={wishlistList} />
        </Suspense>

        <div className="mt-10 sm:mt-12">
          <ProfileSettings initialBio={user.bio} initialProfileLink={user.profileLink} />
        </div>
      </div>
    </div>
  );
}
