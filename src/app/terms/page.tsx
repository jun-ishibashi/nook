import type { Metadata } from "next";
import PageBackLink from "@/components/page-back-link";
import { OperatorContact } from "@/components/operator-contact";

export const metadata: Metadata = {
  title: "利用規約",
  description: "NOOK の利用条件（個人運営）",
};

export default function TermsPage() {
  return (
    <div className="nook-app-canvas min-h-screen">
      <div className="nook-page nook-safe-page-pb pt-8 sm:pt-12">
        <PageBackLink />
        <div className="nook-elevated-surface mt-6 space-y-4 overflow-hidden p-5 sm:p-6">
          <div>
            <p className="nook-section-label mb-2">個人運営</p>
            <h1 className="nook-fg text-xl font-semibold tracking-tight">利用規約</h1>
            <p className="nook-fg-secondary mt-3 text-sm leading-relaxed">
              NOOK（以下「本サービス」）は個人が運営するウェブサービスです。本ページは、日本の一般的なオンラインサービスの慣行および個人情報保護に関する法律の趣旨を踏まえて記載していますが、法的助言に代わるものではありません。事業の性質や規模に応じて内容を見直してください。
            </p>
            <p className="nook-fg-muted mt-2 text-xs">最終更新: 2026年3月27日</p>
            <OperatorContact className="mt-3 text-sm leading-relaxed nook-fg-secondary" />
          </div>
          <div className="prose-nook prose-nook-block space-y-6 border-t pt-6 text-sm leading-relaxed">
            <section>
              <h2>第1条（適用）</h2>
              <p className="mt-2">
                本規約は、本サービスの利用条件を定めます。本サービスにアクセスし、またはアカウントを作成して利用することで、ユーザーは本規約に同意したものとみなします。本規約に同意できない場合は、本サービスを利用しないでください。
              </p>
            </section>
            <section>
              <h2>第2条（定義）</h2>
              <p className="mt-2">
                「運営者」とは、本サービスを提供する個人をいいます。「ユーザー」とは、本サービスを利用する者をいいます。「コンテンツ」とは、ユーザーが本サービスに投稿または送信する写真、文章、家具・雑貨に関する情報、購入先の URL、プロフィール情報等をいいます。
              </p>
            </section>
            <section>
              <h2>第3条（アカウント）</h2>
              <p className="mt-2">
                本サービスは、Google 等の第三者が提供する認証（OAuth）を利用する場合があります。ユーザーは、認証に用いる情報の正確性およびアカウントの管理責任を負います。第三者の認証サービスの利用については、当該第三者の規約・ポリシーが適用されます。
              </p>
            </section>
            <section>
              <h2>第4条（コンテンツの権利と許諾）</h2>
              <p className="mt-2">
                ユーザーが投稿するコンテンツの著作権その他の権利は、ユーザーに帰属します。ユーザーは、運営者に対し、本サービスの提供・表示・改善・宣伝（SNS 等への紹介を含むがこれに限らない）に必要な範囲で、当該コンテンツを無償・非独占的に利用する権限を許諾するものとします。ただし、運営者は本サービスの性質に照らし合理的な範囲での利用に努めます。
              </p>
            </section>
            <section>
              <h2>第5条（禁止事項）</h2>
              <p className="mt-2">ユーザーは、次の行為をしてはなりません。</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 pl-1">
                <li>法令または公序良俗に違反する行為、犯罪に結びつく行為</li>
                <li>第三者（他のユーザー、著作権者、肖像権者等）の権利を侵害する行為</li>
                <li>虚偽の情報を投稿する行為、他者になりすます行為</li>
                <li>他者を誹謗中傷し、または差別・嫌がらせをする行為</li>
                <li>わいせつ、暴力的、虐待的な内容を投稿する行為</li>
                <li>本サービスまたは第三者のサーバ・ネットワークに過度の負荷をかける行為、不正アクセス行為</li>
                <li>本サービスの運営を妨害する行為、リバースエンジニアリング等の行為（法令で認められる範囲を除く）</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>
            <section>
              <h2>第6条（投稿の削除・利用停止）</h2>
              <p className="mt-2">
                運営者は、禁止事項に該当する、またはそのおそれがあるコンテンツを、事前の通知なく削除し、またはユーザーの利用を一時停止・終了できるものとします。運営者は、個人運営のため、すべてのコンテンツを常時監視する義務を負いません。
              </p>
            </section>
            <section>
              <h2>第7条（外部サイト・購入リンク）</h2>
              <p className="mt-2">
                本サービス上の購入先リンク等は、第三者が運営するウェブサイトへ遷移します。リンク先の商品・価格・在庫・取引条件は当該第三者の責任であり、運営者はその正確性・安全性・適法性を保証しません。ユーザーと第三者との取引に関する紛争は、当事者間で解決してください。
              </p>
            </section>
            <section>
              <h2>第8条（免責）</h2>
              <p className="mt-2">
                本サービスは、現状有姿で提供されます。運営者は、本サービスの正確性、完全性、有用性、中断・欠陥がないことについて保証しません。運営者の故意または重過失による場合を除き、本サービスの利用または利用不能に起因する損害について、運営者は責任を負いません。法令上免責が認められない範囲では、運営者の責任は、ユーザーに現実に発生した直接かつ通常の損害に限られ、かつその額は、当該損害が発生した月においてユーザーが運営者に支払った対価の額（無料の場合は金員 0 円）を上限とします。
              </p>
            </section>
            <section>
              <h2>第9条（サービスの変更・中断・終了）</h2>
              <p className="mt-2">
                運営者は、事前の通知なく、本サービスの内容を変更し、または提供を一時中断・終了できるものとします。可能な限り、本サービス上で告知するよう努めます。
              </p>
            </section>
            <section>
              <h2>第10条（規約の変更）</h2>
              <p className="mt-2">
                運営者は、必要に応じて本規約を変更できます。変更後の規約は、本サービス上に掲示した時点から効力を生じるものとします。重要な変更である場合は、合理的な方法で周知するよう努めます。
              </p>
            </section>
            <section>
              <h2>第11条（準拠法・管轄）</h2>
              <p className="mt-2">
                本規約は日本法に準拠して解釈されます。本サービスに関して紛争が生じた場合、運営者の住所地を管轄する裁判所を第一審の専属的合意管轄とします（運営者が個人の場合、民事訴訟法その他の法令に従います）。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
