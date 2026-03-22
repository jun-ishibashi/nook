import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "NOOK の個人情報の扱い（サンプル文面）",
};

export default function PrivacyPage() {
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
        <div className="nook-elevated-surface mt-6 space-y-4 overflow-hidden p-5 sm:p-6">
          <div>
            <p className="nook-section-label mb-2">法務（サンプル）</p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              プライバシーポリシー
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              取得するデータと使い方をまとめたページです（サンプル文面）。本文は正確さを優先し、公開前に法務確認してください。
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              最終更新: 2025年3月19日
            </p>
          </div>
          <div className="prose-nook space-y-5 border-t pt-6 text-sm leading-relaxed" style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
          <section>
            <h2>1. 取得する情報</h2>
            <p className="mt-2">
              本サービスは、ログインに利用する認証プロバイダ（例: Google）から、メールアドレス・表示名・プロフィール画像等を取得する場合があります。また、利用者が本サービス上に載せた写真・テキスト・購入リンク等を保存します。
            </p>
          </section>
          <section>
            <h2>2. 利用目的</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>本サービスの提供・本人確認・不正利用防止</li>
              <li>お問い合わせ対応</li>
              <li>サービス改善のための統計的分析（個人を特定しない形に加工する場合があります）</li>
            </ul>
          </section>
          <section>
            <h2>3. 第三者提供・委託</h2>
            <p className="mt-2">
              法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。ホスティング・画像配信・認証等のため、信頼できる事業者に処理を委託する場合があります。
            </p>
          </section>
          <section>
            <h2>4. Cookie 等</h2>
            <p className="mt-2">
              セッション維持・セキュリティのために Cookie 等を使用する場合があります。ブラウザの設定で無効化できますが、一部機能が利用できなくなることがあります。
            </p>
          </section>
          <section>
            <h2>5. 開示・訂正・削除</h2>
            <p className="mt-2">
              個人情報の開示・訂正・利用停止等のご請求については、運営者が別途定める連絡窓口へご連絡ください（本サンプルでは窓口未設定）。
            </p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
