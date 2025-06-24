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