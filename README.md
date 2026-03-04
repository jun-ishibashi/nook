# Interior App

インテリア画像の投稿・閲覧ができる Web アプリケーションです。Laravel（PHP）と React（Inertia.js）で構築されています。

## 技術スタック

| 分類 | 技術 |
|------|------|
| バックエンド | Laravel 11, PHP 8.2+ |
| フロントエンド | React 18, Inertia.js 1.x |
| スタイル | Tailwind CSS, DaisyUI |
| ビルド | Vite 5 |
| 認証 | Laravel Breeze |

## 主な機能

- **投稿一覧** … サムネイル付きの投稿グリッド表示
- **投稿作成** … タイトルと複数画像のアップロード（モーダルから作成）
- **投稿詳細** … 画像ギャラリーとタイトルの表示
- **認証** … 登録・ログイン・パスワードリセット・メール認証（Laravel Breeze）

---

## 必要環境

- **PHP** 8.2 以上
- **Composer** 2.x
- **Node.js** 18 以上（推奨: 20 LTS）
- **npm** または **yarn**
- **MySQL** 8.0 または **MariaDB** 10.3+（または SQLite で簡易開発）

---

## ローカル開発手順

### 1. リポジトリのクローンとディレクトリ移動

```bash
git clone <リポジトリURL>
cd interior-app0320
```

### 2. 環境変数の設定

```bash
cp .env.example .env
php artisan key:generate
```

`.env` を編集し、少なくとも以下を設定します。

- `APP_NAME` … アプリ名（任意）
- `APP_URL` … 開発時の URL（例: `http://localhost:8000`）
- `DB_*` … 使用するデータベースの接続情報

**SQLite で手軽に試す場合:**

```env
DB_CONNECTION=sqlite
# DB_HOST, DB_DATABASE 等はコメントアウトまたは削除可
```

その後、SQLite の DB ファイルを作成します。

```bash
touch database/database.sqlite
```

### 3. PHP 依存関係のインストール

```bash
composer install
```

### 4. データベースの準備

```bash
php artisan migrate
```

必要に応じてシーダーでテストデータを投入します。

```bash
php artisan db:seed
```

### 5. ストレージリンクの作成（画像表示用）

アップロード画像を `public/storage` から参照するためにシンボリックリンクを作成します。

```bash
php artisan storage:link
```

### 6. フロントエンドのセットアップ

```bash
npm install
npm run build
```

開発中はビルドではなく Vite の開発サーバを使う場合は、次の「7. 開発サーバの起動」で `npm run dev` を実行します。

### 7. 開発サーバの起動

**ターミナル 1: Laravel**

```bash
php artisan serve
```

`http://localhost:8000` でアプリにアクセスできます。

**ターミナル 2: Vite（フロントのホットリロード用）**

```bash
npm run dev
```

Vite が有効な間は、JS/CSS の変更が自動でブラウザに反映されます。  
本番ビルドのみでよい場合は `npm run dev` は不要で、`npm run build` 済みなら `php artisan serve` だけで動作します。

### 8. 動作確認

- ブラウザで `http://localhost:8000` を開く
- 投稿一覧が表示され、ナビバーから「post」で投稿作成モーダルを開けることを確認

---

## よく使うコマンド

| 用途 | コマンド |
|------|----------|
| フロント開発サーバ（HMR） | `npm run dev` |
| フロント本番ビルド | `npm run build` |
| Laravel 開発サーバ | `php artisan serve` |
| マイグレーション実行 | `php artisan migrate` |
| マイグレーションロールバック | `php artisan migrate:rollback` |
| キャッシュクリア | `php artisan config:clear && php artisan cache:clear` |

---

## Docker（Laravel Sail）で開発する場合

PHP や Node をローカルに入れたくない場合は、Docker と Laravel Sail が利用できます。

**前提:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) など、Docker が利用できること。

```bash
# 初回: Sail のインストール（composer が使える場合）
composer require laravel/sail --dev
php artisan sail:install
# 対話で「mysql」などを選択

# コンテナの起動
./vendor/bin/sail up -d

# コンテナ内でマイグレーション・ストレージリンク
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan storage:link

# コンテナ内で npm
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
# 開発時は ./vendor/bin/sail npm run dev を別ターミナルで
```

`docker-compose.yml` のポートに従い、ブラウザでアプリにアクセスします（例: `http://localhost`）。

> 注意: 既存の `docker-compose.yml` は Sail 用です。PHP 8.2 以上を使う場合は、Sail の再インストールまたは `docker-compose.yml` の PHP イメージを 8.2 以上に変更してください。

---

## ドキュメント

- [アップグレードメモ](docs/UPGRADE_NOTES.md) … 実施した Vite / Inertia / React / Laravel の更新内容
- [技術スタック評価](docs/TECH_STACK_EVALUATION.md) … 技術選定の理由と推奨事項
- [ホスティング・デプロイ](docs/HOSTING.md) … 本番環境の候補とデプロイの考慮点

---

## ライセンス

[MIT License](https://opensource.org/licenses/MIT)
