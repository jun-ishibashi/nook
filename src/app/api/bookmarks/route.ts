import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session-user";
import { apiUserMsg } from "@/lib/api-user-messages";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { postId } = (await request.json()) as { postId: string };
  if (!postId) {
    return NextResponse.json({ error: apiUserMsg.postIdRequired }, { status: 400 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: { userId: user.id, postId },
  });
  return NextResponse.json({ bookmarked: true });
}
