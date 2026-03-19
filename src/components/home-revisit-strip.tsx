import Link from "next/link";

/** §8.1 保存・欲しいからの再訪（通知なし・短文のみ） */
export default function HomeRevisitStrip({
  bookmarkCount,
  wishlistCount,
  /** 件数が0でも、マイページへの軽い導線を出す（ログイン済みホーム用） */
  showEmptyHint = false,
}: {
  bookmarkCount: number;
  wishlistCount: number;
  showEmptyHint?: boolean;
}) {
  const hasItems = bookmarkCount > 0 || wishlistCount > 0;

  if (!hasItems && !showEmptyHint) return null;

  return (
    <div className="home-revisit-strip pb-1.5 pt-0.5">
      <p className="text-[10px] leading-snug" style={{ color: "var(--text-faint)" }}>
        {!hasItems && showEmptyHint ? (
          <>
            <Link
              href="/dashboard"
              className="font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
              style={{ color: "var(--text-muted)" }}
            >
              マイページ
            </Link>
            <span style={{ color: "var(--text-muted)" }}>（保存・欲しい）</span>
          </>
        ) : (
          <>
            <span className="font-medium" style={{ color: "var(--text-muted)" }}>
              マイページ
            </span>
            {bookmarkCount > 0 ? (
              <>
                <span className="mx-1 opacity-40" aria-hidden>
                  ・
                </span>
                <Link
                  href="/dashboard?tab=bookmarks"
                  className="font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
                  style={{ color: "var(--text-muted)" }}
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
                  className="font-medium underline decoration-transparent underline-offset-2 transition hover:opacity-90"
                  style={{ color: "var(--text-muted)" }}
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
