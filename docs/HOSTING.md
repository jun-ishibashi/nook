# ホスティング・デプロイの検討

このドキュメントでは、Interior App（Laravel + Inertia + React）を本番環境に載せる際のホスティング候補と、デプロイ時の考慮点を整理します。

---

## アプリの構成と要件

- **バックエンド**: Laravel（PHP 8.2+）、MySQL/MariaDB または SQLite
- **フロント**: Vite でビルドした静的アセット（JS/CSS）を Laravel が配信
- **ストレージ**: 画像は `storage/app/public`（または S3 等）に保存、`php artisan storage:link` で公開
- **認証**: セッション（Cookie）ベース（Laravel Breeze）

このため、**PHP が動くサーバー**で Laravel を動かし、ビルド済みのフロントを同一オリジンで配信する形が基本です。

---

## ホスティング候補

### 1. VPS + Laravel Forge / Ploi（推奨の一つ）

| 項目 | 内容 |
|------|------|
| **向き** | 本番運用を安定して行いたい場合 |
| **例** | AWS EC2, DigitalOcean, Linode, ConoHa, さくらのVPS など + [Laravel Forge](https://forge.laravel.com/) または [Ploi](https://ploi.io/) |
| **メリット** | PHP/Node のバージョン、Nginx、SSL、デプロイ、キュー/スケジューラまで一括管理しやすい |
| **注意** | VPS と Forge/Ploi の月額がかかる。サーバー知識が多少必要 |

**デプロイの流れ（イメージ）**

1. Forge/Ploi でサーバーとサイトを登録
2. GitHub/GitLab と連携し、プッシュでデプロイ
3. デプロイスクリプトで `composer install --no-dev`, `npm ci && npm run build`, `php artisan migrate --force`, `php artisan storage:link` などを実行

---

### 2. 共有ホスティング（PHP 対応）

| 項目 | 内容 |
|------|------|
| **向き** | コストを抑えたい、小規模・個人運用 |
| **例** | エックスサーバー, さくらインターネット, ロリポップ など |
| **メリット** | 安価で、PHP と MySQL が使えることが多い |
| **注意** | PHP 8.2 以上対応か要確認。Node が使えない場合、**ローカルや CI で `npm run build` してから**ビルド済みファイルをアップロードする必要がある。`storage:link` や書き込み権限の設定が必要。Artisan や Composer が使えない場合もある |

**運用のポイント**

- フロントは手元で `npm run build` し、`public/build` を FTP 等でアップロード
- または GitHub と連携できる場合は、CI でビルドしてからデプロイする方法を検討

---

### 3. PaaS 系（PHP + DB が使えるもの）

| サービス | 概要 | 備考 |
|----------|------|------|
| **Railway** | PHP 対応。MySQL/Postgres などアドオンで利用可能 | デプロイは GitHub 連携や Dockerfile で対応。環境変数で `APP_KEY` 等を設定 |
| **Render** | Web サービス + DB を提供 | PHP は「Docker で動かす」前提の説明が多く、Laravel のテンプレあり。MySQL は別サービス |
| **Heroku** | 従来は PHP 対応だったが、無料プラン廃止など方針変更あり | 有料で PHP アプリを動かすことは可能。要確認 |
| **Coolify** | セルフホスト型 PaaS | 自前の VPS に導入し、Git ベースでデプロイ。Laravel 向けの設定例あり |

Laravel は「1 つの Web プロセス + DB + ストレージ」が揃っている環境が扱いやすいです。

---

### 4. サーバーレス・Edge（Laravel 向けの制約）

| 項目 | 内容 |
|------|------|
| **Vercel / Netlify（フロントのみ）** | Laravel は PHP アプリのため、**バックエンドとしては利用できない**。Laravel を別ホストに置き、フロントだけ Vercel に出す構成は Inertia の「同一オリジンで HTML を返す」前提と合わないため、このアプリでは基本的に不向き |
| **Laravel Vapor（AWS Lambda）** | Laravel 公式のサーバーレス。PHP を Lambda で実行。スケールや運用の柔軟性は高いが、設定と AWS 知識が必要。有料 |

---

## デプロイ時に共通で行うこと

どの環境でも、以下は最低限そろえるとよいです。

1. **環境変数**
   - `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`（本番 URL）
   - `APP_KEY` を本番用に生成したものに
   - `DB_*`（本番 DB）
   - メール送信する場合は `MAIL_*`
   - 必要なら `AWS_*`（S3 で画像保存する場合）

2. **ビルド**
   - `composer install --no-dev --optimize-autoloader`
   - `npm ci && npm run build`（または CI でビルドして `public/build` をデプロイ）

3. **Laravel の整備**
   - `php artisan migrate --force`
   - `php artisan config:cache` / `route:cache` / `view:cache`
   - `php artisan storage:link`（画像をローカルストレージで公開する場合）

4. **ストレージ・権限**
   - `storage/` と `bootstrap/cache/` に書き込み権限
   - 画像を永続化する場合: `storage/app/public` の実体と `public/storage` のリンク、または S3 等の設定

5. **Web サーバー**
   - ドキュメントルートを `public/` に設定（`/` が `public` を指すようにする）

---

## ストレージ（画像）の選択

- **ローカル（`storage/app/public`）**: サーバー 1 台で完結。バックアップとディスク容量に注意。
- **S3（または S3 互換）**: スケールしやすく、複数サーバーや CDN と組み合わせやすい。`config/filesystems.php` の `public` を S3 に切り替え、`.env` で `AWS_*` を設定。

---

## まとめ

| 運用スタイル | 候補 |
|--------------|------|
| 安定運用・チーム開発 | **VPS + Laravel Forge / Ploi** |
| 低コスト・個人 | **共有ホスティング**（PHP 8.2 対応、ビルドは手元 or CI） |
| Git ベースで手軽に | **Railway / Render** などの PaaS（PHP + DB が使えるもの） |
| スケール・サーバーレス | **Laravel Vapor** または **VPS + ロードバランサ** |

まずは **VPS + Forge/Ploi** か **共有ホスティング（ビルド済みアセットをアップロード）** のどちらかで始め、必要に応じて DB やストレージを分離・拡張する形が現実的です。
