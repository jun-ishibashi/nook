import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session-user";
import { apiUserMsg } from "@/lib/api-user-messages";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const items = await prisma.itemWishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    items.map((i) => ({
      id: i.id,
      name: i.name,
      productUrl: i.productUrl,
      note: i.note,
      sourcePostId: i.sourcePostId,
      buyRank: i.buyRank,
      createdAt: i.createdAt.toISOString(),
    }))
  );
}

/** 欲しいリストの買う順だけ更新（自分用） */
export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  let body: { id?: unknown; buyRank?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: apiUserMsg.invalidJson }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: apiUserMsg.idRequired }, { status: 400 });
  }
  const rawRank = body.buyRank;
  if (typeof rawRank !== "number" || !Number.isFinite(rawRank)) {
    return NextResponse.json({ error: apiUserMsg.buyRankInvalid }, { status: 400 });
  }
  const buyRank = Math.max(0, Math.min(99, Math.floor(rawRank)));

  const row = await prisma.itemWishlist.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!row) return NextResponse.json({ error: apiUserMsg.notFound }, { status: 404 });

  await prisma.itemWishlist.update({
    where: { id },
    data: { buyRank },
  });

  return NextResponse.json({ ok: true, buyRank });
}

/** トグル: 同じ URL があれば削除、なければ追加 */
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  let body: { productUrl?: string; name?: string; note?: string; postId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: apiUserMsg.invalidJson }, { status: 400 });
  }

  const url = typeof body.productUrl === "string" ? body.productUrl.trim() : "";
  if (!url.startsWith("http")) {
    return NextResponse.json({ error: apiUserMsg.invalidProductUrl }, { status: 400 });
  }
  const safeUrl = url.slice(0, 2000);
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 200)
      : "名称未設定";
  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  const sourcePostId =
    typeof body.postId === "string" && body.postId ? body.postId : null;

  const existing = await prisma.itemWishlist.findUnique({
    where: {
      userId_productUrl: { userId: user.id, productUrl: safeUrl },
    },
  });

  if (existing) {
    await prisma.itemWishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.itemWishlist.create({
    data: {
      userId: user.id,
      productUrl: safeUrl,
      name,
      note,
      sourcePostId,
    },
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: apiUserMsg.idRequired }, { status: 400 });
  }

  const row = await prisma.itemWishlist.findFirst({
    where: { id, userId: user.id },
  });
  if (!row) return NextResponse.json({ error: apiUserMsg.notFound }, { status: 404 });

  await prisma.itemWishlist.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
