"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * §5.1 入口層。§4 短文・ですます、§4.3 で部屋・ムード先。他サービス名は出さない。
 */
export default function WelcomeBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <header
      className="home-welcome-editorial mb-7 border-b pb-6 sm:mb-8 sm:pb-7"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div
        className="border-l-2 pl-4 sm:pl-5"
        style={{ borderColor: "color-mix(in srgb, var(--accent-warm) 38%, var(--hairline))" }}
      >
        <p className="nook-section-label mb-2">みんなの部屋</p>
        <h2 className="max-w-[22rem] text-pretty text-[1.5rem] font-bold leading-tight tracking-tighter sm:max-w-xl sm:text-[1.875rem] sm:leading-tight">
          静かに、こだわりを重ねる。<br />
          好みの部屋から、家具・雑貨の行き先までひと続きで。
        </h2>
        <div className="mt-4 max-w-md space-y-2 text-[13px] leading-relaxed sm:text-[13px]" style={{ color: "var(--text-muted)" }}>
          <p>
            無機質、モノトーン、光。賃貸の現実に、一筋のインスピレーションを。
            住まい手の「こだわり」から、商品ページやショップまで。
          </p>
          <p className="italic opacity-80">
            一発で完成させなくていい。少しずつ、自分だけの物語を足していく贅沢を。
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Link href="/login" className="btn-primary text-xs">
            写真を載せる
          </Link>
          <Link href="#home-feed-anchor" className="btn-ghost text-xs">
            みんなの部屋を見る
          </Link>
        </div>
      </div>
    </header>
  );
}
