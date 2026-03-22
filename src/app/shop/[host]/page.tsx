import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getOptionalUserId } from "@/lib/session-user";
import HomePostGrid from "@/components/home-post-grid";
import { fetchPostsByShopHost } from "@/lib/shop-posts";
import { parseShopHostFromRouteParam } from "@/lib/shop-path";
import PageBackLink from "@/components/page-back-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>;
}): Promise<Metadata> {
  const { host: raw } = await params;
  const decoded = parseShopHostFromRouteParam(raw);
  if (!decoded) {
    return { title: "ショップ | NOOK", description: "ショップ別の部屋一覧｜NOOK" };
  }
  return {
    title: `${decoded}・ショップの部屋`,
    description: `${decoded} の商品ページURLが載っている部屋一覧｜NOOK`,
  };
}

export default async function ShopByHostPage({ params }: { params: Promise<{ host: string }> }) {
  const { host: raw } = await params;
  const decoded = parseShopHostFromRouteParam(raw);
  if (!decoded) notFound();

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
      <div className="nook-page nook-safe-page-pb pt-6 sm:pt-8">
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
            <span>部屋</span>
          </div>
        </header>

        <section className="shop-page-grid-section" aria-labelledby="shop-posts-heading">
          <h2 id="shop-posts-heading" className="nook-section-label mb-1">
            部屋
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
                まだ部屋がありません
              </p>
              <p className="nook-fg-muted mt-1 max-w-xs px-4 text-xs leading-relaxed">
                このショップの商品ページが載った部屋はまだないようです。みんなの部屋から探してみてください。
              </p>
              <Link href="/" className="btn-secondary mt-6 text-sm sm:text-xs">
                みんなの部屋を見る
              </Link>
            </div>
          )}
        </section>

        <div className="mt-10 border-t pt-6 nook-border-hairline">
          <PageBackLink />
        </div>
      </div>
    </div>
  );
}
