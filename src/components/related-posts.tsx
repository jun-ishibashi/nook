import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NookImage from "@/components/nook-image";

const MAX_RELATED = 6;
const CANDIDATE_POOL = 28;
/** 同じ購入 URL が重なるほど関連度を上げる（上限あり） */
const SCORE_PER_SHARED_URL = 4;
const MAX_URL_SCORE = 14;

/**
 * 同じカテゴリ・スタイルに加え、**同じ商品ページ URL** が重なる部屋を優先（最大6件）
 */
export default async function RelatedPosts({
  postId,
  category,
  styleTagSlugs,
  productUrls,
}: {
  postId: string;
  category: string;
  styleTagSlugs: string[];
  productUrls?: string[];
}) {
  const or: { category?: string; styleTags?: { some: { tagSlug: string } } }[] = [];
  if (category && category !== "other") {
    or.push({ category });
  }
  for (const slug of styleTagSlugs.slice(0, 6)) {
    or.push({ styleTags: { some: { tagSlug: slug } } });
  }
  if (or.length === 0) return null;

  const urlSet = new Set(
    (productUrls ?? []).map((u) => u.trim()).filter(Boolean)
  );

  const candidates = await prisma.post.findMany({
    where: {
      id: { not: postId },
      OR: or,
    },
    orderBy: { createdAt: "desc" },
    take: CANDIDATE_POOL,
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      styleTags: { select: { tagSlug: true } },
      furnitureItems: { select: { productUrl: true } },
    },
  });

  if (candidates.length === 0) return null;

  const tagSet = new Set(styleTagSlugs);
  const scored = candidates.map((p) => {
    let score = 0;
    if (category && category !== "other" && p.category === category) score += 2;
    for (const t of p.styleTags) {
      if (tagSet.has(t.tagSlug)) score += 3;
    }
    if (urlSet.size > 0) {
      let shared = 0;
      for (const fi of p.furnitureItems) {
        if (urlSet.has(fi.productUrl.trim())) shared += 1;
      }
      score += Math.min(shared * SCORE_PER_SHARED_URL, MAX_URL_SCORE);
    }
    return { p, score };
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.p.createdAt.getTime() - a.p.createdAt.getTime();
  });
  const related = scored.slice(0, MAX_RELATED).map((x) => x.p);

  return (
    <section className="mt-10 border-t pt-6 nook-border-hairline" aria-labelledby="related-heading">
      <h2 id="related-heading" className="nook-section-label mb-3">
        似た部屋
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {related.map((p) => (
          <div key={p.id} className="stagger-item">
            <Link
              href={`/post/${p.id}`}
              className="nook-bg-sunken relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)] transition hover:opacity-92"
            >
              {p.medias[0]?.path ? (
                <NookImage
                  src={p.medias[0].path}
                  alt={p.title ? `${p.title}の写真` : "似た部屋の写真"}
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
