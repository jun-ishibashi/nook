import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/session-user";
import NavbarClient from "./navbar-client";

export default async function Navbar({ postModalId }: { postModalId: string }) {
  let followFeedNewCount = 0;
  const user = await getOptionalSessionUser({
    id: true,
    followFeedLastViewedAt: true,
  });
  if (user) {
    const followingRows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const ids = followingRows.map((r) => r.followingId);
    if (ids.length > 0) {
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const since =
        user.followFeedLastViewedAt ??
        new Date(new Date().getTime() - weekMs);
      followFeedNewCount = await prisma.post.count({
        where: {
          userId: { in: ids },
          createdAt: { gt: since },
        },
      });
    }
  }

  return (
    <NavbarClient postModalId={postModalId} followFeedNewCount={followFeedNewCount} />
  );
}
