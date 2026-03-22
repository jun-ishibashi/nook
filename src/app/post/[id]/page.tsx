import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/session-user";
import { getCategoryLabel } from "@/lib/categories";
import CategoryIcon from "@/components/category-icon";
import PostGallery from "@/components/post-gallery";
import LikeButton from "@/components/like-button";
import BookmarkButton from "@/components/bookmark-button";
import ShareButtons from "@/components/share-buttons";
import { getStyleTagLabel } from "@/lib/style-tags";
import PostFurnitureList from "@/components/post-furniture-list";
import FollowButton from "@/components/follow-button";
import RelatedPosts from "@/components/related-posts";
import SameUrlRooms from "@/components/same-url-rooms";
import PostViewTracker from "@/components/post-view-tracker";
import {
  getHousingLabel,
  getLayoutLabel,
} from "@/lib/room-context";
import { getProductUrlHost } from "@/lib/product-url";
import { shopExploreHref } from "@/lib/shop-path";

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function truncateMetaDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { name: true } },
      styleTags: { select: { tagSlug: true }, take: 4 },
    },
  });
  if (!post) return { title: "部屋が見つかりません | NOOK" };
  const thumbnail = post.medias[0]?.path;
  const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const canonicalPath = `/post/${post.id}`;
  const ogImage = thumbnail?.startsWith("http") ? thumbnail : thumbnail ? `${baseUrl}${thumbnail}` : `${baseUrl}/og-default.png`;

  const categoryLabel =
    post.category && post.category !== "other" ? getCategoryLabel(post.category) : null;
  const styleBits = post.styleTags
    .map((t) => getStyleTagLabel(t.tagSlug))
    .filter(Boolean)
    .slice(0, 3);
  const descParts: string[] = [];
  if (post.description?.trim()) {
    descParts.push(post.description.trim());
  } else {
    descParts.push(`${post.user.name} の部屋`);
  }
  if (categoryLabel) descParts.push(categoryLabel);
  if (styleBits.length > 0) descParts.push(styleBits.join("・"));
  descParts.push("部屋の写真と家具・雑貨の購入先まで｜NOOK");
  const description = truncateMetaDescription(descParts.join("・"));

  return {
    metadataBase: new URL(baseUrl),
    title: `${post.title} | NOOK`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: post.title,
      description,
      url: canonicalPath,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type: "article",
      siteName: "NOOK",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: newPostFlag } = await searchParams;
  const justPosted = newPostFlag === "1";
  const currentUserId = await getOptionalUserId();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      medias: true,
      user: { select: { id: true, name: true, image: true } },
      furnitureItems: { orderBy: { sortOrder: "asc" } },
      styleTags: { select: { tagSlug: true } },
      _count: { select: { likes: true } },
      likes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
      bookmarks: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
    },
  });
  if (!post) notFound();

  const styleTagSlugs = post.styleTags.map((t) => t.tagSlug);

  const shopHosts = [
    ...new Set(
      post.furnitureItems
        .map((f) => getProductUrlHost(f.productUrl))
        .filter((h): h is string => Boolean(h))
    ),
  ];

  const productUrls =
    post.furnitureItems.length > 0 ? post.furnitureItems.map((i) => i.productUrl) : [];
  const wishlistedRows =
    currentUserId && productUrls.length > 0
      ? await prisma.itemWishlist.findMany({
          where: { userId: currentUserId, productUrl: { in: productUrls } },
          select: { productUrl: true },
        })
      : [];
  const wishlistedUrls = new Set(wishlistedRows.map((w) => w.productUrl));

  const authorFollowerCount = await prisma.follow.count({ where: { followingId: post.user.id } });
  let authorIsFollowing = false;
  if (currentUserId && currentUserId !== post.user.id) {
    const f = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: post.user.id } },
      select: { id: true },
    });
    authorIsFollowing = !!f;
  }

  const liked = currentUserId ? post.likes.length > 0 : false;
  const bookmarked = currentUserId ? post.bookmarks.length > 0 : false;
  const galleryItems = post.medias.map((m) => ({
    original: m.path,
    thumbnail: m.path,
    mood: m.mood || "",
  }));
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/post/${post.id}`;

  const roomContextBits = [
    post.housingType ? getHousingLabel(post.housingType) : null,
    post.layoutType ? getLayoutLabel(post.layoutType) : null,
    post.roomContextNote?.trim() || null,
  ].filter(Boolean) as string[];

  return (
    <div className="nook-app-canvas min-h-screen">
      {/* 幅は .nook-page と同じ max-w-2xl。ギャラリーは横パディングなし、本文ブロックのみ px */}
      <article className="mx-auto w-full max-w-2xl pb-16">
        <div className="post-detail-hero nook-gallery-cap nook-post-hero-surface overflow-hidden">
          <PostGallery items={galleryItems} />
        </div>

        <div className="w-full px-4 pb-0 pt-5 sm:px-5 sm:pt-6">
          {justPosted && currentUserId === post.user.id && (
            <div className="nook-elevated-surface mb-5 px-3 py-3 text-[12px] leading-relaxed" role="status">
              <span className="nook-fg-secondary">載せました。</span>
              <Link
                href={`/post/${post.id}/edit`}
                className="nook-fg mx-0.5 font-semibold underline decoration-transparent transition hover:opacity-80"
              >
                編集
              </Link>
              <span className="nook-fg-secondary">で追記できます。</span>
            </div>
          )}

          <header className="post-detail-header">
            <p className="nook-section-label mb-2">部屋</p>
            <h1 className="nook-fg text-xl font-bold leading-snug tracking-[-0.02em] sm:text-[1.35rem]">
              {post.title}
            </h1>
            <p className="nook-fg-muted mt-2 text-[11px] leading-relaxed">
              <Link
                href={`/user/${post.user.id}`}
                className="nook-fg-secondary font-medium transition hover:opacity-80"
              >
                {post.user.name}
              </Link>
              <span className="mx-1 opacity-50" aria-hidden>
                ・
              </span>
              <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {post.category && post.category !== "other" && (
                <Link
                  href={`/?category=${encodeURIComponent(post.category)}`}
                  className="badge transition hover:opacity-80"
                  title="同じカテゴリの部屋を見る"
                >
                  <CategoryIcon value={post.category} size={12} />
                  {getCategoryLabel(post.category)}
                </Link>
              )}
              {styleTagSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`/?styles=${encodeURIComponent(slug)}`}
                  className="nook-style-pill rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition hover:opacity-85"
                  title="同じスタイルの部屋を見る"
                >
                  {getStyleTagLabel(slug)}
                </Link>
              ))}
            </div>

            {roomContextBits.length > 0 && (
              <p className="nook-fg-muted mt-2.5 text-[11px] leading-relaxed">
                {roomContextBits.join("・")}
              </p>
            )}

            {post.description ? (
              <p className="nook-fg-secondary mt-4 text-sm leading-relaxed whitespace-pre-line">
                {post.description}
              </p>
            ) : null}

            {post.furnitureItems.some(f => f.price !== null) && (
              <div className="nook-elevated-surface mt-6 flex flex-col items-start gap-1 px-4 py-3 sm:px-5">
                <span className="nook-section-label !mb-0 text-[10px]">Total Look / 概算費用</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="nook-fg text-[1.5rem] font-bold tracking-tighter">
                    ¥{post.furnitureItems.reduce((acc, f) => acc + (f.price ?? 0), 0).toLocaleString()}
                  </span>
                  <span className="nook-fg-muted text-[10px] font-medium">
                    （掲載時の参考価格）
                  </span>
                </div>
              </div>
            )}
          </header>

          <div
            className="post-detail-toolbar nook-post-toolbar-surface mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border px-4 py-3.5 sm:px-5"
            aria-label="いいね・保存・共有"
          >
            <div className="flex items-center gap-1">
              <div className="nook-like-bookmark-cluster flex items-center gap-0.5 rounded-full border px-1">
                <LikeButton postId={post.id} initialLiked={liked} initialCount={post._count.likes} />
                <div className="nook-vdivider" aria-hidden />
                <BookmarkButton postId={post.id} initialBookmarked={bookmarked} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUserId === post.user.id && (
                <Link href={`/post/${post.id}/edit`} className="btn-secondary min-h-9 px-3.5 text-xs">
                  編集
                </Link>
              )}
              <ShareButtons title={post.title} url={shareUrl} />
            </div>
          </div>

          <div className="nook-post-toolbar-surface mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border p-4 transition-all duration-300 hover:shadow-md sm:p-5">
            <p className="sr-only">この部屋の写真を載せた人</p>
            <Link href={`/user/${post.user.id}`} className="flex min-w-0 items-center gap-3 transition hover:opacity-85">
              <div className="nook-avatar-letter h-11 w-11 shrink-0 !text-sm">
                {(post.user.name && post.user.name.trim()[0]) || "?"}
              </div>
              <div className="min-w-0 text-left">
                <p className="nook-fg-faint text-[10px] font-medium tracking-wide">この部屋の人</p>
                <p className="nook-fg text-sm font-semibold">
                  {post.user.name}
                </p>
              </div>
            </Link>
            {currentUserId !== post.user.id && (
              <FollowButton
                userId={post.user.id}
                initialFollowing={authorIsFollowing}
                initialFollowerCount={authorFollowerCount}
                size="sm"
              />
            )}
          </div>

          {post.furnitureItems.length > 0 && (
            <section className="mt-8 border-t pt-6 nook-border-hairline" aria-labelledby="furniture-heading">
              <h2 id="furniture-heading" className="nook-section-label mb-1">
                家具・雑貨
              </h2>
              <p className="nook-fg-secondary mb-1 text-[12px] leading-snug">
                この部屋で使っている家具・雑貨（{post.furnitureItems.length}）
              </p>
              <p className="nook-vision-subline mb-3 !mt-0 max-w-none">
                気になった家具・雑貨は、外部ショップのページも見られます（在庫や価格は各店のページが正です）。
              </p>
              {shopHosts.length > 0 ? (
                <p className="nook-fg-faint mb-4 text-[10px] leading-relaxed">
                  {shopHosts.map((h, i) => (
                    <span key={h}>
                      {i > 0 ? (
                        <span className="mx-1 opacity-45" aria-hidden>
                          ・
                        </span>
                      ) : null}
                      <Link
                        href={shopExploreHref(h)}
                        className="nook-fg-muted font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
                      >
                        {h}の部屋を見る
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
              <PostFurnitureList
                postId={post.id}
                medias={post.medias}
                items={post.furnitureItems}
                wishlistedUrls={wishlistedUrls}
              />
            </section>
          )}

          {post.furnitureItems.length > 0 && (
            <SameUrlRooms currentPostId={post.id} productUrls={productUrls} />
          )}

          <RelatedPosts postId={post.id} category={post.category} styleTagSlugs={styleTagSlugs} />

          <div className="mt-10 border-t pt-6 nook-border-hairline">
            <Link
              href="/"
              className="nook-fg-muted inline-flex min-h-[var(--touch)] items-center gap-2 text-xs font-medium transition hover:opacity-75"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              みんなの部屋へ
            </Link>
          </div>
        </div>
      </article>
      <PostViewTracker post={{ id: post.id, title: post.title, thumbnail: post.medias[0]?.path ?? null }} />
    </div>
  );
}
