# tokutoku

気になった Web 記事を URL だけ流し込み、あとで整理するストックアプリ（MVP）。

## 技術スタック

- Next.js (App Router) / TypeScript / Tailwind CSS
- Supabase (Postgres)
- 外部 URL の取得は `POST /api/ogp` のみ（クライアントは直接 fetch しない）
- `https://` が無い URL は `https://` を付与して正規化する（貼り付け用）

## セットアップ

1. 依存関係をインストールする。

   ```bash
   npm install
   ```

2. Supabase でプロジェクトを作成し、[supabase/migrations/20260328000000_init.sql](supabase/migrations/20260328000000_init.sql) を SQL エディタで実行する（`articles` テーブル。RLS なし）。

3. `.env.local` を用意する。

   ```bash
   cp .env.local.example .env.local
   ```

   `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定する。

4. 開発サーバーを起動する。

   ```bash
   npm run dev
   ```

5. ブラウザで `http://localhost:3000` を開く。

## 本 MVP の前提

- 認証なし・単一ユーザー想定
- `user_id` なし、RLS なし、`middleware` / ログイン画面なし
- 記事保存時にサーバーで OGP を再取得しない（プレビュー結果をそのまま POST）
- フィルタはクライアント側

## スクリプト

- `npm run dev` — 開発
- `npm run build` — 本番ビルド
- `npm run start` — 本番起動
- `npm run lint` — ESLint

## Vercel

環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定してデプロイする。
