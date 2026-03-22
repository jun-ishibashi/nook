import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStyleTagLabel } from "@/lib/style-tags";

const WINDOW_DAYS = 45;
const MAX_TAGS = 5;

/** 期間内の投稿でタグ件数が多い順のスタイル導線（意図を短文で示す） */
export default async function HomeTrendingStyles() {
  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const rows = await prisma.postStyleTag.groupBy({
    by: ["tagSlug"],
    where: {
      post: { createdAt: { gte: since } },
    },
    _count: { tagSlug: true },
    orderBy: { _count: { tagSlug: "desc" } },
    take: MAX_TAGS,
  });

  if (rows.length === 0) return null;

  return (
    <section className="home-tail-discover" aria-labelledby="trending-styles-heading">
      <h2 id="trending-styles-heading" className="home-browse-label mb-2">
        ムードからさがす
      </h2>
      <div className="flex flex-wrap gap-2">
        {rows.map((r) => (
          <Link
            key={r.tagSlug}
            href={`/?styles=${encodeURIComponent(r.tagSlug)}`}
            className="home-trending-pill active:scale-[0.98]"
            scroll={false}
            aria-label={`${getStyleTagLabel(r.tagSlug)}、過去${WINDOW_DAYS}日で${r._count.tagSlug}件`}
          >
            {getStyleTagLabel(r.tagSlug)}
            <span className="ml-0.5 tabular-nums opacity-60" aria-hidden>
              {r._count.tagSlug}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
