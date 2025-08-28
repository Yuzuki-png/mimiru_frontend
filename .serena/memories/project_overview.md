# Mimiru Frontend プロジェクト概要

## プロジェクトの目的

Mimiruは教育用音声コンテンツの学習プラットフォームです。ユーザーが音声コンテンツをアップロード・消費・共有できる音声学習プラットフォームのフロントエンドアプリケーションです。

## 主な機能

### 認証・ユーザー管理
- ユーザー登録・ログイン
- JWTベースの認証システム
- プロフィール管理（アバター、自己紹介等）
- パスワード変更、アカウント削除

### 音声コンテンツ管理
- 音声ファイルのアップロード（MP3, WAV, M4A等対応）
- 音声コンテンツの検索・フィルタリング
- カテゴリ分類（ビジネス、教育、エンターテイメント等）
- いいね機能・再生統計

### プレイリスト機能
- プレイリスト作成・管理
- 音声コンテンツの追加・削除・並び替え
- 公開・非公開設定

### 音声再生
- WebAudio APIを使用した高度な再生制御
- シーク、音量調整、再生速度変更
- プレイリスト連続再生

### ソーシャル機能
- ユーザーフォロー・フォロワー
- 通知システム（WebSocket使用）
- コンテンツ共有・おすすめ機能

## アーキテクチャ

### フロントエンド技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: React 19, Tailwind CSS
- **状態管理**: SWR (データフェッチ), React Context
- **アニメーション**: Framer Motion, GSAP
- **テーマ**: next-themes (ダーク/ライトモード)
- **HTTP通信**: Axios
- **リアルタイム通信**: Socket.io
- **テスト**: Vitest, Testing Library

### ディレクトリ構造
```
src/
├── app/                 # Next.js App Router ページ
│   ├── dashboard/       # 認証が必要なページ群
│   ├── auth/           # 認証関連ページ
│   └── api/            # API Routes
├── components/         # 再利用可能なUIコンポーネント
│   ├── ui/             # 基本UIコンポーネント
│   ├── features/       # 機能特化コンポーネント
│   └── animations/     # アニメーションコンポーネント
├── contexts/           # React Context (状態管理)
├── hooks/              # カスタムフック
│   └── api/            # SWR APIフック
├── lib/                # ユーティリティ・設定
├── types/              # TypeScript型定義
└── test/               # テストファイル
    └── api/            # APIテスト
```

### バックエンド連携
- **API Base URL**: http://localhost:4003 (開発環境)
- **認証**: JWT Bearer Token
- **データ形式**: JSON
- **WebSocket**: リアルタイム通知用