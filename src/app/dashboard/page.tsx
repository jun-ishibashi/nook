import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/session-user";
import DashboardContent from "@/components/dashboard-content";
import type { WishlistRow } from "@/components/dashboard-wishlist";
import ProfileSettings from "@/components/profile-settings";
import { formatYearMonthJa } from "@/lib/format-date-ja";

export const metadata: Metadata = {
  title: "マイページ",
  description: "載せた部屋・保存・欲しいをまとめて見られるページです。",
};

export default async function DashboardPage() {
  const user = await getOptionalSessionUser({
    id: true,
    name: true,
    email: true,
    bio: true,
    profileLink: true,
    createdAt: true,
    updatedAt: true,
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

  const wishlistItemsRaw = await prisma.itemWishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const wishlistItems = [...wishlistItemsRaw].sort((a, b) => {
    const ar = a.buyRank === 0 ? 1000 : a.buyRank;
    const br = b.buyRank === 0 ? 1000 : b.buyRank;
    if (ar !== br) return ar - br;
    return b.createdAt.getTime() - a.createdAt.getTime();
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
    buyRank: w.buyRank,
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
      <div className="nook-page nook-safe-page-pb pt-8 sm:pt-10">
        <header className="nook-elevated-surface mb-8 overflow-hidden p-5 sm:mb-10 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="nook-avatar-letter h-16 w-16 shrink-0">
              {(user.name && user.name.trim()[0]) || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="nook-fg text-lg font-semibold tracking-tight">
                {user.name}
              </h1>
              <p className="nook-fg-muted mt-0.5 text-xs">
                {user.email}
              </p>
              {user.bio?.trim() ? (
                <p className="nook-fg-secondary mt-2 text-sm leading-relaxed">
                  {user.bio.trim()}
                </p>
              ) : null}
              <p className="nook-fg-faint mt-2 text-[10px]">
                利用開始 {formatYearMonthJa(user.createdAt)}
              </p>
            </div>
          </div>

          <div
            className="dashboard-stats-row nook-hscroll-mask nook-hscroll-mask-sm-clear mt-6 flex overflow-x-auto border-t border-b py-4 scrollbar-hide nook-border-hairline sm:justify-center sm:overflow-visible"
            aria-label="集計"
          >
            {statItems.map((s, i) => (
              <div
                key={s.l}
                className={`min-w-[3.75rem] shrink-0 px-2.5 text-center sm:min-w-[4rem] sm:px-4 ${i > 0 ? "border-l nook-border-hairline" : ""}`}
              >
                <p className="nook-fg text-lg font-semibold tabular-nums">{s.n}</p>
                <p className="nook-fg-muted text-[10px] font-medium sm:text-[11px]">
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <label htmlFor="post_modal" className="btn-primary cursor-pointer text-sm sm:text-xs">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              写真を載せる
            </label>
            <Link href="/" className="btn-secondary text-sm sm:text-xs">
              みんなの部屋
            </Link>
            <Link href="/?feed=following" className="btn-secondary text-sm sm:text-xs">
              フォロー中
            </Link>
            <Link href={`/user/${user.id}`} className="btn-secondary text-sm sm:text-xs">
              プロフィール
            </Link>
          </div>
        </header>

        {/* 写真・一覧を先に。プロフィール編集は下へ */}
        <Suspense
          fallback={
            <div className="nook-skeleton-pulse mb-8 h-40 rounded-xl border nook-border-hairline" aria-hidden />
          }
        >
          <DashboardContent posts={postList} bookmarks={bookmarkList} wishlist={wishlistList} />
        </Suspense>

        <div className="mt-10 sm:mt-12">
          <ProfileSettings
            key={user.updatedAt.toISOString()}
            initialDisplayName={user.name}
            initialBio={user.bio}
            initialProfileLink={user.profileLink}
          />
        </div>
      </div>
    </div>
  );
}
