import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { normalizeStyleTagSlugs } from "@/lib/style-tags";
import {
  normalizeHousingType,
  normalizeLayoutType,
  normalizeRoomContextNote,
} from "@/lib/room-context";
import { normalizeFurnitureInputs, toFurnitureCreateManyRow } from "@/lib/furniture-input";
import { getOptionalUserId, requireApiUser } from "@/lib/session-user";
import { apiUserMsg } from "@/lib/api-user-messages";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const currentUserId = await getOptionalUserId();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      medias: true,
      user: { select: { id: true, name: true, image: true } },
      furnitureItems: { orderBy: { sortOrder: "asc" } },
      styleTags: { select: { tagSlug: true } },
      _count: { select: { likes: true } },
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
  });

  if (!post) return NextResponse.json({ error: apiUserMsg.notFound }, { status: 404 });

  const { styleTags, ...rest } = post;
  return NextResponse.json({
    ...rest,
    styleTags: styleTags.map((t) => t.tagSlug),
    likeCount: post._count.likes,
    liked: currentUserId ? post.likes.length > 0 : false,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: apiUserMsg.notFound }, { status: 404 });
  if (post.userId !== user.id) {
    return NextResponse.json({ error: apiUserMsg.forbidden }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

type PatchBody = {
  title?: string;
  description?: string;
  category?: string;
  housingType?: string;
  layoutType?: string;
  roomContextNote?: string;
  furniture?: {
    name: string;
    productUrl: string;
    brand?: string;
    brandSlug?: string;
    note?: string;
    mediaIndex?: number;
    pinX?: number | null;
    pinY?: number | null;
    linkRelation?: string;
    linkVerifiedDate?: string | null;
  }[];
  styleTags?: string[];
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { medias: { select: { id: true }, orderBy: { id: "asc" } } },
  });
  if (!post) return NextResponse.json({ error: apiUserMsg.notFound }, { status: 404 });
  if (post.userId !== user.id) {
    return NextResponse.json({ error: apiUserMsg.forbidden }, { status: 403 });
  }
  const mediaCount = post.medias.length;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: apiUserMsg.invalidJson }, { status: 400 });
  }

  const validCategories = CATEGORIES.map((c) => c.value as string);
  const data: {
    title?: string;
    description?: string;
    category?: string;
    housingType?: string;
    layoutType?: string;
    roomContextNote?: string;
  } = {};

  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.trim() : "";
    if (!t) {
      return NextResponse.json({ error: apiUserMsg.titleRequired }, { status: 400 });
    }
    data.title = t.slice(0, 100);
  }
  if (body.description !== undefined) {
    data.description =
      typeof body.description === "string"
        ? body.description.trim().slice(0, 500)
        : "";
  }
  if (body.category !== undefined) {
    const c =
      typeof body.category === "string" && validCategories.includes(body.category)
        ? body.category
        : "other";
    data.category = c;
  }
  if (body.housingType !== undefined) {
    data.housingType = normalizeHousingType(body.housingType);
  }
  if (body.layoutType !== undefined) {
    data.layoutType = normalizeLayoutType(body.layoutType);
  }
  if (body.roomContextNote !== undefined) {
    data.roomContextNote = normalizeRoomContextNote(body.roomContextNote);
  }

  const hasFurniture = Object.prototype.hasOwnProperty.call(body, "furniture");
  if (hasFurniture && !Array.isArray(body.furniture)) {
    return NextResponse.json({ error: apiUserMsg.furnitureShape }, { status: 400 });
  }
  const hasStyleTags = Object.prototype.hasOwnProperty.call(body, "styleTags");
  if (hasStyleTags && !Array.isArray(body.styleTags)) {
    return NextResponse.json({ error: apiUserMsg.styleTagsShape }, { status: 400 });
  }
  if (Object.keys(data).length === 0 && !hasFurniture && !hasStyleTags) {
    return NextResponse.json({ error: apiUserMsg.noFieldsToUpdate }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.post.update({ where: { id }, data });
    }
    if (hasStyleTags && Array.isArray(body.styleTags)) {
      const slugs = normalizeStyleTagSlugs(body.styleTags);
      await tx.postStyleTag.deleteMany({ where: { postId: id } });
      if (slugs.length > 0) {
        await tx.postStyleTag.createMany({
          data: slugs.map((tagSlug) => ({ postId: id, tagSlug })),
        });
      }
    }
    if (hasFurniture && Array.isArray(body.furniture)) {
      const furniture = normalizeFurnitureInputs(body.furniture);
      await tx.furnitureItem.deleteMany({ where: { postId: id } });
      if (furniture.length > 0) {
        await tx.furnitureItem.createMany({
          data: furniture.map((f, i) => toFurnitureCreateManyRow(f, i, mediaCount, id)),
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
