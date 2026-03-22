import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NookImage from "@/components/nook-image";

const MAX = 6;
const MAX_URLS = 12;
const FETCH = 36;

/**
 * 同じ productUrl を登録しているほかの部屋。重なる URL が多い順に並べる。
 */
export default async function SameUrlRooms({
  currentPostId,
  productUrls,
}: {
  currentPostId: string;
  productUrls: string[];
}) {
  const urls = [...new Set(productUrls.map((u) => u.trim()).filter(Boolean))].slice(0, MAX_URLS);
  if (urls.length === 0) return null;

  const urlSet = new Set(urls);

  const posts = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      furnitureItems: { some: { productUrl: { in: urls } } },
    },
    orderBy: { createdAt: "desc" },
    take: FETCH,
    select: {
      id: true,
      title: true,
      createdAt: true,
      medias: { take: 1, orderBy: { id: "asc" }, select: { path: true } },
      furnitureItems: { select: { productUrl: true } },
    },
  });

  if (posts.length === 0) return null;

  const ranked = posts
    .map((p) => ({
      p,
      overlap: p.furnitureItems.filter((f) => urlSet.has(f.productUrl.trim())).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.p.createdAt.getTime() - a.p.createdAt.getTime();
    })
    .slice(0, MAX)
    .map((x) => x.p);

  if (ranked.length === 0) return null;

  return (
    <section className="mt-8 border-t pt-6 nook-border-hairline" aria-labelledby="same-url-heading">
      <h2 id="same-url-heading" className="nook-section-label mb-3">
        同じ家具・雑貨のリンクがある部屋
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-2.5">
        {ranked.map((p) => (
          <div key={p.id} className="stagger-item">
            <Link
              href={`/post/${p.id}`}
              className="nook-bg-sunken relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)] transition hover:opacity-92"
            >
              {p.medias[0]?.path ? (
                <NookImage
                  src={p.medias[0].path}
                  alt={p.title ? `${p.title}の写真` : "同じ商品ページの部屋の写真"}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="nook-fg-faint flex h-full items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
