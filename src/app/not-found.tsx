import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nook-app-canvas flex min-h-[55vh] flex-col items-center justify-center px-4 py-16">
      {/* 404: 中央寄せのため .nook-page は使わない */}
      <p className="nook-section-label mb-2">404</p>
      <h1 className="nook-fg text-center text-lg font-semibold tracking-tight">ページが見つかりません</h1>
      <p className="nook-fg-muted mt-2 max-w-xs text-center text-xs leading-relaxed">
        アドレスが違うか、移動した可能性があります。
      </p>
      <Link href="/" className="btn-primary mt-8 text-xs">
        みんなの部屋へ
      </Link>
    </div>
  );
}
