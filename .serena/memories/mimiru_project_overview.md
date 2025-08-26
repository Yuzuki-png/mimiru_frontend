# Mimiruプロジェクト概要

## プロジェクト説明
Mimiruは教育用音声コンテンツをアップロード・消費できる音声学習プラットフォームのNext.js 15フロントエンドアプリケーションです。

## 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion, GSAP
- **状態管理**: React Context API
- **認証**: JWT + Google OAuth
- **API通信**: Axios

## 主要機能
- JWTベースの認証システム（Google OAuth対応）
- 音声コンテンツのアップロード・再生
- プレイリスト管理
- いいね・フォロー機能
- リアルタイム通知
- レスポンシブデザイン
- ダーク/ライトモードテーマ

## 開発コマンド
- 開発サーバー: `npm run dev`
- ビルド: `npm run build`
- リンティング: `npm run lint`

## 重要な設定
- APIベースURL: http://localhost:4003
- 認証トークンはlocalStorageに保存
- 厳密モードが有効なTypeScript設定
- 日本語UIとコメント使用