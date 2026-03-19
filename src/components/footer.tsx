import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer
      className="mt-auto nook-app-canvas"
      style={{ borderTop: "1px solid var(--hairline)" }}
    >
      <div className="nook-page flex flex-col items-center gap-2.5 py-7 sm:py-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em]"
          style={{ color: "var(--text-muted)" }}
        >
          <Logo size={16} />
          NOOK
        </Link>
        <nav
          className="flex max-w-md flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:gap-x-5"
          style={{ color: "var(--text-muted)" }}
          aria-label="フッター"
        >
          <Link href="/" className="min-h-9 inline-flex items-center px-1 transition hover:opacity-75">
            みんなの部屋
          </Link>
          <Link href="/login" className="min-h-9 inline-flex items-center px-1 transition hover:opacity-75">
            ログイン
          </Link>
          <Link href="/dashboard" className="min-h-9 inline-flex items-center px-1 transition hover:opacity-75">
            マイページ
          </Link>
          <Link href="/terms" className="min-h-9 inline-flex items-center px-1 transition hover:opacity-75">
            利用規約
          </Link>
          <Link href="/privacy" className="min-h-9 inline-flex items-center px-1 transition hover:opacity-75">
            プライバシー
          </Link>
        </nav>
        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
          &copy; {new Date().getFullYear()} NOOK
        </p>
      </div>
    </footer>
  );
}
