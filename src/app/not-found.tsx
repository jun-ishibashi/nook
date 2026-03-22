import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nook-app-canvas flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      {/* 404: 中央寄せのため .nook-page は使わない */}
      <p className="nook-section-label mb-2">404</p>
      <h1 className="nook-fg text-center text-lg font-semibold tracking-tight">ページが見つかりません</h1>
      <p className="nook-fg-muted mt-3 max-w-sm text-center text-sm leading-relaxed sm:text-[13px]">
        URL の打ち間違いか、ページが移動した可能性があります。みんなの部屋からあらためてお試しください。
      </p>
      <Link href="/" className="btn-primary mt-9 text-sm sm:text-xs">
        みんなの部屋へ
      </Link>
    </div>
  );
}
