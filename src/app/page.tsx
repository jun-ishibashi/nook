import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchHomeFeedPosts, toHomePostGridItem } from "@/lib/home-feed";
import { getOptionalSessionUser } from "@/lib/session-user";
import HomePostGrid from "@/components/home-post-grid";
import HomeTopSearch, { HomeRecentSearchRow } from "@/components/home-top-search";
import WelcomeBanner from "@/components/welcome-banner";
import HomeFeedTabs from "@/components/home-feed-tabs";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import { postSearchOrConditions } from "@/lib/post-search";
import { mixHomeFeedPosts } from "@/lib/feed-mix";
import { loginCallbackHref } from "@/lib/login-href";
import HomeRevisitStrip from "@/components/home-revisit-strip";
import HomeTrendingStyles from "@/components/home-trending-styles";
import HomeFilterPanel from "@/components/home-filter-panel";
import HomeRecentRooms from "@/components/home-recent-rooms";
import HomeLoggedInOverview from "@/components/home-logged-in-overview";

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

  const currentUser = await getOptionalSessionUser({
    id: true,
    _count: { select: { posts: true, followsInitiated: true } },
  });
  const currentUserId = currentUser?.id;

  if (followingFeed && !currentUserId) {
    redirect(loginCallbackHref("/?feed=following"));
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
    !isFiltered && !followingFeed ? mixHomeFeedPosts(postsRaw) : postsRaw;

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
  const showLoggedInOverview = Boolean(currentUser) && !isFiltered && !followingFeed;
  /** ページに既に h1（ヒーロー or ログイン後概要）があるときはフィード見出しを h2 に */
  const feedSectionTitle = followingFeed
    ? "フォロー中の部屋"
    : isFiltered
      ? "該当する部屋"
      : "みんなの部屋";

  return (
    <div className="nook-app-canvas home-canvas min-h-screen">
      {/* 操作層: top は globals の --nav-height（ノッチ＋ナビ行）と一致 */}
      <div
        className="home-sticky-feed home-sticky-feed-surface sticky z-30 backdrop-blur-md"
        style={{ top: "var(--nav-height)" }}
      >
        <div className="nook-page">
          <div className="py-1.5 sm:py-2">
            <Suspense
              fallback={
                <div className="space-y-2.5 pb-0.5" aria-hidden>
                  <div className="nook-skeleton-pulse h-2.5 w-28" />
                  <div className="nook-skeleton-pulse h-11 w-full rounded-none border-b nook-border-subtle" />
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
                      <div className="flex h-[2.125rem] items-end gap-5">
                        <span className="nook-skeleton-pulse mb-1.5 h-2.5 w-16" />
                        <span className="nook-skeleton-pulse mb-1.5 h-2.5 w-14" />
                      </div>
                    </div>
                    <div className="nook-skeleton-pulse h-4 w-32 sm:ml-auto" />
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

        {currentUser && showLoggedInOverview ? (
          <HomeLoggedInOverview
            postCount={currentUser._count.posts}
            followingCount={currentUser._count.followsInitiated}
            bookmarkCount={bookmarkCount}
            wishlistCount={wishlistCount}
          />
        ) : null}

        <div
          id="home-feed-anchor"
          className="home-feed-stack"
        >
        <Suspense
          fallback={
            <div className="home-filter-panel-skeleton flex items-center justify-between py-4" aria-hidden>
              <div className="nook-skeleton-pulse h-2.5 w-40" />
              <div className="nook-skeleton-pulse h-2.5 w-10" />
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
              {showWelcome || showLoggedInOverview ? (
                <h2 className="home-feed-ledge__title" id="home-feed-heading">
                  {feedSectionTitle}
                </h2>
              ) : (
                <h1 className="home-feed-ledge__title" id="home-feed-heading">
                  {feedSectionTitle}
                </h1>
              )}
              {isFiltered ? (
                <span className="home-feed-count-pill shrink-0" aria-label={`${postList.length}件`}>
                  {postList.length}
                  <span className="ml-0.5 font-medium opacity-85">件</span>
                </span>
              ) : null}
            </div>
          </header>
        ) : null}

        <HomePostGrid posts={postList} ariaLabelledBy={postList.length > 0 ? "home-feed-heading" : undefined} enableFeatured={!isFiltered && !followingFeed} />

        {postList.length === 0 && (
          <div
            className="home-empty-state mx-auto flex max-w-sm flex-col items-center px-4 py-12 text-center animate-fade-in sm:px-6 sm:py-14"
            role="status"
          >
            <div
              className="nook-bg-sunken relative mb-5 h-20 w-20 shrink-0 overflow-hidden rounded-xl border opacity-90 nook-border-hairline sm:h-24 sm:w-24"
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
            <p className="nook-fg text-[15px] font-semibold tracking-tight">
              {followingFeed
                ? "フォロー中の部屋は、まだありません"
                : isFiltered
                  ? "該当する部屋は、まだ見つからないようです"
                  : "まだ部屋がありません"}
            </p>
            <p className="nook-fg-muted mt-2 text-[13px] leading-relaxed">
              {followingFeed
                ? "みんなの部屋から、ムードを探してみてください。"
                : isFiltered
                  ? "条件を変えると、別の部屋に出会えるかもしれません。"
                  : "一枚からで大丈夫です。写真を載せると、ここに残せます。"}
            </p>
            {followingFeed ? (
              <Link href="/" scroll={false} className="btn-primary mt-7 text-sm sm:text-xs">
                みんなの部屋へ
              </Link>
            ) : isFiltered ? (
              <Link href="/" scroll={false} className="btn-secondary mt-7 text-sm sm:text-xs">
                条件をすべてクリア
              </Link>
            ) : currentUserId ? (
              <label htmlFor="post_modal" className="btn-primary mt-7 cursor-pointer text-sm sm:text-xs">
                写真を載せる
              </label>
            ) : (
              <Link href="/login" className="btn-primary mt-7 text-sm sm:text-xs">
                ログインして写真を載せる
              </Link>
            )}
          </div>
        )}
        </div>

        {!isFiltered && !followingFeed && (
          <Suspense
            fallback={
              <div
                className="nook-skeleton-pulse h-12 rounded-lg border-t pt-6 nook-border-hairline sm:pt-8"
                aria-hidden
              />
            }
          >
            <div className="border-t pt-6 nook-border-hairline sm:pt-8">
              <HomeTrendingStyles />
            </div>
          </Suspense>
        )}
        </div>
      </div>
    </div>
  );
}
