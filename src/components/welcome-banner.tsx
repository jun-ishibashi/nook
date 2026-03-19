"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * §5.1 入口層。§6.1 の想像の軸（男一人暮らし・こだわり・モノトーン等）に寄せつつ、§6.1 末のとおり「男性専用」は言わない。
 */
export default function WelcomeBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <header
      className="home-welcome-editorial mb-8 border-b pb-7 sm:mb-9 sm:pb-8"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div
        className="border-l-2 pl-4 sm:pl-5"
        style={{ borderColor: "color-mix(in srgb, var(--accent-warm) 38%, var(--hairline))" }}
      >
        <p className="nook-section-label mb-2">みんなの部屋</p>
        <h2 className="max-w-[22rem] text-pretty text-[1.5rem] font-bold leading-tight tracking-tighter sm:max-w-xl sm:text-[1.875rem] sm:leading-tight">
          静かに、こだわりを重ねる。<br />
          理想の部屋を、その手の中に。
        </h2>
        <div className="mt-4 max-w-md space-y-2 text-[13px] leading-relaxed sm:text-[13px]" style={{ color: "var(--text-muted)" }}>
          <p>
            無機質、モノトーン、光。一人暮らしのインスピレーションを、現実の部屋へ。
            住んでいそうな画から、その家具が「どこで買えるか」までを最短でつなぎます。
          </p>
          <p className="italic opacity-80">
            一発で完成させなくて大丈夫。少しずつ、自分のこだわりを足していくストーリーを。
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Link href="/login" className="btn-primary text-xs">
            ログインして写真を載せる
          </Link>
          <Link href="#home-feed-anchor" className="btn-ghost text-xs">
            まずは眺める
          </Link>
        </div>
      </div>
    </header>
  );
}
