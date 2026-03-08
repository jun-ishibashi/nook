import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/categories";
import CategoryIcon from "@/components/category-icon";
import PostGallery from "@/components/post-gallery";
import LikeButton from "@/components/like-button";
import BookmarkButton from "@/components/bookmark-button";
import ShareButtons from "@/components/share-buttons";

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { medias: { take: 1, orderBy: { id: "asc" } }, user: { select: { name: true } } },
  });
  if (!post) return { title: "投稿が見つかりません | NOOK" };
  const thumbnail = post.medias[0]?.path;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const ogImage = thumbnail?.startsWith("http") ? thumbnail : thumbnail ? `${baseUrl}${thumbnail}` : `${baseUrl}/og-default.png`;
  return {
    title: `${post.title} | NOOK`,
    description: post.description || `${post.user.name} さんのお部屋 - NOOK`,
    openGraph: { title: post.title, description: post.description || `${post.user.name} さんのお部屋`, images: [{ url: ogImage, width: 1200, height: 630 }], type: "article", siteName: "NOOK" },
    twitter: { card: "summary_large_image", title: post.title, description: post.description || `${post.user.name} さんのお部屋`, images: [ogImage] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }).then((u) => u?.id)
    : undefined;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      medias: true,
      user: { select: { id: true, name: true, image: true } },
      furnitureItems: { orderBy: { sortOrder: "asc" } },
      _count: { select: { likes: true } },
      likes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
      bookmarks: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
    },
  });
  if (!post) notFound();

  const liked = currentUserId ? post.likes.length > 0 : false;
  const bookmarked = currentUserId ? post.bookmarks.length > 0 : false;
  const galleryItems = post.medias.map((m) => ({ original: m.path, thumbnail: m.path }));
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/post/${post.id}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-2xl">
        <div style={{ background: "var(--bg-sunken)" }}>
          <PostGallery items={galleryItems} />
        </div>

        <div className="px-4 pb-16">
          {/* Actions */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-1">
              <LikeButton postId={post.id} initialLiked={liked} initialCount={post._count.likes} />
              <BookmarkButton postId={post.id} initialBookmarked={bookmarked} />
            </div>
            <ShareButtons title={post.title} url={shareUrl} />
          </div>

          {/* User */}
          <div className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
              {post.user.name[0]}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{post.user.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Content */}
          <div>
            {post.category && post.category !== "other" && (
              <span className="badge mb-2">
                <CategoryIcon value={post.category} size={12} />
                {getCategoryLabel(post.category)}
              </span>
            )}
            <h1 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>{post.title}</h1>
            {post.description && (
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{post.description}</p>
            )}
          </div>

          {/* Furniture */}
          {post.furnitureItems.length > 0 && (
            <section className="mt-6" aria-labelledby="furniture-heading">
              <h2 id="furniture-heading" className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--text)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }} aria-hidden>
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                アイテム（{post.furnitureItems.length}）
              </h2>
              <ul className="space-y-2" role="list">
                {post.furnitureItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border-subtle)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.name}</span>
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-[0.97]"
                      style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}
                    >
                      購入ページ
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="ml-1 inline" aria-hidden>
                        <path d="M5 2h7v7M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-8">
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-medium transition hover:opacity-70" style={{ color: "var(--text-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
