import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/upload";
import { CATEGORIES } from "@/lib/categories";
import { normalizeStyleTagSlugs } from "@/lib/style-tags";
import {
  normalizeHousingType,
  normalizeLayoutType,
  normalizeRoomContextNote,
} from "@/lib/room-context";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import { postSearchOrConditions } from "@/lib/post-search";
import { getProductUrlHost } from "@/lib/product-url";
import {
  normalizeFurnitureLinkRelation,
  parseLinkVerifiedDate,
} from "@/lib/furniture-link-meta";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const userId = searchParams.get("userId") ?? "";
  const category = searchParams.get("category") ?? "";
  const activeStyles = parseStyleSlugsFromSearchParams({
    styles: searchParams.get("styles") ?? undefined,
    style: searchParams.get("style") ?? undefined,
  });

  const minPrice = parseInt(searchParams.get("minPrice") ?? "", 10);
  const maxPrice = parseInt(searchParams.get("maxPrice") ?? "", 10);

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user
    ? await prisma.user
        .findUnique({ where: { email: session.user.email! }, select: { id: true } })
        .then((u) => u?.id)
    : undefined;

  const where: Record<string, any> = {};
  if (q) {
    where.OR = postSearchOrConditions(q);
  }
  if (userId) {
    where.userId = userId;
  }
  if (category) {
    where.category = category;
  }
  if (activeStyles.length > 0) {
    where.AND = activeStyles.map((tagSlug) => ({
      styleTags: { some: { tagSlug } },
    }));
  }

  // 価格フィルター: 指定された範囲の価格を持つ家具が1つ以上ある投稿を抽出
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    const priceWhere: Record<string, any> = {};
    if (!isNaN(minPrice)) priceWhere.gte = minPrice;
    if (!isNaN(maxPrice)) priceWhere.lte = maxPrice;
    
    where.furnitureItems = {
      some: {
        price: priceWhere
      }
    };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      medias: { take: 1, orderBy: { id: "asc" } },
      user: { select: { id: true, name: true, image: true } },
      furnitureItems: { select: { price: true } },
      styleTags: { select: { tagSlug: true } },
      _count: { select: { furnitureItems: true, likes: true } },
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      bookmarks: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
  });

  const list = posts.map((p) => {
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

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) ?? "";
  const category = (formData.get("category") as string) ?? "other";
  const files = formData.getAll("images") as File[];
  const furnitureJson = formData.get("furniture") as string | null;
  const styleTagsJson = formData.get("styleTags") as string | null;
  const housingType = normalizeHousingType(formData.get("housingType"));
  const layoutType = normalizeLayoutType(formData.get("layoutType"));
  const roomContextNote = normalizeRoomContextNote(formData.get("roomContextNote"));

  const validCategories = CATEGORIES.map((c) => c.value as string);
  const safeCategory = validCategories.includes(category) ? category : "other";

  let furniture: {
    name: string;
    productUrl: string;
    note: string;
    price: number | null;
    mediaIndex: number;
    linkRelation: string;
    linkVerifiedAt: Date | null;
  }[] = [];
  if (furnitureJson) {
    try {
      interface FurnitureInput {
        name: string;
        productUrl: string;
        note?: string;
        price?: number;
        mediaIndex?: number;
        linkRelation?: string;
        linkVerifiedDate?: string | null;
      }
      const parsed = JSON.parse(furnitureJson) as FurnitureInput[];
      furniture = (Array.isArray(parsed) ? parsed : [])
        .filter(
          (f) =>
            f &&
            typeof f.name === "string" &&
            typeof f.productUrl === "string" &&
            f.productUrl.startsWith("http")
        )
        .map((f) => ({
          name: f.name,
          productUrl: f.productUrl,
          note: typeof f.note === "string" ? f.note.trim().slice(0, 500) : "",
          price: typeof f.price === "number" && Number.isFinite(f.price) ? Math.max(0, Math.floor(f.price)) : null,
          mediaIndex:
            typeof f.mediaIndex === "number" && Number.isFinite(f.mediaIndex)
              ? Math.max(0, Math.floor(f.mediaIndex))
              : 0,
          linkRelation: normalizeFurnitureLinkRelation(f.linkRelation),
          linkVerifiedAt: parseLinkVerifiedDate(f.linkVerifiedDate),
        }));
    } catch {
      furniture = [];
    }
  }

  let styleTagSlugs = normalizeStyleTagSlugs([]);
  if (styleTagsJson) {
    try {
      const parsed = JSON.parse(styleTagsJson) as unknown;
      styleTagSlugs = normalizeStyleTagSlugs(parsed);
    } catch {
      styleTagSlugs = [];
    }
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!files?.length) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }

  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImage(files[i], i);
    paths.push(url);
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      category: safeCategory,
      housingType,
      layoutType,
      roomContextNote,
      userId: user.id,
      medias: {
        create: paths.map((p) => ({ path: p })),
      },
      furnitureItems: {
        create: furniture.map((f, i) => {
          const url = f.productUrl.trim().slice(0, 2000);
          return {
            name: f.name.trim().slice(0, 200),
            productUrl: url,
            productHost: getProductUrlHost(url),
            note: f.note.slice(0, 500),
            price: f.price,
            sortOrder: i,
            mediaIndex: Math.min(f.mediaIndex ?? 0, Math.max(0, files.length - 1)),
            linkRelation: f.linkRelation,
            linkVerifiedAt: f.linkVerifiedAt,
          };
        }),
      },
      styleTags: {
        create: styleTagSlugs.map((tagSlug) => ({ tagSlug })),
      },
    },
  });

  return NextResponse.json({ ok: true, id: post.id });
}
