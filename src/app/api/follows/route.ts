import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session-user";
import { apiUserMsg } from "@/lib/api-user-messages";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const me = auth.user;

  const { userId: targetUserId } = (await request.json()) as { userId?: string };
  if (!targetUserId) {
    return NextResponse.json({ error: apiUserMsg.userIdRequired }, { status: 400 });
  }
  if (targetUserId === me.id) {
    return NextResponse.json({ error: apiUserMsg.cannotFollowSelf }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: apiUserMsg.userNotFound }, { status: 404 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: me.id, followingId: targetUserId },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    const followerCount = await prisma.follow.count({ where: { followingId: targetUserId } });
    return NextResponse.json({ following: false, followerCount });
  }

  await prisma.follow.create({
    data: { followerId: me.id, followingId: targetUserId },
  });
  const followerCount = await prisma.follow.count({ where: { followingId: targetUserId } });
  return NextResponse.json({ following: true, followerCount });
}
