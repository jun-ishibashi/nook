import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-sunken)" }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-8">
        <Link href="/" className="text-sm font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Interior Share
        </Link>
        <nav className="flex gap-6 text-xs" style={{ color: "var(--text-muted)" }} aria-label="フッター">
          <Link href="/" className="transition hover:opacity-70">ホーム</Link>
          <Link href="/login" className="transition hover:opacity-70">ログイン</Link>
          <Link href="/dashboard" className="transition hover:opacity-70">マイページ</Link>
        </nav>
        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
          &copy; {new Date().getFullYear()} Interior Share
        </p>
      </div>
    </footer>
  );
}
