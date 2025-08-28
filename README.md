# mimiru_frontend

音声学習プラットフォームのフロントエンドアプリケーションです。Next.jsで構築されています。

## セットアップ

### 前提条件

- Visual Studio Code (VSCode) がインストールされていること
- node.js v20.0.0 以上がインストールされていること

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Visual Studio Codeの拡張機能設定

以下の手順で `.vscode/extensions.json` に記載された拡張機能をインストールする。

1. VSCodeを起動する
2. `Cmd + Shift + P` を押下し、コマンドパレットを表示する
3. 検索バーに "recommended" と入力する
4. "Show Recommended Extensions" をクリックする
5. "WORKSPACE RECOMMENDATIONS" に記載されている拡張機能をインストールする

### 3. アプリの起動

```bash
npm run dev
```

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript React
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion, GSAP
- **アイコン**: Heroicons
- **テーマ**: next-themes (ダーク/ライトモード)
- **HTTP クライアント**: Axios
- **データフェッチング**: SWR
- **テスト**: Vitest, Testing Library
- **リアルタイム通信**: Socket.io

## 開発コマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 (Turbopack) |
| `npm run build` | プロダクションビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLintによるコード品質チェック |
| `npm test` | テスト実行 |
| `npm run test:watch` | テスト監視モード |

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # 認証が必要なページ群
│   ├── auth/              # 認証ページ
│   └── api/               # API Routes
├── components/            # 再利用可能UIコンポーネント
├── contexts/              # React Context
├── hooks/                 # カスタムフック
│   └── api/               # SWR APIフック
├── lib/                   # ユーティリティ
├── types/                 # TypeScript型定義
└── test/                  # テストファイル
```


## テスト

包括的なテストスイートで品質を保証：

- **41個のテスト** がすべて成功
- **6つのAPIモジュール** を完全カバー
- **認証、CRUD、リアルタイム機能** をテスト