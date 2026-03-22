import type { Metadata } from "next";
import PageBackLink from "@/components/page-back-link";

export const metadata: Metadata = {
  title: "利用規約",
  description: "NOOK の利用について（サンプル文面）",
};

export default function TermsPage() {
  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page nook-safe-page-pb pt-8 sm:pt-12">
        <PageBackLink />
        <div className="nook-elevated-surface mt-6 space-y-4 overflow-hidden p-5 sm:p-6">
          <div>
            <p className="nook-section-label mb-2">法務（サンプル）</p>
            <h1 className="nook-fg text-xl font-semibold tracking-tight">利用規約</h1>
            <p className="nook-fg-secondary mt-3 text-sm leading-relaxed">
              NOOK は、一人暮らしの部屋の雰囲気を見ながら、気になる家具・雑貨と購入先のヒントも辿れるサービスです。以下はサンプル文面です。公開前に法務確認を。本文は正確さを優先してください。
            </p>
            <p className="nook-fg-muted mt-2 text-xs">
              最終更新: 2025年3月19日
            </p>
          </div>
          <div className="prose-nook prose-nook-block space-y-5 border-t pt-6 text-sm leading-relaxed">
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
