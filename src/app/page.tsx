import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import HomePostGrid from "@/components/home-post-grid";
import HomeTopSearch from "@/components/home-top-search";
import WelcomeBanner from "@/components/welcome-banner";
import HomeFeedTabs from "@/components/home-feed-tabs";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import { postSearchOrConditions } from "@/lib/post-search";
import { breakConsecutiveSameAuthor } from "@/lib/feed-mix";
import HomeRevisitStrip from "@/components/home-revisit-strip";
import HomeTrendingStyles from "@/components/home-trending-styles";
import HomeFilterPanel from "@/components/home-filter-panel";
import HomeRecentRooms from "@/components/home-recent-rooms";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    category?: string; 
    style?: string; 
    styles?: string; 
    feed?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const sp = await searchParams;
  const { q, category, feed: feedRaw, minPrice, maxPrice } = sp;
  const query = q?.trim() ?? "";
  const activeCategory = category?.trim() ?? "";
  const activeStyles = parseStyleSlugsFromSearchParams({
    styles: sp.styles,
    style: sp.style,
  });
  const followingFeed = feedRaw?.trim() === "following";
  const minP = parseInt(minPrice ?? "", 10);
  const maxP = parseInt(maxPrice ?? "", 10);

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.email
    ? await prisma.user
        .findUnique({ where: { email: session.user.email }, select: { id: true } })
        .then((u) => u?.id)
    : undefined;

  if (followingFeed && !currentUserId) {
    redirect("/login?callbackUrl=" + encodeURIComponent("/?feed=following"));
  }

  const where: Record<string, unknown> = {};
  if (followingFeed && currentUserId) {
    const rows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const ids = rows.map((r) => r.followingId);
    where.userId = ids.length > 0 ? { in: ids } : { in: ["__none__"] };
  }
  if (query) {
    where.OR = postSearchOrConditions(query);
  }
  if (activeCategory) {
    where.category = activeCategory;
  }
  if (activeStyles.length > 0) {
    where.AND = activeStyles.map((tagSlug) => ({
      styleTags: { some: { tagSlug } },
    }));
  }

  if (!isNaN(minP) || !isNaN(maxP)) {
    const priceWhere: Record<string, any> = {};
    if (!isNaN(minP)) priceWhere.gte = minP;
    if (!isNaN(maxP)) priceWhere.lte = maxP;
    
    where.furnitureItems = {
      some: {
        price: priceWhere
      }
    };
  }

  const isFiltered =
    !!query || !!activeCategory || activeStyles.length > 0 || followingFeed || !isNaN(minP) || !isNaN(maxP);

  const postsRaw = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      styleTags: { select: { tagSlug: true } },
      furnitureItems: { select: { price: true } },
      _count: { select: { furnitureItems: true, likes: true } },
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      bookmarks: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
  });

  const posts =
    !isFiltered && !followingFeed
      ? breakConsecutiveSameAuthor(postsRaw as any[])
      : (postsRaw as any[]);

  let bookmarkCount = 0;
  let wishlistCount = 0;
  if (currentUserId) {
    [bookmarkCount, wishlistCount] = await Promise.all([
      prisma.bookmark.count({ where: { userId: currentUserId } }),
      prisma.itemWishlist.count({ where: { userId: currentUserId } }),
    ]);
  }

  const postList = (posts as any[]).map((p) => ({
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
    styleTags: p.styleTags.map((t: any) => t.tagSlug),
    totalPrice: p.furnitureItems.reduce((acc: number, f: any) => acc + (f.price ?? 0), 0) || null,
    createdAt: p.createdAt.toISOString(),
  }));

  const showWelcome = !currentUserId && !isFiltered && !followingFeed;

  return (
    <div className="nook-app-canvas min-h-screen">
      {/* Sticky: 検索・フィード */}
      <div
        className="home-sticky-feed sticky top-14 z-30 backdrop-blur-md"
        style={{ background: "var(--sticky-surface)" }}
      >
        <div className="nook-page">
          <div className="pt-1 pb-0.5 sm:pt-1.5 sm:pb-1">
            <Suspense
              fallback={
                <div className="space-y-2.5 pb-0.5" aria-hidden>
                  <div className="h-2.5 w-28 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                  <div
                    className="h-11 w-full animate-pulse rounded-none border-b"
                    style={{ borderColor: "var(--border-subtle)", background: "var(--bg-sunken)" }}
                  />
                </div>
              }
            >
              <HomeTopSearch />
            </Suspense>
          </div>
          {currentUserId ? (
            <Suspense
              fallback={
                <div className="nook-hairline-top" aria-hidden>
                  <div className="py-1 sm:py-1.5">
                    <div
                      className="flex h-[2.125rem] items-end gap-5 border-b"
                      style={{ borderColor: "var(--hairline)" }}
                    >
                      <span className="mb-1.5 h-2.5 w-16 rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                      <span className="mb-1.5 h-2.5 w-14 rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                    </div>
                  </div>
                  <div className="h-6" />
                </div>
              }
            >
              <div className="nook-hairline-top">
                <div className="py-0.5 sm:py-1">
                  <HomeFeedTabs />
                </div>
                <HomeRevisitStrip
                  bookmarkCount={bookmarkCount}
                  wishlistCount={wishlistCount}
                  showEmptyHint={bookmarkCount === 0 && wishlistCount === 0}
                />
              </div>
            </Suspense>
          ) : null}
        </div>
      </div>

      <div className="nook-page pt-3 pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3rem))] sm:pt-5">
        {showWelcome ? <WelcomeBanner /> : null}

        <div id="home-feed-anchor" className="scroll-mt-28">
        <Suspense
          fallback={
            <section
              className="home-filter-panel mb-6 border-t pt-5 sm:mb-7 sm:pt-6"
              style={{ borderColor: "var(--hairline)" }}
              aria-hidden
            >
              <div className="h-3 w-36 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
              <div className="mt-3 space-y-3">
                <div className="h-2.5 w-16 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                <div className="flex gap-2 overflow-hidden">
                  <div className="h-9 w-14 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                  <div className="h-9 w-20 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                  <div className="h-9 w-16 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                  <div className="h-9 w-24 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                </div>
                <div className="h-2.5 w-12 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                <div className="flex gap-2 overflow-hidden">
                  <div className="h-9 w-16 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                  <div className="h-9 w-20 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                  <div className="h-9 w-14 shrink-0 animate-pulse rounded-full" style={{ background: "var(--bg-wash)" }} />
                </div>
              </div>
            </section>
          }
        >
          <HomeFilterPanel />
        </Suspense>

        {!isFiltered && <HomeRecentRooms />}

        {postList.length > 0 ? (
          <header className="mb-3 sm:mb-3.5">
            <div className="flex min-h-[1.25rem] items-baseline justify-between gap-3">
              <h2 className="nook-section-label" id="home-feed-heading">
                {followingFeed ? "お気に入りの部屋" : isFiltered ? "該当する部屋" : "すべての部屋"}
              </h2>
              {isFiltered ? (
                <span
                  className="shrink-0 text-[11px] font-medium tabular-nums tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={`${postList.length}件`}
                >
                  {postList.length}
                  <span className="ml-0.5 font-normal opacity-80">件</span>
                </span>
              ) : null}
            </div>
          </header>
        ) : null}

        <HomePostGrid posts={postList} ariaLabelledBy={postList.length > 0 ? "home-feed-heading" : undefined} />

        {postList.length === 0 && (
          <div
            className="home-empty-state flex flex-col items-center px-4 py-16 text-center animate-fade-in"
            role="status"
          >
            <div
              className="relative mb-6 h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32"
              style={{ background: "var(--bg-sunken)" }}
              aria-hidden
            >
              <Image
                src="/empty-state.png"
                alt=""
                width={128}
                height={128}
                className="h-full w-full object-cover opacity-90"
                sizes="128px"
              />
            </div>
            <p className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {followingFeed
                ? "お気に入りの部屋は、まだ静かです"
                : isFiltered
                  ? "該当するカタログは、まだ見つからないようです"
                  : "カタログがまだありません"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {followingFeed
                ? "まずは「すべての部屋」から、あなたの「こだわり」を探してみませんか。"
                : isFiltered
                  ? "条件を少し変えてみると、新しいインスピレーションに出会えるかもしれません。"
                  : "静かなはじまり。あなたのこだわりを、最初の一編として載せてみませんか。"}
            </p>
            {followingFeed ? (
              <Link href="/" scroll={false} className="btn-primary mt-7 text-xs">
                みんなの部屋へ
              </Link>
            ) : isFiltered ? (
              <Link href="/" scroll={false} className="btn-secondary mt-7 text-xs">
                条件をすべてクリア
              </Link>
            ) : currentUserId ? (
              <label htmlFor="post_modal" className="btn-primary mt-7 cursor-pointer text-xs">
                部屋を載せる
              </label>
            ) : (
              <Link href="/login" className="btn-primary mt-7 text-xs">
                ログインして始める
              </Link>
            )}
          </div>
        )}

        {!isFiltered && !followingFeed && (
          <Suspense
            fallback={
              <div
                className="mt-10 h-12 animate-pulse rounded-lg border-t pt-8 sm:mt-12"
                style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
                aria-hidden
              />
            }
          >
            <div
              className="mt-10 border-t pt-8 sm:mt-12 sm:pt-10"
              style={{ borderColor: "var(--hairline)" }}
            >
              <HomeTrendingStyles />
            </div>
          </Suspense>
        )}
        </div>
      </div>
    </div>
  );
}
