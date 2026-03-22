"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getStyleTagLabel, type StyleTagSlug } from "@/lib/style-tags";

/**
 * docs/product-vision.md §6.2 に寄せた近道（slug は既存タグの正）。
 */
const WELCOME_MOOD_SHORTCUTS: readonly StyleTagSlug[] = [
  "gray_tone",
  "monotone",
  "oneroom",
  "mukishitsu",
  "desk",
  "coffee",
  "budget_mix",
];

/**
 * §5.1 入口層：写真ヒーローで温度感を出す。部屋・ムード・発見を先に（§4.3）。
 * セール煽り・バナー感は NG（§6.3）。写真で引き込み、コピーは短文（§4.1）。
 */
export default function WelcomeBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <header className="home-hero">
      {/* 背景写真 */}
      <div className="home-hero__media" aria-hidden>
        <Image
          src="/hero-home.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
          quality={85}
        />
        <div className="home-hero__overlay" />
      </div>

      {/* コンテンツ */}
      <div className="home-hero__content">
        <div className="home-hero__body">
          <p className="home-hero__kicker">みんなの部屋</p>
          <h2 className="home-hero__title">
            リアルなムードの部屋から、
            <br className="sm:hidden" />
            すぐにさがせます。
          </h2>
          <p className="home-hero__lede">
            写真が主役です。開くと家具・雑貨の行き先も、同じ流れで辿れます。
          </p>
        </div>
        <div className="home-hero__actions">
          <Link href="/login" className="btn-primary home-hero__cta text-xs">
            写真を載せる
          </Link>
          <Link
            href="#home-feed-anchor"
            className="home-hero__link"
          >
            みんなの部屋を見る
          </Link>
        </div>
      </div>

      {/* ムードの近道チップ */}
      <div
        className="home-hero__moods nook-hscroll-mask"
        role="list"
        aria-label="ムードの近道"
      >
        {WELCOME_MOOD_SHORTCUTS.map((slug) => (
          <Link
            key={slug}
            href={`/?styles=${encodeURIComponent(slug)}`}
            scroll={false}
            role="listitem"
            className="home-hero__mood-chip shrink-0 active:scale-[0.98]"
          >
            {getStyleTagLabel(slug)}
          </Link>
        ))}
      </div>
    </header>
  );
}
