import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session-user";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { postId } = (await request.json()) as { postId: string };
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: false, likeCount: count });
  }

  await prisma.like.create({
    data: { userId: user.id, postId },
  });
  const count = await prisma.like.count({ where: { postId } });
  return NextResponse.json({ liked: true, likeCount: count });
}
