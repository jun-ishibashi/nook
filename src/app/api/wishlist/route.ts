import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session-user";

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
      createdAt: i.createdAt.toISOString(),
    }))
  );
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = typeof body.productUrl === "string" ? body.productUrl.trim() : "";
  if (!url.startsWith("http")) {
    return NextResponse.json({ error: "Invalid productUrl" }, { status: 400 });
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
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const row = await prisma.itemWishlist.findFirst({
    where: { id, userId: user.id },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.itemWishlist.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
