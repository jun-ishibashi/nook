# NOOK

**NOOK** — 一人暮らし・賃貸の部屋づくりを想像の中心に、モノトーン・デスク・ガジェットなどのこだわりを写真から家具・雑貨の商品ページまでひと続き。インスピレーションと買うあいだを短くするフィード。（ペルソナの寄せ方・性別を問わない方針は [`docs/product-vision.md`](docs/product-vision.md) §6）

## プロダクトの立ち位置（ブレない軸）

**リアルな部屋**とムードの発見に、部屋から **家具・雑貨の商品ページ** までをひと続きにします。**若者向け・おしゃれ・コンクリート感（無機質×余白）**。

- **若者向け** … 写真主役・スマホ前提・いいね／保存／欲しいで軽い参加
- **おしゃれ** … カタログ感より **フィードとスタイル語彙**（タグ・トーン）
- **コンクリート感** … ダーク寄りUI・グレー階調など **飾りすぎない** ビジュアル（コンクリ部屋専用サービスではない）
- **メインターゲットの中心** … **賃貸**・**大学生〜20代後半**・**モノトーン／コンクリ寄りのムードに近い部屋**（性別・住まいの形は問わず。詳細はビジョン参照）

詳細・北極星と「やらないこと」は **[`docs/product-vision.md`](docs/product-vision.md)** を正とする。実装の優先度の仮説（確約ではない）は **[`docs/roadmap.md`](docs/roadmap.md)**。

## 機能

- **みんなの部屋（一覧）** … 2カラムグリッドで写真を一覧表示。カテゴリ・**スタイルタグ**・**家具1点あたりの価格帯**・キーワード検索（絞り込みなしのときはパネル折りたたみ、条件付き URL では自動表示）。スティッキー欄に **適用中条件のチップ** と **条件をすべてクリア**（価格・フォロー中を含む）。**フォロー中**フィード（`?feed=following`）とナビの**新着バッジ**
- **スタイルタグ** … コンクリ／ミニマル／観葉・コーヒーなど（[`src/lib/style-tags.ts`](src/lib/style-tags.ts)）。ホームで **複数タグを AND**（`?styles=coffee,plants`、レガシー `?style=` も解釈）
- **テーマ** … **ダークを既定**（コンクリート調パレット）。ナビのトグルでライトに切替、`localStorage` に保存
- **欲しい** … 家具・雑貨単位（詳細の「欲しい」）。マイページ「欲しい」タブで一覧・削除。`POST/DELETE /api/wishlist`
- **写真を載せる** … ログイン後ヘッダーの「**載せる**」から写真・タイトル・カテゴリ・スタイル・部屋の文脈・家具・雑貨まで3ステップ。複数枚時は **家具・雑貨ごとに写っている写真** を指定可能
- **部屋の詳細** … 写真ギャラリー + 家具・雑貨一覧。カテゴリ・スタイルタグから**同条件の一覧**へ。**似た部屋**（同カテゴリ／タグ）。任意の**部屋の文脈**（賃貸・間取い・ひとこと）。家具行ごとに任意の**リンクの位置づけ**（自分が買った／同型を知っている／参考リンク）と**リンク確認日**（透明性・[`docs/product-vision.md`](docs/product-vision.md) §8.8）
- **いいね / 保存** … 気になる部屋にいいね・保存
- **SNSシェア** … X (Twitter)・LINE・リンクコピー
- **カテゴリ** … リビング、寝室、キッチンなど9カテゴリ
- **公開プロフィール** … マイページで **ひとこと**・**リンク**（Instagram 等）を編集（`PATCH /api/profile`）。`/user/[id]` に表示
- **認証** … Google アカウントでログイン (OAuth)

## 要件

- **Node.js** `>= 20.19.0`（[`package.json`](package.json) の `engines`）

## セットアップ

```bash
npm install
cp .env.example .env   # 編集: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET（DATABASE_URL は `file:./prisma/dev.db` 推奨）
npm run db:push         # 初回のみ（ローカル SQLite を生成。DB ファイルは Git に含めない）
npm run dev
```

Git で無視するファイル・DB の扱いは [`docs/git-and-local-data.md`](docs/git-and-local-data.md) を参照。

ブラウザで http://localhost:3001 を開く（`package.json` の dev ポート）。

### Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. OAuth 同意画面を設定
3. OAuth クライアント ID を作成（リダイレクト URI: `http://localhost:3001/api/auth/callback/google`）
4. `.env` に `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を設定

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド（`prisma generate` → `next build`） |
| `npm run start` | 本番サーバー |
| `npm run lint` | ESLint（Flat Config: [`eslint.config.mjs`](eslint.config.mjs)） |
| `npm run db:push` | DB スキーマ反映 |

## 技術スタック（主要パッケージ）

| 領域 | 採用 |
|------|------|
| フレームワーク | **Next.js 16**（App Router・既定 Turbopack ビルド） |
| UI | **React 19** |
| スタイル | **Tailwind CSS v4** + **@tailwindcss/postcss** |
| 認証 | **NextAuth.js v4**（Google OAuth） |
| ORM / DB | **Prisma ORM 7**（SQLite）+ **`@prisma/adapter-better-sqlite3`** / **better-sqlite3** |
| 設定 | [`prisma.config.ts`](prisma.config.ts) に接続 URL（スキーマの `datasource` には `url` を書かない） |
| 境界 | [`dashboard/page.tsx`](src/app/dashboard/page.tsx) で未ログイン時は `redirect("/login")`（Edge middleware は未使用） |
| 画像 UI | react-dropzone / react-image-gallery |
| 画像ストレージ | Cloudinary（任意） |
| 品質 | TypeScript 5.9 / ESLint 9 + eslint-config-next 16 |

## Prisma 7（SQLite）メモ

- 接続文字列は **[`prisma.config.ts`](prisma.config.ts)** の `datasource.url`（`env("DATABASE_URL")`）で管理
- アプリからは [`src/lib/prisma.ts`](src/lib/prisma.ts) で `PrismaBetterSqlite3` アダプタ付き `PrismaClient` を生成
- 本番で PostgreSQL 等へ切り替える場合は、[Prisma のドライバアダプタ](https://www.prisma.io/docs/orm/overview/databases/database-drivers)に合わせて `prisma.ts` を変更

## 本番デプロイ

- **DB**: Vercel Postgres / Neon 等へ切り替え（上記アダプタ・`DATABASE_URL` を更新）
- **画像**: Cloudinary 推奨（`.env` に `CLOUDINARY_*`）
- **NEXTAUTH_URL**: 本番 URL（OG の `metadataBase` にも利用）
- **Google OAuth**: 本番ドメインをリダイレクト URI に追加
- **ネイティブモジュール**: `better-sqlite3` を使うため、デプロイ先の Node ランタイムとアーキテクチャに合わせたビルドが必要
