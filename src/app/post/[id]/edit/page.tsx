import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPostForm from "@/components/edit-post-form";

export const metadata: Metadata = {
  title: "部屋を編集",
  description: "タイトル・キャプション・家具・雑貨・タグを更新",
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/post/${id}/edit`)}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      medias: { select: { id: true } },
      furnitureItems: { orderBy: { sortOrder: "asc" } },
      styleTags: { select: { tagSlug: true } },
    },
  });
  if (!post) notFound();
  if (post.userId !== user.id) redirect(`/post/${id}`);

  const initial = {
    id: post.id,
    title: post.title,
    description: post.description,
    category: post.category,
    housingType: post.housingType ?? "",
    layoutType: post.layoutType ?? "",
    roomContextNote: post.roomContextNote ?? "",
    styleTags: post.styleTags.map((t) => t.tagSlug),
    mediaCount: post.medias.length,
    furnitureItems: post.furnitureItems.map((f) => ({
      id: f.id,
      name: f.name,
      productUrl: f.productUrl,
      note: f.note ?? "",
      mediaIndex: f.mediaIndex ?? 0,
    })),
  };

  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page pb-16 pt-6 sm:py-10">
        <div
          className="rounded-[var(--radius-card)] border p-5 sm:p-6"
          style={{
            borderColor: "var(--hairline)",
            background: "var(--bg-raised)",
            boxShadow: "var(--home-tile-shadow)",
          }}
        >
          <Link
            href={`/post/${id}`}
            className="inline-flex min-h-[var(--touch)] items-center gap-2 text-xs font-medium transition hover:opacity-75"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            部屋に戻る
          </Link>
          <p className="nook-section-label mb-1 mt-5">編集</p>
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            部屋を編集
          </h1>
          <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--hairline)" }}>
            <EditPostForm initial={initial} />
          </div>
        </div>
      </div>
    </div>
  );
}
