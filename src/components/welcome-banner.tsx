"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * §6 入口層：チラシ感のないエディトリアル帯。
 * 賃貸・ワンルーム・モノトーンのムードを短く示し、生活の温度はフィードの写真に任せる。
 */
export default function WelcomeBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <header className="home-welcome-editorial mb-8 border-b pb-7 sm:mb-9 sm:pb-8" style={{ borderColor: "var(--hairline)" }}>
      <p className="nook-section-label mb-2.5">NOOK</p>
      <h2 className="max-w-[20rem] text-pretty text-[1.375rem] font-semibold leading-snug tracking-tight sm:max-w-lg sm:text-2xl sm:leading-snug">
        好みの部屋と、どこで買えるかをまとめて見つける。
      </h2>
      <p className="mt-3 max-w-md text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        気になった家具・雑貨は、ショップのページまでそのままたどれます。
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Link href="/login" className="btn-primary text-xs">
          ログインして写真を載せる
        </Link>
      </div>
    </header>
  );
}
