# NOOK

**みんなの部屋をのぞいてみよう** — お部屋のインテリア写真をシェアして、使っている家具の購入先もわかる Web アプリ。

## 機能

- **投稿一覧** … 2カラムグリッドで写真を一覧表示。カテゴリフィルター・検索対応
- **投稿作成** … ログイン後「投稿する」から写真・タイトル・カテゴリ・アイテム紐付けまで3ステップ
- **投稿詳細** … 写真ギャラリー + アイテム一覧。各アイテムの「購入ページ」から外部サイトへ
- **いいね / 保存** … 気になる投稿にいいね・ブックマーク
- **SNSシェア** … X (Twitter)・LINE・リンクコピー
- **カテゴリ** … リビング、寝室、キッチンなど9カテゴリ
- **認証** … Google アカウントでログイン (OAuth)

## セットアップ

```bash
npm install
cp .env.example .env   # 編集: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm run db:push         # 初回のみ
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. OAuth 同意画面を設定
3. OAuth クライアント ID を作成（リダイレクト URI: `http://localhost:3000/api/auth/callback/google`）
4. `.env` に `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を設定

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
- Tailwind CSS (コンクリート × ウォームグレー)
- react-dropzone / react-image-gallery
- Cloudinary (オプション: 画像ストレージ)

## 本番デプロイ

- **DB**: Vercel Postgres や Neon に切り替え
- **画像**: Cloudinary 推奨 (`.env` に `CLOUDINARY_*` を設定)
- **NEXTAUTH_URL**: 本番 URL を設定
- **Google OAuth**: 本番ドメインをリダイレクト URI に追加
