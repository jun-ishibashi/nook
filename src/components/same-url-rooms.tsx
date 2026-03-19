import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NookImage from "@/components/nook-image";

const MAX = 6;
const MAX_URLS = 12;

/**
 * 同じ productUrl を登録しているほかの部屋（発見・リンクの透明性／§8.1）
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

  const posts = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      furnitureItems: { some: { productUrl: { in: urls } } },
    },
    orderBy: { createdAt: "desc" },
    take: MAX,
    select: {
      id: true,
      title: true,
      medias: { take: 1, orderBy: { id: "asc" }, select: { path: true } },
    },
  });

  if (posts.length === 0) return null;

  return (
    <section className="mt-8 border-t pt-6" style={{ borderColor: "var(--hairline)" }} aria-labelledby="same-url-heading">
      <h2 id="same-url-heading" className="nook-section-label mb-2">
        同じリンクの部屋
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-2.5">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/post/${p.id}`}
            className="relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)] transition hover:opacity-92"
            style={{ background: "var(--bg-sunken)" }}
          >
            {p.medias[0]?.path ? (
              <NookImage
                src={p.medias[0].path}
                alt={p.title ? `${p.title}の写真` : "同じリンクの部屋の写真"}
                fill
                className="object-cover"
                sizes="120px"
              />
            ) : (
              <div className="flex h-full items-center justify-center" style={{ color: "var(--text-faint)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
