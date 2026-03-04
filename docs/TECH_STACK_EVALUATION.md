# 技術スタック評価と提案

このドキュメントは、インテリア投稿アプリの機能を実現するために、現在の技術スタックが適切かどうかを評価し、必要に応じて変更案を提示するものです。

---

## 1. 結論サマリ

| 観点 | 判定 | 対応 |
|------|------|------|
| **アーキテクチャ（Laravel + Inertia + React）** | ✅ 適切 | 変更不要 |
| **React の採用** | ✅ 適切 | バージョンアップを推奨 |
| **ビルドツール（Laravel Mix）** | ⚠️ 非推奨 | **Vite への移行を強く推奨** |
| **Inertia.js のバージョン** | ⚠️ 古い | **v1.x へのアップグレードを推奨** |
| **その他フロント（Tailwind / DaisyUI / 画像ライブラリ）** | ✅ 適切 | 変更不要 |

**総合**: 技術選定そのものは適切です。**React をやめる必要はありません。** 主な改善点は「古いバージョン・非推奨ツールの更新」です。

---

## 2. アーキテクチャの適合性

### Laravel + Inertia.js + React の組み合わせ

- **役割**
  - 投稿の CRUD、認証、ファイル保存は Laravel で自然に実装できる
  - モーダル・複数画像アップロード・ギャラリーなどは React で扱いやすい
  - Inertia により「API を別途用意しない SPA 風 UX」を実現できている

- **結論**: このアプリの規模・機能に対して **Laravel + Inertia + React は適切** です。  
  Vue や Next.js に乗り換える必然性はありません。

### React を採用し続けてよい理由

- モーダル・ステップフォーム・画像プレビューなど、**コンポーネントとローカル state が中心**の UI である
- 複雑なグローバル状態はほぼ不要で、**React の標準機能で足りる**
- 使用中の `react-dropzone` / `react-image-gallery` は React 前提で、そのまま活用できる
- チームがすでに React で書いているなら、**継続がコスト最小**で合理的

---

## 3. 問題点と推奨対応

### 3.1 ビルドツール: Laravel Mix → Vite（強く推奨）

| 項目 | 現状 | 推奨 |
|------|------|------|
| ツール | Laravel Mix 6（Webpack ベース） | **Vite** |
| 理由 | 新規プロジェクトのデフォルトは Vite。Mix はメンテナンスモード | 開発サーバ・ビルドが速く、Laravel 公式が推奨 |

**メリット**

- 開発時の HMR が速く、体験が良い
- 本番ビルドも高速
- Laravel 11 では Vite が標準であり、Breeze 等も Vite 前提
- 将来の Laravel アップデートと相性が良い

**移行の規模**

- `vite.config.js` の追加、`package.json` の scripts 変更
- Blade の `mix()` を `@vite()` に変更
- `require()` を ESM の `import` に寄せる（Vite は ESM 前提）

---

### 3.2 Inertia.js: 0.11 → 1.x（推奨）

| 項目 | 現状 | 推奨 |
|------|------|------|
| クライアント | `@inertiajs/inertia` + `@inertiajs/inertia-react` 0.11 | **@inertiajs/react** 1.x |
| サーバー | `inertiajs/inertia-laravel` 0.5 | **inertiajs/inertia-laravel** 1.x |

**主な変更点**

- パッケージ統合: `@inertiajs/react` 1 本に（progress は内蔵）
- インポート元を `@inertiajs/react` に統一（`Link`, `useForm`, `Head`, `createInertiaApp` など）
- `InertiaProgress.init()` は不要（v1 で標準対応）
- `useForm` の `post` 等の API は v1 でもほぼそのまま利用可能

**影響ファイル例**

- `resources/js/app.js`（createInertiaApp、Progress 削除）
- `resources/js/Pages/**/*.jsx`（useForm, Link, Head の import 先）
- `resources/js/Components/**/*.js`（Link の import 先）
- `resources/js/Layouts/**/*.js`（Link の import 先）

---

### 3.3 React: 17 → 18（推奨）

| 項目 | 現状 | 推奨 |
|------|------|------|
| バージョン | React 17 | **React 18** |

**理由**

- React 18 が現行のメジャー版で、セキュリティ・バグ修正の対象
- 既存の書き方を大きく変えずにアップグレード可能
- Inertia + Vite との組み合わせでも問題なく動作

**注意**

- React 18 では `createRoot` を使うが、**Inertia の `createInertiaApp` が内部でルートを扱う**ため、多くの場合は `package.json` のバージョン上げと依存解決だけで足りる

---

### 3.4 その他（任意）

- **Laravel 9 → 10 / 11**  
  - Vite 標準や PHP バージョンなど、長期的なサポートのためには移行を検討してよい
- **TypeScript の導入**  
  - 型でバグを減らしたい場合に有効。必須ではないが、新規コンポーネントから `.tsx` にしていく選択肢はある
- **Tailwind CSS / DaisyUI / react-dropzone / react-image-gallery**  
  - いずれも現状の用途に合っており、**スタックの入れ替えは不要**

---

## 4. 推奨アクションの優先度

| 優先度 | 対応内容 | 主な効果 |
|--------|----------|----------|
| 高 | **Laravel Mix → Vite** | 開発体験の向上、公式方針との一致 |
| 高 | **Inertia 0.11 → 1.x** | サポート・ドキュメント・将来バージョンとの整合 |
| 中 | **React 17 → 18** | セキュリティ・安定性の確保 |
| 低 | Laravel 10/11 へのアップグレード | 長期サポート・新機能 |
| 低 | TypeScript の段階的導入 | 保守性向上（任意） |

---

## 5. 「変更しない」判断でよいもの

- **Laravel（PHP）** … 認証・CRUD・ファイル保存に最適
- **React** … コンポーネント UI に適しており、Vue 等への乗り換えは不要
- **Inertia.js（方式）** … フル SPA や別 API サーバーを用意するよりシンプル
- **Tailwind CSS + DaisyUI** … 見た目と開発速度のバランスが良い
- **react-dropzone / react-image-gallery** … 要件に合った選択

---

## 6. まとめ

- **「この機能を実現するために現在の技術スタックが適切か」**  
  → **はい。Laravel + Inertia + React の構成は適切です。React を外す必要はありません。**

- **「適切でない部分」**  
  → **「古い・非推奨になりつつあるバージョンとツール」** が適切でない部分です。  
  - ビルド: **Laravel Mix → Vite**  
  - フロント基盤: **Inertia 1.x + React 18** への更新を推奨します。

上記の順（Vite → Inertia 1.x → React 18）で進めると、既存の「機能」を変えずに、保守性と開発体験を改善できます。

---

## 7. 実施したアップグレード（2025年3月）

以下の更新を実施済みです。詳細は `docs/UPGRADE_NOTES.md` を参照してください。

- **Vite 導入**: Laravel Mix を廃止し、Vite 5 + laravel-vite-plugin に移行
- **Inertia 1.x**: `@inertiajs/react` に統一、エントリを `app.jsx` に変更
- **React 18**: `createRoot` でマウントする形に変更
- **composer.json**: Laravel 11 / PHP 8.2 / Sanctum 4 / Breeze 2 等に更新（要 `composer update`）
- **Kernel**: `$routeMiddleware` を `$middlewareAliases` に変更（Laravel 11 対応）
