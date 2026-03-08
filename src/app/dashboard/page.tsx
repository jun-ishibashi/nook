import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardContent from "@/components/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { medias: { take: 1, orderBy: { id: "asc" } }, _count: { select: { furnitureItems: true, likes: true } } },
  });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: { medias: { take: 1, orderBy: { id: "asc" } }, user: { select: { id: true, name: true } }, _count: { select: { furnitureItems: true, likes: true } } },
      },
    },
  });

  const stats = {
    postCount: posts.length,
    totalLikes: posts.reduce((sum, p) => sum + p._count.likes, 0),
    totalItems: posts.reduce((sum, p) => sum + p._count.furnitureItems, 0),
    bookmarkCount: bookmarks.length,
  };

  const postList = posts.map((p) => ({
    id: p.id, title: p.title, thumbnail: p.medias[0]?.path ?? null,
    itemCount: p._count.furnitureItems, likeCount: p._count.likes, createdAt: p.createdAt.toISOString(),
  }));

  const bookmarkList = bookmarks.map((b) => ({
    id: b.post.id, title: b.post.title, thumbnail: b.post.medias[0]?.path ?? null,
    userName: b.post.user.name, itemCount: b.post._count.furnitureItems, likeCount: b.post._count.likes, createdAt: b.post.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold" style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-lg font-extrabold" style={{ color: "var(--text)" }}>{user.name}</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          {[
            { n: stats.postCount, l: "投稿" },
            { n: stats.totalLikes, l: "いいね" },
            { n: stats.totalItems, l: "アイテム" },
            { n: stats.bookmarkCount, l: "保存" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-lg font-extrabold" style={{ color: "var(--text)" }}>{s.n}</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-5 flex gap-2">
          <label htmlFor="post_modal" className="btn-primary cursor-pointer text-xs">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            新規投稿
          </label>
          <Link href="/" className="btn-secondary text-xs">みんなの投稿</Link>
        </div>

        <DashboardContent posts={postList} bookmarks={bookmarkList} />
      </div>
    </div>
  );
}
