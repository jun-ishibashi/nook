import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description: "NOOK の利用について（サンプル文面）",
};

export default function TermsPage() {
  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page pb-16 pt-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex min-h-[var(--touch)] items-center gap-2 text-xs font-medium transition hover:opacity-75"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          みんなの部屋へ
        </Link>
        <div
          className="mt-6 space-y-4 rounded-[var(--radius-card)] border p-5 sm:p-6"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)", boxShadow: "var(--home-tile-shadow)" }}
        >
          <div>
            <p className="nook-section-label mb-2">法務（サンプル）</p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              利用規約
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              サンプル文面です。公開前に法務確認を。本文は正確さ優先。
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              最終更新: 2025年3月19日
            </p>
          </div>
          <div className="prose-nook space-y-5 border-t pt-6 text-sm leading-relaxed" style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
          <section>
            <h2>第1条（適用）</h2>
            <p className="mt-2">
              本規約は、NOOK（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </p>
          </section>
          <section>
            <h2>第2条（アカウント）</h2>
            <p className="mt-2">
              本サービスは第三者が提供する認証（例: Google）を利用する場合があります。ユーザーは正確な情報の提供、認証情報の管理責任を負います。
            </p>
          </section>
          <section>
            <h2>第3条（投稿コンテンツ）</h2>
            <p className="mt-2">
              ユーザーが投稿する写真・文章・リンク等の権利はユーザーに帰属します。ユーザーは、当該コンテンツを本サービスの運営・表示・改善のために非独占的に利用することを許諾するものとします。
            </p>
            <p className="mt-2">
              第三者の権利を侵害する内容、違法な内容、他者を誹謗中傷する内容の投稿を禁止します。
            </p>
          </section>
          <section>
            <h2>第4条（外部リンク）</h2>
            <p className="mt-2">
              本サービス上の購入リンク等は第三者のサイトへ遷移します。リンク先の内容・取引は各サイトの規約に従い、当方は責任を負いません。
            </p>
          </section>
          <section>
            <h2>第5条（免責・サービス変更）</h2>
            <p className="mt-2">
              本サービスは現状有姿で提供されます。運営者は、事前の通知なく本サービスの内容を変更・中断・終了できるものとします。可能な限り合理的な範囲で告知を行います。
            </p>
          </section>
          <section>
            <h2>第6条（準拠法）</h2>
            <p className="mt-2">本規約は日本法を準拠法とします。</p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
