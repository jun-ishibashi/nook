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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; style?: string; styles?: string; feed?: string }>;
}) {
  const sp = await searchParams;
  const { q, category, feed: feedRaw } = sp;
  const query = q?.trim() ?? "";
  const activeCategory = category?.trim() ?? "";
  const activeStyles = parseStyleSlugsFromSearchParams({
    styles: sp.styles,
    style: sp.style,
  });
  const followingFeed = feedRaw?.trim() === "following";

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

  const isFiltered =
    !!query || !!activeCategory || activeStyles.length > 0 || followingFeed;

  const postsRaw = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      styleTags: { select: { tagSlug: true } },
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
    styleTags: p.styleTags.map((t) => t.tagSlug),
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
                <HomeRevisitStrip bookmarkCount={bookmarkCount} wishlistCount={wishlistCount} />
              </div>
            </Suspense>
          ) : null}
        </div>
      </div>

      <div className="nook-page pb-16 pt-2.5 sm:pt-4">
        {showWelcome ? <WelcomeBanner /> : null}

        <div id="home-feed-anchor" className="scroll-mt-28">
        <Suspense
          fallback={
            <section
              className="home-filter-panel mb-6 border-t pt-5 sm:mb-7 sm:pt-6"
              style={{ borderColor: "var(--hairline)" }}
              aria-hidden
            >
              <div className="h-4 w-32 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
              <div
                className="mt-3 h-28 animate-pulse rounded-xl"
                style={{ background: "var(--bg-wash)" }}
              />
            </section>
          }
        >
          <HomeFilterPanel />
        </Suspense>

        {postList.length > 0 ? (
          <header className="mb-2.5 sm:mb-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="nook-section-label" id="home-feed-heading">
                {followingFeed ? "フォロー中の部屋" : isFiltered ? "該当する部屋" : "みんなの部屋"}
              </h2>
              {isFiltered ? (
                <span
                  className="text-[11px] font-medium tabular-nums tracking-wide"
                  style={{ color: "var(--text-muted)" }}
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
          <div className="stagger-item flex flex-col items-center py-20 text-center animate-fade-in">
            <div className="mb-8 relative h-48 w-48 opacity-80 mix-blend-multiply dark:mix-blend-screen overflow-hidden rounded-2xl grayscale transition duration-700 hover:grayscale-0">
               <img src="/empty-state.png" alt="" className="object-cover w-full h-full" aria-hidden />
            </div>
            <p className="text-lg font-bold tracking-tight" style={{ color: "var(--text)" }}>
              {isFiltered ? "まだ、見つからないようです" : "静かなはじまり"}
            </p>
            <p className="mt-2 text-[13px] max-w-[240px] leading-relaxed mx-auto italic" style={{ color: "var(--text-muted)" }}>
              {followingFeed
                ? "フォロー中の部屋がまだありません。気になる人を探してみましょう。"
                : isFiltered
                  ? "条件を少し広げてみると、新しいインスピレーションに出会えるかもしれません。"
                  : currentUserId
                    ? "あなたのこだわりを、最初の一枚として載せてみませんか。"
                    : "ログインすると、自分だけの「好き」をストックしたり、部屋を載せたりできます。"}
            </p>
            {followingFeed ? (
              <Link href="/" scroll={false} className="btn-primary mt-8 text-[11px] px-6">
                みんなの部屋を探す
              </Link>
            ) : isFiltered ? (
              <Link href="/" scroll={false} className="btn-secondary mt-8 text-[11px] px-6">
                条件をすべてクリア
              </Link>
            ) : currentUserId ? (
              <label htmlFor="post_modal" className="btn-primary mt-8 cursor-pointer text-[11px] px-8">
                写真を載せる
              </label>
            ) : (
              <Link href="/login" className="btn-primary mt-8 text-[11px] px-8">
                NOOK をはじめる
              </Link>
            )}
          </div>
        )}

        {!isFiltered && !followingFeed && (
          <Suspense
            fallback={
              <div
                className="mt-8 h-12 animate-pulse rounded-lg"
                style={{ background: "var(--bg-sunken)" }}
                aria-hidden
              />
            }
          >
            <div className="mt-8">
              <HomeTrendingStyles />
            </div>
          </Suspense>
        )}
        </div>
      </div>
    </div>
  );
}
