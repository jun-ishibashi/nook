import { prisma } from "@/lib/prisma";
import { getProductUrlHost } from "@/lib/product-url";

const FALLBACK_SCAN = 120;

/**
 * インデックス `productHost` を優先。未設定の旧データは直近投稿を走査してマッチ＆遅延更新。
 */
export async function fetchPostsByShopHost(
  normalizedHost: string,
  take: number,
  options?: { interactiveUserId?: string }
) {
  const uid = options?.interactiveUserId;
  const interactive =
    uid != null
      ? {
          likes: { where: { userId: uid }, select: { id: true } },
          bookmarks: { where: { userId: uid }, select: { id: true } },
        }
      : {};

  const indexed = await prisma.post.findMany({
    where: {
      furnitureItems: { some: { productHost: normalizedHost } },
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      styleTags: { select: { tagSlug: true } },
      _count: { select: { furnitureItems: true, likes: true } },
      ...interactive,
    },
  });

  if (indexed.length >= take) return indexed;

  const recent = await prisma.post.findMany({
    where: { furnitureItems: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: FALLBACK_SCAN,
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      styleTags: { select: { tagSlug: true } },
      _count: { select: { furnitureItems: true, likes: true } },
      furnitureItems: { select: { id: true, productUrl: true, productHost: true } },
      ...interactive,
    },
  });

  const seen = new Set(indexed.map((p) => p.id));
  const extra: typeof indexed = [];
  const idsToBackfill: { id: string; host: string }[] = [];

  for (const p of recent) {
    if (seen.has(p.id)) continue;
    const { furnitureItems, ...rest } = p;
    const hit = furnitureItems.some((fi) => {
      const h = fi.productHost ?? getProductUrlHost(fi.productUrl);
      if (h === normalizedHost) {
        if (!fi.productHost) idsToBackfill.push({ id: fi.id, host: normalizedHost });
        return true;
      }
      return false;
    });
    if (hit) {
      extra.push(rest as (typeof indexed)[number]);
      seen.add(p.id);
      if (indexed.length + extra.length >= take) break;
    }
  }

  if (idsToBackfill.length > 0) {
    await Promise.all(
      idsToBackfill.slice(0, 40).map((row) =>
        prisma.furnitureItem.update({
          where: { id: row.id },
          data: { productHost: row.host },
        })
      )
    );
  }

  return [...indexed, ...extra].slice(0, take);
}
