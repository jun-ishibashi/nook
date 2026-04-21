import type { Metadata } from "next";
import PageBackLink from "@/components/page-back-link";
import { OperatorContact } from "@/components/operator-contact";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "NOOK における個人情報の取扱い（個人運営）",
};

export default function PrivacyPage() {
  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page nook-safe-page-pb pt-8 sm:pt-12">
        <PageBackLink />
        <div className="nook-elevated-surface mt-6 space-y-4 overflow-hidden p-5 sm:p-6">
          <div>
            <p className="nook-section-label mb-2">個人運営</p>
            <h1 className="nook-fg text-xl font-semibold tracking-tight">プライバシーポリシー</h1>
            <p className="nook-fg-secondary mt-3 text-sm leading-relaxed">
              NOOK（以下「本サービス」）の運営者（個人）は、ユーザーの個人情報を適切に取り扱うため、個人情報の保護に関する法律（個人情報保護法）その他の関連法令の趣旨に沿って、本ポリシーを定めます。本ページは一般的な説明であり、個別の法的助言に代わるものではありません。
            </p>
            <p className="nook-fg-muted mt-2 text-xs">最終更新: 2026年3月27日</p>
            <OperatorContact className="mt-3 text-sm leading-relaxed nook-fg-secondary" />
          </div>
          <div className="prose-nook prose-nook-block space-y-6 border-t pt-6 text-sm leading-relaxed">
            <section>
              <h2>1. 運営者</h2>
              <p className="mt-2">
                本サービスは個人が運営しています。運営者の氏名・連絡先を本サービス上に掲示する場合があります（上記「運営者連絡先」またはサービス内の表示）。
              </p>
            </section>
            <section>
              <h2>2. 取得する情報</h2>
              <p className="mt-2">本サービスは、次の情報を取得・保存する場合があります。</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 pl-1">
                <li>
                  <strong>認証に関する情報</strong>
                  ：Google 等の認証プロバイダ経由で、メールアドレス、表示名、プロフィール画像の URL 等を受け取り、アカウントに紐づけて保存します。
                </li>
                <li>
                  <strong>プロフィール</strong>
                  ：ユーザーが任意で入力する表示名の変更、ひとこと、外部プロフィールへのリンク等。
                </li>
                <li>
                  <strong>投稿コンテンツ</strong>
                  ：部屋の写真、タイトル・説明文、カテゴリ、スタイルタグ、住まいの文脈に関する任意の情報、家具・雑貨の名称・メモ・購入先 URL・価格の目安・リンク確認日等。
                </li>
                <li>
                  <strong>利用に伴う情報</strong>
                  ：いいね、保存（ブックマーク）、欲しいリスト、フォロー関係、投稿の閲覧に関連してサーバーに記録される情報。
                </li>
                <li>
                  <strong>技術情報</strong>
                  ：セッション維持・セキュリティのための Cookie 等、サーバーログ（アクセス日時、IP アドレス、ユーザーエージェント等。内容はホスティング環境により異なります）。
                </li>
              </ul>
            </section>
            <section>
              <h2>3. 利用目的</h2>
              <p className="mt-2">取得した情報は、次の目的のために利用します。</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 pl-1">
                <li>本サービスの提供、本人確認、ユーザー間の投稿・交流機能の実現</li>
                <li>不正利用の防止、セキュリティの維持、お問い合わせへの対応</li>
                <li>サービス改善のための統計的分析（可能な範囲で個人を特定しない形に加工する場合があります）</li>
                <li>法令に基づく対応、および利用規約に違反する行為への対応</li>
              </ul>
              <p className="mt-2 nook-fg-muted text-xs">
                現時点で、広告配信のためだけに第三者の行動ターゲティング広告を用いることは行っていません。今後、分析ツール等を導入する場合は、本ポリシーを更新し、必要に応じて同意取得等を行います。
              </p>
            </section>
            <section>
              <h2>4. 保存期間</h2>
              <p className="mt-2">
                アカウントおよび投稿等は、ユーザーが削除するか本サービスの提供を終了するまで、運営上必要な範囲で保存します。サーバーログ等の保存期間は、インフラ提供者の設定および運営者のバックアップ方針に従います。
              </p>
            </section>
            <section>
              <h2>5. 第三者への提供・委託</h2>
              <p className="mt-2">
                運営者は、次の場合を除き、個人情報を第三者に提供しません。
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 pl-1">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要で、本人の同意を得ることが困難である場合</li>
              </ul>
              <p className="mt-2">
                本サービスの提供にあたり、次のような処理の委託（クラウド上での保管・認証・画像配信等）を行うことがあります。委託先は、個人情報の取扱いについて契約等により監督します。
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 pl-1">
                <li>ホスティング・データベース（例: クラウドインフラ、サーバレス環境）</li>
                <li>認証サービス（例: Google の OAuth）</li>
                <li>画像の保存・配信（例: 画像ホスティングサービス）</li>
              </ul>
              <p className="mt-2 nook-fg-muted text-xs">
                これらの提供者の中には、国外にサーバーを置く事業者が含まれる場合があります。その場合、当該提供者のプライバシーポリシーに従い、適法な保護措置が講じられます。
              </p>
            </section>
            <section>
              <h2>6. Cookie 等</h2>
              <p className="mt-2">
                本サービスは、ログイン状態の維持等に Cookie またはこれに類する技術を使用する場合があります。ブラウザの設定により無効化できますが、ログイン等の機能が利用できなくなることがあります。
              </p>
            </section>
            <section>
              <h2>7. 安全管理措置</h2>
              <p className="mt-2">
                運営者は、個人情報の漏えい、滅失、毀損の防止その他の安全管理のため、HTTPS の利用、アクセス制御、委託先の選定等、個人運営の範囲で合理的な措置を講じます。
              </p>
            </section>
            <section>
              <h2>8. 開示・訂正・利用停止・削除等</h2>
              <p className="mt-2">
                個人情報保護法その他の法令に基づき、保有個人データの開示、訂正、利用停止、消去等を求める権利があります。本サービス内で編集・削除できる情報については、ユーザー自身が操作してください。それ以外の請求は、本ページ上部の連絡先（掲示がある場合）にて受け付けます。本人確認のため、運営者が指定する方法にご協力いただく場合があります。法令により対応できない場合があります。
              </p>
            </section>
            <section>
              <h2>9. 未成年者の利用</h2>
              <p className="mt-2">
                未成年者が本サービスを利用する場合、保護者の方の同意と指導のもとでご利用ください。
              </p>
            </section>
            <section>
              <h2>10. 本ポリシーの変更</h2>
              <p className="mt-2">
                運営者は、法令の改正や本サービスの内容の変更に応じて、本ポリシーを変更することがあります。変更後のポリシーは、本サービス上に掲示した時点から効力を生じます。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
