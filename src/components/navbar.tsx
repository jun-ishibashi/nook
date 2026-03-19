import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NavbarClient from "./navbar-client";

export default async function Navbar({ postModalId }: { postModalId: string }) {
  let followFeedNewCount = 0;
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, followFeedLastViewedAt: true },
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
  }

  return (
    <NavbarClient postModalId={postModalId} followFeedNewCount={followFeedNewCount} />
  );
}
