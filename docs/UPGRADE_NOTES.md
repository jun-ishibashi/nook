# アップグレード実施メモ

## 実施した更新（2025年3月）

### 1. フロントエンド（完了）

- **Laravel Mix → Vite**
  - `vite.config.js` を追加（Laravel Vite プラグイン + React プラグイン）
  - `package.json`: スクリプトを `vite` / `vite build` に変更
  - `resources/views/app.blade.php`: `mix()` を `@vite()` に変更
  - `webpack.mix.js` は削除推奨（Vite に移行済みのため不要）

- **Inertia.js 0.11 → 1.x**
  - パッケージ: `@inertiajs/inertia` / `@inertiajs/inertia-react` を削除し、`@inertiajs/react` に統一
  - エントリ: `resources/js/app.js` を `app.jsx` に変更（React 18 + createRoot）
  - 全ページ・コンポーネントの import を `@inertiajs/react` に変更
  - InertiaProgress は v1 で内蔵のため削除

- **React 17 → 18**
  - `createRoot` でマウントする形に変更

- **その他**
  - `bootstrap.js`: CommonJS の `require` を ESM の `import` に変更
  - `postcss.config.js`: ESM 形式で追加
  - CSS: `react-step-progress` の import を削除（未使用のため）

### 2. バックエンド（要実行）

`composer.json` は Laravel 11 対応に更新済みです。**PHP 8.2 以上**の環境で、次を実行してください。

```bash
composer update
```

更新後の主なバージョン:

- PHP: ^8.2
- laravel/framework: ^11.0
- inertiajs/inertia-laravel: ^1.0
- laravel/sanctum: ^4.0
- laravel/breeze: ^2.0
- nunomaduro/collision: ^8.1
- phpunit/phpunit: ^11.0

**Laravel 11 で必要な作業（初回のみ）:**

```bash
# Sanctum のマイグレーションを公開（API 認証を使う場合）
php artisan vendor:publish --tag=sanctum-migrations
```

**Kernel の変更:**

- `app/Http/Kernel.php`: `$routeMiddleware` を `$middlewareAliases` に変更（Laravel 11 対応）

### 3. 開発・ビルドコマンド

| 用途     | コマンド        |
|----------|-----------------|
| 開発サーバ | `npm run dev`   |
| 本番ビルド | `npm run build`  |
| プレビュー | `npm run preview` |

開発時は `npm run dev` で Vite の dev サーバを起動し、別ターミナルで `php artisan serve` を実行してください。

### 4. 注意事項

- **Ziggy**: フロントは `ziggy-js` 1.x、Laravel は `tightenco/ziggy` 1.x のままにしてあり、`@routes` と連携する構成です。
- **Laravel Breeze 2**: 認証の Blade/Inertia の見た目やオプションが変わっている可能性があります。問題があれば Breeze のドキュメントを参照してください。
- **PHP 8.1 以下の環境**: Laravel 11 は PHP 8.2 必須のため、PHP を 8.2 以上に上げるか、`composer.json` で `laravel/framework` を `^10.0` に戻して PHP 8.1 で運用する必要があります。
