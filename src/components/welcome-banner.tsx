"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getStyleTagLabel, type StyleTagSlug } from "@/lib/style-tags";
import { HOME_HERO_IMAGE_SRC } from "@/lib/site-images";

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
        {/* 表示幅に対して元画像が小さいと拡大で荒れる。差し替え時は幅 1280px 以上を推奨 */}
        <Image
          src={HOME_HERO_IMAGE_SRC}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 639px) 100vw, 672px"
          priority
          quality={95}
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
            みんなの部屋のムードから、家具・雑貨に出会えます。気になったら、商品ページまで辿れます。
          </p>
        </div>
        <div className="home-hero__actions">
          <Link href="/login" className="btn-primary home-hero__cta text-sm sm:text-xs">
            ログインして写真を載せる
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
