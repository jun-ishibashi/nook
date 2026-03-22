import Link from "next/link";

export default function HomeLoggedInOverview({
  postCount,
  followingCount,
  bookmarkCount,
  wishlistCount,
}: {
  postCount: number;
  followingCount: number;
  bookmarkCount: number;
  wishlistCount: number;
}) {
  function getMessage() {
    if (postCount === 0 && followingCount === 0) {
      return "気になる部屋を見つけながら、自分の部屋も少しずつ整えられます。";
    }
    if (postCount === 0) {
      return "見つけた部屋を参考に、一枚から載せてみても大丈夫です。";
    }
    if (followingCount === 0) {
      return "気になる人をフォローすると、みんなの部屋の一覧が好みに近づきます。";
    }
    return "気になった部屋を見返しながら、自分の部屋も少しずつ整えられます。";
  }

  return (
    <section
      className="nook-elevated-surface overflow-hidden p-4 sm:p-5"
      aria-labelledby="home-overview-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1
            id="home-overview-heading"
            className="nook-fg text-base font-semibold tracking-tight sm:text-lg"
          >
            <span className="inline-block">自分のペースで、</span>
            <span className="inline-block">部屋にこだわってみる</span>
          </h1>
          <p className="nook-fg-muted mt-2 max-w-xl text-[13px] leading-relaxed">
            {getMessage()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <label htmlFor="post_modal" className="btn-primary cursor-pointer text-sm sm:text-xs">
            写真を載せる
          </label>
          <Link href="/dashboard" className="btn-secondary text-sm sm:text-xs">
            マイページ
          </Link>
          <Link href="/?feed=following" scroll={false} className="btn-secondary text-sm sm:text-xs">
            フォロー中
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 nook-border-hairline sm:grid-cols-4">
        <StatTile label="載せた部屋" value={postCount} href="/dashboard" />
        <StatTile label="フォロー中" value={followingCount} href="/?feed=following" />
        <StatTile label="保存した部屋" value={bookmarkCount} href="/dashboard?tab=bookmarks" />
        <StatTile label="欲しい" value={wishlistCount} href="/dashboard?tab=wishlist" />
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      scroll={href.startsWith("/?")}
      className="nook-stat-tile flex min-h-[var(--touch)] flex-col justify-center rounded-[var(--radius-sm)] border px-3 py-2.5 transition hover:opacity-90 active:scale-[0.99] sm:min-h-0 sm:py-3"
    >
      <p className="nook-fg-muted text-[10px] font-medium leading-snug">{label}</p>
      <p className="nook-fg mt-1 text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </Link>
  );
}
