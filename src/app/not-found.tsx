import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nook-app-canvas flex min-h-[55vh] flex-col items-center justify-center px-4 py-16">
      <p className="nook-section-label mb-2">404</p>
      <h1 className="text-center text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
        ページが見つかりません
      </h1>
      <p className="mt-2 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        URL を確認するか、トップへ。
      </p>
      <Link href="/" className="btn-primary mt-8 text-xs">
        みんなの部屋へ
      </Link>
    </div>
  );
}
