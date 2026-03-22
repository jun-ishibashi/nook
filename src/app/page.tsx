import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchHomeFeedPosts, toHomePostGridItem } from "@/lib/home-feed";
import { getOptionalUserId } from "@/lib/session-user";
import HomePostGrid from "@/components/home-post-grid";
import HomeTopSearch, { HomeRecentSearchRow } from "@/components/home-top-search";
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

  const currentUserId = await getOptionalUserId();

  if (followingFeed && !currentUserId) {
    redirect("/login?callbackUrl=" + encodeURIComponent("/?feed=following"));
  }

  const where: Prisma.PostWhereInput = {};
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
    const priceWhere: Prisma.IntFilter = {};
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

  const postsRaw = await fetchHomeFeedPosts(where, currentUserId);

  const posts =
    !isFiltered && !followingFeed
      ? breakConsecutiveSameAuthor(postsRaw)
      : postsRaw;

  let bookmarkCount = 0;
  let wishlistCount = 0;
  if (currentUserId) {
    [bookmarkCount, wishlistCount] = await Promise.all([
      prisma.bookmark.count({ where: { userId: currentUserId } }),
      prisma.itemWishlist.count({ where: { userId: currentUserId } }),
    ]);
  }

  const postList = posts.map((p) => toHomePostGridItem(p, currentUserId));

  const showWelcome = !currentUserId && !isFiltered && !followingFeed;

  function homeFeedSubline(): string | null {
    if (showWelcome) return null;
    if (followingFeed) {
      return "フォロー中の部屋を開くと、家具・雑貨の行き先も同じ流れで辿れます。";
    }
    if (isFiltered) {
      return "開くと家具・雑貨の商品ページも、同じ画面から辿れます。";
    }
    if (!currentUserId) return null;
    return "写真を開けば、家具・雑貨の行き先までひと続き。";
  }
  const feedSubline = homeFeedSubline();

  return (
    <div className="nook-app-canvas home-canvas min-h-screen">
      {/* 操作層：線と文字・固定の縦は最小（product-vision §5.1） */}
      <div
        className="home-sticky-feed sticky top-14 z-30 backdrop-blur-md"
        style={{ background: "var(--sticky-surface)" }}
      >
        <div className="nook-page">
          <div className="py-1.5 sm:py-2">
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
                  <div className="home-sticky-toolbar">
                    <div className="home-sticky-toolbar__tabs">
                      <div
                        className="flex h-[2.125rem] items-end gap-5"
                        style={{ borderColor: "var(--hairline)" }}
                      >
                        <span className="mb-1.5 h-2.5 w-16 rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                        <span className="mb-1.5 h-2.5 w-14 rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                      </div>
                    </div>
                    <div className="h-4 w-32 animate-pulse rounded-sm sm:ml-auto" style={{ background: "var(--bg-sunken)" }} />
                  </div>
                </div>
              }
            >
              <div className="nook-hairline-top">
                <div className="home-sticky-toolbar">
                  <div className="home-sticky-toolbar__tabs">
                    <HomeFeedTabs />
                  </div>
                  <div className="home-sticky-toolbar__revisit">
                    <HomeRevisitStrip
                      bookmarkCount={bookmarkCount}
                      wishlistCount={wishlistCount}
                      showEmptyHint={bookmarkCount === 0 && wishlistCount === 0}
                      className="pb-0 pt-0 sm:pb-px"
                    />
                  </div>
                </div>
              </div>
            </Suspense>
          ) : null}
        </div>
      </div>

      <div className="nook-page home-main flex flex-col gap-7 pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3rem))] pt-4 sm:gap-9 sm:pt-6">
        {showWelcome ? <WelcomeBanner /> : null}

        <Suspense fallback={null}>
          <HomeRecentSearchRow />
        </Suspense>

        <div
          id="home-feed-anchor"
          className="home-feed-stack scroll-mt-24 sm:scroll-mt-28"
        >
        <Suspense
          fallback={
            <div className="home-filter-panel-skeleton flex items-center justify-between py-4" aria-hidden>
              <div className="h-2.5 w-40 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
              <div className="h-2.5 w-10 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
            </div>
          }
        >
          <HomeFilterPanel />
        </Suspense>

        {!isFiltered && <HomeRecentRooms />}

        <div className="home-feed-body flex flex-col gap-4 sm:gap-5">
        {postList.length > 0 ? (
          <header className="home-feed-ledge">
            <div className="flex min-h-[1.25rem] items-center justify-between gap-3">
              <h2 className="home-feed-ledge__title" id="home-feed-heading">
                {followingFeed ? "フォロー中の部屋" : isFiltered ? "該当する部屋" : "みんなの部屋"}
              </h2>
              {isFiltered ? (
                <span className="home-feed-count-pill shrink-0" aria-label={`${postList.length}件`}>
                  {postList.length}
                  <span className="ml-0.5 font-medium opacity-85">件</span>
                </span>
              ) : null}
            </div>
            {feedSubline ? <p className="nook-vision-subline">{feedSubline}</p> : null}
          </header>
        ) : null}

        <HomePostGrid posts={postList} ariaLabelledBy={postList.length > 0 ? "home-feed-heading" : undefined} enableFeatured={!isFiltered && !followingFeed} />

        {postList.length === 0 && (
          <div
            className="home-empty-state mx-auto flex max-w-sm flex-col items-center px-4 py-12 text-center animate-fade-in sm:px-6 sm:py-14"
            role="status"
          >
            <div
              className="relative mb-5 h-20 w-20 shrink-0 overflow-hidden rounded-xl border opacity-90 sm:h-24 sm:w-24"
              style={{ background: "var(--bg-sunken)", borderColor: "var(--hairline)" }}
              aria-hidden
            >
              <Image
                src="/empty-state.png"
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
                sizes="96px"
                priority
              />
            </div>
            <p className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {followingFeed
                ? "フォロー中の部屋は、まだ静かです"
                : isFiltered
                  ? "該当する部屋は、まだ見つからないようです"
                  : "まだ部屋がありません"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {followingFeed
                ? "まずは「みんなの部屋」から、好みのムードを探してみませんか。"
                : isFiltered
                  ? "ムードや予算の条件を変えると、別の部屋に出会えるかもしれません。"
                  : "静かなはじまり。一枚からで大丈夫です。写真を載せると、家具・雑貨の行き先も一緒に残せます。"}
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
                写真を載せる
              </label>
            ) : (
              <Link href="/login" className="btn-primary mt-7 text-xs">
                ログインして始める
              </Link>
            )}
          </div>
        )}
        </div>

        {!isFiltered && !followingFeed && (
          <Suspense
            fallback={
              <div
                className="h-12 animate-pulse rounded-lg border-t pt-6 sm:pt-8"
                style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
                aria-hidden
              />
            }
          >
            <div className="border-t pt-6 sm:pt-8" style={{ borderColor: "var(--hairline)" }}>
              <HomeTrendingStyles />
            </div>
          </Suspense>
        )}
        </div>
      </div>
    </div>
  );
}
