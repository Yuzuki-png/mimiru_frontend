# CLAUDE.md

必ず日本語で回答してください。

このファイルは、このリポジトリでコードを扱う際にClaude Code (claude.ai/code) に対してガイダンスを提供します。

## 開発コマンド

- **開発サーバー**: `npm run dev` (Next.js Turbopackを使用)
- **ビルド**: `npm run build`
- **本番サーバー**: `npm start`
- **リンティング**: `npm run lint`

## アーキテクチャ概要

これは「Mimiru」のNext.js 15フロントエンドアプリケーションです - ユーザーが教育用音声コンテンツをアップロードし、消費できる音声学習プラットフォームです。

### 主要なアーキテクチャコンポーネント

**App Routerの構造**: Next.js 13+ App Routerを使用し、以下の主要ルートがあります：
- `/` - ランディングページ
- `/login` & `/signup` - 認証ページ
- `/dashboard/*` - 保護されたダッシュボードエリア（analytics, discover, library, liked, profile, settings, upload）

**認証システム**: 
- `AuthContext` (src/contexts/AuthContext.tsx)を使用したJWTベースの認証
- `ProtectedRoute`コンポーネントによる保護されたルートの処理
- localStorageに永続化される認証状態
- axios経由でのバックエンドAPI通信 (src/lib/api.ts)

**レイアウトシステム**:
- 現在のルートに基づくヘッダー/フッターの条件付きレンダリング
- `ConditionalHeader`, `ConditionalFooter`, `ConditionalMain`コンポーネントがレイアウトロジックを処理
- src/app/layout.tsxのメインレイアウトがAuthProviderとThemeProviderでアプリ全体をラップ

**テーマシステム**:
- next-themesによるダーク/ライトモードサポート
- ThemeProviderコンポーネントがテーマ状態を管理
- テーマ切り替え用に設定されたTailwind CSS

**コンポーネントアーキテクチャ**:
- src/components/内の再利用可能なUIコンポーネント
- src/components/animations/内のFramer MotionとGSAPを使用したアニメーションコンポーネント
- 認証用のフォームコンポーネント（LoginForm, RegisterForm）
- オーバーレイインタラクション用のModalコンポーネント

**命名規則について**
- クラス・インターフェース、ファイル名: パスカルケース（例: `UserService`）


### 設定

- src/lib/config.tsで設定されたAPIベースURL（デフォルト: http://localhost:3003）
- バックエンド通信はaccess_token形式のJWTトークンを期待
- 厳密モードが有効なTypeScript設定

### 開発メモ

- UIテキストとコメントに日本語を使用
- Node.js v20.0.0以上が必要
- 開発時はバックエンドAPIがポート3003で動作している必要がある
- 最適な開発体験のため.vscode/extensions.jsonで推奨されるVSCode拡張機能