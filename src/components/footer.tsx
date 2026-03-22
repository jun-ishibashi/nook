import Link from "next/link";
import Logo from "./logo";

const footerNavLinkClass =
  "min-h-9 inline-flex items-center rounded-sm px-1 transition hover:opacity-75 focus-visible:outline-offset-2";

export default function Footer() {
  return (
    <footer className="mt-auto nook-app-canvas border-t nook-border-hairline">
      <div className="nook-page flex flex-col items-center gap-2.5 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] sm:pt-8 sm:pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
        <Link
          href="/"
          className="nook-fg-muted flex min-h-[var(--touch)] items-center gap-1.5 rounded-sm text-xs font-semibold tracking-[0.06em] focus-visible:outline-offset-2 sm:min-h-0"
        >
          <Logo size={16} />
          NOOK
        </Link>
        <nav
          className="nook-fg-muted flex max-w-md flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:gap-x-5"
          aria-label="フッター"
        >
          <Link href="/" className={footerNavLinkClass}>
            みんなの部屋
          </Link>
          <Link href="/login" className={footerNavLinkClass}>
            ログイン
          </Link>
          <Link href="/dashboard" className={footerNavLinkClass}>
            マイページ
          </Link>
          <Link href="/terms" className={footerNavLinkClass}>
            利用規約
          </Link>
          <Link href="/privacy" className={footerNavLinkClass}>
            プライバシー
          </Link>
        </nav>
        <p className="nook-fg-faint text-[11px]">
          &copy; {new Date().getFullYear()} NOOK
        </p>
      </div>
    </footer>
  );
}
