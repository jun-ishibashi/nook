# Interior Share

**お部屋の写真で、暮らしを共有** — インテリア写真を投稿し、写っている家具・雑貨を実際の購入ページに紐付けできる Web アプリです。

## 機能

- **投稿一覧** … お部屋写真のサムネイルをグリッド表示。紐付けられたアイテム数も表示
- **投稿作成** … ログイン後「投稿する」から
  1. タイトル + 部屋の写真を追加
  2. 家具・雑貨の「名前」と「購入ページのURL」を任意で複数登録
  3. 確認して投稿
- **投稿詳細** … 写真ギャラリー + **このお部屋のアイテム**一覧。各アイテムの「購入ページへ」ボタンから外部サイトへ
- **認証** … Google アカウントでのみログイン（SSO）

## 想定ユース

- 投稿者: リビングや寝室などの写真を上げ、ソファやテーブルなどに IKEA・Amazon などの商品URLを紐付ける
- 閲覧者: 気になる部屋の写真を開き、欲しい家具の「購入ページへ」から購入サイトに遷移する

## 必要環境

- Node.js 18+
- npm

## セットアップ

**ターミナルを新しく開き**、プロジェクトのルートに移動してから実行してください。

```bash
cd /Users/junishibashi/Development/Projects/interior-app0320

npm install
cp .env.example .env   # 編集: DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm run db:push        # 初回のみ
npm run dev
```

ブラウザで http://localhost:3000 を開く。

1. **Google でログイン**（Google Cloud Console で OAuth クライアント ID を作成し、`.env` に `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を設定）
2. ナビバーの **投稿する** から、タイトル・写真・アイテム（名前 + 購入URL）を入力して投稿

> **`ENOENT: uv_cwd` が出る場合** … 新しいターミナルを開き、上のように `cd` でプロジェクトのフルパスを指定してから実行してください。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run db:push` | DB スキーマ反映 |

## 技術スタック

- Next.js 14 (App Router)
- React 18
- NextAuth.js / Prisma 6 (SQLite)
- Tailwind CSS（ストーン・アンバー系のインテリア風テーマ）
- react-dropzone / react-image-gallery

## 本番デプロイ（Vercel など）

- **DB**: 本番では Vercel Postgres や Neon などに切り替え
- **画像**: Vercel Blob や S3 を推奨
- **NEXTAUTH_URL**: 本番の URL を設定
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET**: 本番ドメインを承認済みの OAuth クライアントを設定
