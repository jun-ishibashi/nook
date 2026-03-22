import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { HomePostGridItem } from "@/components/home-post-grid";

type HomeFeedIncludeAuth = {
  medias: { take: 1; orderBy: { id: "asc" } };
  user: { select: { id: true; name: true; image: true } };
  styleTags: { select: { tagSlug: true } };
  furnitureItems: { select: { price: true } };
  _count: { select: { furnitureItems: true; likes: true } };
  likes: { where: { userId: string }; select: { id: true } };
  bookmarks: { where: { userId: string }; select: { id: true } };
};

type HomeFeedIncludePublic = {
  medias: { take: 1; orderBy: { id: "asc" } };
  user: { select: { id: true; name: true; image: true } };
  styleTags: { select: { tagSlug: true } };
  furnitureItems: { select: { price: true } };
  _count: { select: { furnitureItems: true; likes: true } };
  likes: false;
  bookmarks: false;
};

export type HomeFeedPostWithViewer = Prisma.PostGetPayload<{
  include: HomeFeedIncludeAuth;
}>;

export type HomeFeedPostPublic = Prisma.PostGetPayload<{
  include: HomeFeedIncludePublic;
}>;

export type HomeFeedPostRow = HomeFeedPostWithViewer | HomeFeedPostPublic;

const orderByCreatedDesc = { createdAt: "desc" as const };
const mediasFirst = { take: 1 as const, orderBy: { id: "asc" as const } };
const userPublic = { select: { id: true, name: true, image: true } as const };
const styleTagsSelect = { select: { tagSlug: true } as const };
const furniturePriceOnly = { select: { price: true } as const };
const postCounts = {
  select: { furnitureItems: true, likes: true } as const,
};

export async function fetchHomeFeedPosts(
  where: Prisma.PostWhereInput,
  currentUserId: string | undefined,
): Promise<HomeFeedPostRow[]> {
  if (currentUserId) {
    return prisma.post.findMany({
      where,
      orderBy: orderByCreatedDesc,
      include: {
        medias: mediasFirst,
        user: userPublic,
        styleTags: styleTagsSelect,
        furnitureItems: furniturePriceOnly,
        _count: postCounts,
        likes: { where: { userId: currentUserId }, select: { id: true } },
        bookmarks: { where: { userId: currentUserId }, select: { id: true } },
      },
    });
  }

  return prisma.post.findMany({
    where,
    orderBy: orderByCreatedDesc,
    include: {
      medias: mediasFirst,
      user: userPublic,
      styleTags: styleTagsSelect,
      furnitureItems: furniturePriceOnly,
      _count: postCounts,
      likes: false,
      bookmarks: false,
    },
  });
}

export function toHomePostGridItem(
  p: HomeFeedPostRow,
  currentUserId: string | undefined,
): HomePostGridItem {
  const totalRaw = p.furnitureItems.reduce((acc, f) => acc + (f.price ?? 0), 0);
  const liked =
    currentUserId != null && "likes" in p && Array.isArray(p.likes)
      ? p.likes.length > 0
      : false;
  const bookmarked =
    currentUserId != null && "bookmarks" in p && Array.isArray(p.bookmarks)
      ? p.bookmarks.length > 0
      : false;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    thumbnail: p.medias[0]?.path ?? null,
    user: p.user,
    itemCount: p._count.furnitureItems,
    likeCount: p._count.likes,
    liked,
    bookmarked,
    styleTags: p.styleTags.map((t) => t.tagSlug),
    totalPrice: totalRaw > 0 ? totalRaw : null,
    createdAt: p.createdAt.toISOString(),
  };
}
