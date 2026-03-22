"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getStyleTagLabel, type StyleTagSlug } from "@/lib/style-tags";

/** ヒーロー下のムード近道（`style-tags` の slug と整合） */
const WELCOME_MOOD_SHORTCUTS: readonly StyleTagSlug[] = [
  "gray_tone",
  "monotone",
  "oneroom",
  "mukishitsu",
  "desk",
  "coffee",
  "budget_mix",
];

/** 未ログイン向けヒーロー：写真主役・短文コピー・ムード近道 */
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
          <h1 className="home-hero__title">
            部屋にこだわってみる。
          </h1>
          <p className="home-hero__lede">
            一人暮らしの部屋を見ながら、好きな雰囲気を見つけていけます。
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
