"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/session-user";

/** フォロー中フィードを開いたときに呼び、新着バッジの基準時刻を更新 */
export async function markFollowFeedViewed() {
  const userId = await getOptionalUserId();
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: { followFeedLastViewedAt: new Date() },
  });
  revalidatePath("/", "layout");
}
