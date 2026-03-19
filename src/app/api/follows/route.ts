import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 401 });

  const { userId: targetUserId } = (await request.json()) as { userId?: string };
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (targetUserId === me.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
