import Link from "next/link";

/** 保存・欲しいリストからの再訪導線（短文・通知なし） */
export default function HomeRevisitStrip({
  bookmarkCount,
  wishlistCount,
  /** 件数が0でも、マイページへの軽い導線を出す（ログイン済みホーム用） */
  showEmptyHint = false,
  /** スティッキー帯などで縦余白を詰めるとき */
  className,
}: {
  bookmarkCount: number;
  wishlistCount: number;
  showEmptyHint?: boolean;
  className?: string;
}) {
  const hasItems = bookmarkCount > 0 || wishlistCount > 0;

  if (!hasItems && !showEmptyHint) return null;

  return (
    <div className={`home-revisit-strip ${className ?? "pb-1.5 pt-0.5"}`}>
      <p className="nook-fg-faint text-[10px] leading-snug">
        {!hasItems && showEmptyHint ? (
          <>
            <Link
              href="/dashboard"
              className="nook-fg-muted font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
            >
              マイページ
            </Link>
          </>
        ) : (
          <>
            <span className="nook-fg-muted font-medium">
              マイページ
            </span>
            {bookmarkCount > 0 ? (
              <>
                <span className="mx-1 opacity-40" aria-hidden>
                  ・
                </span>
                <Link
                  href="/dashboard?tab=bookmarks"
                  className="nook-fg-muted font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
                >
                  保存
                  <span className="tabular-nums opacity-80">（{bookmarkCount}）</span>
                </Link>
              </>
            ) : null}
            {wishlistCount > 0 ? (
              <>
                <span className="mx-1 opacity-40" aria-hidden>
                  ・
                </span>
                <Link
                  href="/dashboard?tab=wishlist"
                  className="nook-fg-muted font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
                >
                  欲しい
                  <span className="tabular-nums opacity-80">（{wishlistCount}）</span>
                </Link>
              </>
            ) : null}
          </>
        )}
      </p>
    </div>
  );
}
