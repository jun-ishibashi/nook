import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import HomePostGrid from "@/components/home-post-grid";
import SearchBar from "@/components/search-bar";
import CategoryFilter from "@/components/category-filter";
import WelcomeBanner from "@/components/welcome-banner";
import CategoryShowcase from "@/components/category-showcase";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const query = q?.trim() ?? "";
  const activeCategory = category?.trim() ?? "";

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.email
    ? await prisma.user
        .findUnique({ where: { email: session.user.email }, select: { id: true } })
        .then((u) => u?.id)
    : undefined;

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }
  if (activeCategory) {
    where.category = activeCategory;
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { furnitureItems: true, likes: true } },
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      bookmarks: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
  });

  const postList = posts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    thumbnail: p.medias[0]?.path ?? null,
    user: p.user,
    itemCount: p._count.furnitureItems,
    likeCount: p._count.likes,
    liked: currentUserId ? p.likes.length > 0 : false,
    bookmarked: currentUserId ? p.bookmarks.length > 0 : false,
    createdAt: p.createdAt.toISOString(),
  }));

  const isFiltered = !!query || !!activeCategory;
  const showEnrichment = !isFiltered && postList.length < 6;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Sticky search + filter */}
      <div className="sticky top-14 z-30 backdrop-blur-md" style={{ background: "rgba(247,246,244,0.95)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-2xl px-4 py-3">
          <Suspense><SearchBar /></Suspense>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <Suspense><CategoryFilter /></Suspense>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 pb-16">
        {showEnrichment && <WelcomeBanner />}
        {showEnrichment && <CategoryShowcase />}

        {isFiltered && (
          <div className="mb-4">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {query && <span>「<strong style={{ color: "var(--text)" }}>{query}</strong>」の検索結果 · </span>}
              {postList.length}件
            </p>
          </div>
        )}

        {postList.length > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
              {isFiltered ? "検索結果" : "新着投稿"}
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{postList.length}件</span>
          </div>
        )}

        <HomePostGrid posts={postList} />

        {postList.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--bg-sunken)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-base font-bold" style={{ color: "var(--text)" }}>
              {isFiltered ? "投稿が見つかりません" : "まだ投稿がないよ"}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {isFiltered ? "条件を変えて検索してみよう" : "最初の投稿をしてみよう"}
            </p>
            {isFiltered ? (
              <Link href="/" className="btn-secondary mt-6 text-xs">すべて表示</Link>
            ) : (
              <Link href="/login" className="btn-primary mt-6 text-xs">ログインして投稿する</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
