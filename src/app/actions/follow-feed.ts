"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** フォロー中フィードを開いたときに呼び、新着バッジの基準時刻を更新 */
export async function markFollowFeedViewed() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { followFeedLastViewedAt: new Date() },
  });
  revalidatePath("/", "layout");
}
