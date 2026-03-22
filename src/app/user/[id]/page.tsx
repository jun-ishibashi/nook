import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/session-user";
import FollowButton from "@/components/follow-button";
import HomePostGrid from "@/components/home-post-grid";
import { getCategoryLabel } from "@/lib/categories";
import { getStyleTagLabel } from "@/lib/style-tags";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, bio: true } });
  if (!user) return { title: "プロフィールが見つかりません | NOOK" };
  const desc = user.bio?.trim()
    ? `${user.bio.trim()}・${user.name} | NOOK`
    : `${user.name} の部屋・プロフィール | NOOK`;
  return { title: `${user.name}・プロフィール`, description: desc };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUserId = await getOptionalUserId();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      profileLink: true,
      createdAt: true,
      _count: { select: { posts: true, followsReceived: true, followsInitiated: true } },
    },
  });
  if (!user) notFound();

  const followerCount = user._count.followsReceived;
  const followingCount = user._count.followsInitiated;

  let isFollowing = false;
  if (currentUserId && currentUserId !== user.id) {
    const row = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } },
      select: { id: true },
    });
    isFollowing = !!row;
  }

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      furnitureItems: { select: { price: true } },
      styleTags: { select: { tagSlug: true } },
      _count: { select: { furnitureItems: true, likes: true } },
      likes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
      bookmarks: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
    },
  });

  const postList = posts.map((p) => {
    const totalPrice = p.furnitureItems.reduce((acc, item) => acc + (item.price ?? 0), 0);
    return {
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
      totalPrice: totalPrice > 0 ? totalPrice : null,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const isOwn = currentUserId === user.id;

  const styleSlugCounts = new Map<string, number>();
  const categoryValueCounts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.styleTags) {
      styleSlugCounts.set(t.tagSlug, (styleSlugCounts.get(t.tagSlug) ?? 0) + 1);
    }
    if (p.category && p.category !== "other") {
      categoryValueCounts.set(p.category, (categoryValueCounts.get(p.category) ?? 0) + 1);
    }
  }
  const discoverStyleSlugs = [...styleSlugCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug]) => slug);
  const discoverCategories = [...categoryValueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([value]) => value);
  const hasDiscovery = discoverStyleSlugs.length > 0 || discoverCategories.length > 0;

  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page pb-16 pt-6 sm:pt-8">
        <header className="user-profile-header nook-elevated-surface mb-8 overflow-hidden p-5 sm:mb-9 sm:p-6">
          <p className="nook-section-label mb-2">プロフィール</p>

          <div className="mt-1 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
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
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl" style={{ color: "var(--text)" }}>
                  {user.name}
                </h1>
                <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  NOOK 利用開始 {user.createdAt.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
                </p>
                {user.bio?.trim() ? (
                  <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {user.bio.trim()}
                  </p>
                ) : null}
                {user.profileLink?.trim() ? (
                  <a
                    href={user.profileLink.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline decoration-transparent underline-offset-2 transition hover:opacity-85"
                    style={{ color: "var(--text-muted)" }}
                  >
                    プロフィールのリンク
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M5 2h7v7M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0">
              {!isOwn && (
                <FollowButton
                  userId={user.id}
                  initialFollowing={isFollowing}
                  initialFollowerCount={followerCount}
                />
              )}
              {isOwn && (
                <Link href="/dashboard" className="btn-secondary text-xs">
                  マイページ
                </Link>
              )}
            </div>
          </div>

          <div
            className="nook-hscroll-mask nook-hscroll-mask-sm-clear mt-5 flex w-full overflow-x-auto border-t border-b py-3.5 scrollbar-hide sm:justify-start"
            style={{ borderColor: "var(--hairline)" }}
            aria-label="集計"
          >
            {(
              [
                { n: user._count.posts, l: "部屋" },
                { n: followerCount, l: "フォロワー" },
                { n: followingCount, l: "フォロー中" },
              ] as const
            ).map((s, i) => (
              <div
                key={s.l}
                className={`min-w-[3.5rem] shrink-0 px-3 text-center first:pl-0 sm:min-w-[4rem] sm:px-4 ${i > 0 ? "border-l" : ""}`}
                style={{ borderColor: "var(--hairline)" }}
              >
                <p className="text-base font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                  {s.n}
                </p>
                <p className="text-[10px] font-medium sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </header>

        {hasDiscovery && (
          <section
            className="nook-elevated-surface mb-8 overflow-hidden p-4 sm:p-5"
            aria-labelledby="discover-heading"
          >
            <h2 id="discover-heading" className="nook-section-label mb-1">
              ほかの部屋をさがす
            </h2>
            <p className="nook-vision-subline mb-3 !mt-0 max-w-none">
              この人の部屋に多いムードやカテゴリから、近い雰囲気の部屋へすぐ飛べます。
            </p>
            <div className="flex flex-col gap-4">
              {discoverStyleSlugs.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium" style={{ color: "var(--text-faint)" }}>
                    スタイル
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {discoverStyleSlugs.map((slug) => (
                      <Link
                        key={slug}
                        href={`/?styles=${encodeURIComponent(slug)}`}
                        className="home-trending-pill active:scale-[0.98]"
                      >
                        {getStyleTagLabel(slug)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {discoverCategories.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium" style={{ color: "var(--text-faint)" }}>
                    カテゴリ
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {discoverCategories.map((value) => (
                      <Link
                        key={value}
                        href={`/?category=${encodeURIComponent(value)}`}
                        className="home-trending-pill active:scale-[0.98]"
                      >
                        {getCategoryLabel(value)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mt-6 border-t pt-6 sm:mt-8" style={{ borderColor: "var(--hairline)" }} aria-labelledby="user-posts-heading">
          <h2 id="user-posts-heading" className="nook-section-label mb-3">
            部屋
          </h2>
          {postList.length > 0 ? (
            <HomePostGrid posts={postList} ariaLabelledBy="user-posts-heading" />
          ) : (
            <div className="nook-elevated-surface flex flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-14">
            <p className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              まだ、静かな部屋の一角です
            </p>
            <p className="mt-2 max-w-xs px-4 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {isOwn
                ? "一枚からで大丈夫です。マイページから写真を載せると、家具・雑貨の購入先も一緒に残せます。"
                : "これから、ムードの近い部屋が並ぶかもしれません。"}
            </p>
              {isOwn ? (
                <Link href="/dashboard" className="btn-secondary mt-5 text-xs">
                  マイページへ
                </Link>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
