import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/session-user";
import HomePostGrid from "@/components/home-post-grid";
import { fetchPostsByShopHost } from "@/lib/shop-posts";
import { isSafeShopHostParam } from "@/lib/shop-path";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>;
}): Promise<Metadata> {
  const { host: raw } = await params;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return { title: "ショップ | NOOK" };
  }
  const title = isSafeShopHostParam(decoded)
    ? `${decoded}・ショップの投稿`
    : "ショップ | NOOK";
  return {
    title,
    description: `${decoded} の購入先URLが載っている投稿一覧｜NOOK`,
  };
}

export default async function ShopByHostPage({ params }: { params: Promise<{ host: string }> }) {
  const { host: raw } = await params;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    notFound();
  }
  if (!isSafeShopHostParam(decoded)) notFound();

  const normalized = decoded.trim().toLowerCase();

  const currentUserId = await getOptionalUserId();

  const posts = await fetchPostsByShopHost(normalized, 60, {
    interactiveUserId: currentUserId,
  });

  const postList = posts.map((p) => {
    const likes = "likes" in p && Array.isArray(p.likes) ? p.likes : [];
    const bookmarks = "bookmarks" in p && Array.isArray(p.bookmarks) ? p.bookmarks : [];
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
      liked: currentUserId ? likes.length > 0 : false,
      bookmarked: currentUserId ? bookmarks.length > 0 : false,
      styleTags: p.styleTags.map((t) => t.tagSlug),
      totalPrice: totalPrice > 0 ? totalPrice : null,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page pb-16 pt-6 sm:py-8">
        <header className="shop-page-header nook-elevated-surface mb-8 overflow-hidden p-5 sm:mb-9 sm:p-6">
          <p className="nook-section-label mb-2">ショップ別</p>
          <h1 className="nook-fg text-lg font-semibold tracking-tight sm:text-xl">
            <span className="nook-shop-host-chip shop-page-host block break-words rounded-[var(--radius-card)] border px-3 py-2.5 text-[0.8125rem] font-medium leading-snug tracking-normal sm:px-3.5 sm:py-3 sm:text-sm">
              {decoded}
            </span>
          </h1>
          <div
            className="shop-page-stats nook-fg-muted mt-4 flex w-full flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-b py-3 text-[11px] tabular-nums nook-border-hairline"
            aria-label="件数"
          >
            <span className="nook-fg text-sm font-semibold">
              {postList.length}
            </span>
            <span>投稿</span>
          </div>
        </header>

        <section className="shop-page-grid-section" aria-labelledby="shop-posts-heading">
          <h2 id="shop-posts-heading" className="nook-section-label mb-1">
            投稿
          </h2>
          {postList.length > 0 ? (
            <HomePostGrid posts={postList} ariaLabelledBy="shop-posts-heading" />
          ) : (
            <div className="nook-elevated-surface flex flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-16">
              <div className="nook-bg-sunken mb-3 flex h-12 w-12 items-center justify-center rounded-full" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="nook-fg-faint">
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="nook-fg text-sm font-semibold">
                まだ投稿がありません
              </p>
              <p className="nook-fg-muted mt-1 max-w-xs px-4 text-xs leading-relaxed">
                このショップのリンクが載った投稿が増えると表示されます。
              </p>
              <Link href="/" className="btn-secondary mt-6 text-xs">
                みんなの部屋を見る
              </Link>
            </div>
          )}
        </section>

        <div className="mt-10 border-t pt-6 nook-border-hairline">
          <Link
            href="/"
            className="nook-fg-muted inline-flex min-h-[var(--touch)] items-center gap-2 rounded-sm text-xs font-medium transition hover:opacity-75 focus-visible:outline-offset-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            みんなの部屋へ
          </Link>
        </div>
      </div>
    </div>
  );
}
