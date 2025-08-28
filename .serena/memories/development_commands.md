# 開発コマンド一覧

## 基本コマンド

### 開発サーバー
```bash
npm run dev
```
- Next.js開発サーバーをTurbopackで起動（ポート4000）
- ホットリロード対応

### ビルド
```bash
npm run build
```
- プロダクションビルドを実行
- TypeScriptコンパイル、最適化を含む

### 本番サーバー
```bash
npm start
```
- ビルド後のアプリケーションを起動

## 品質管理コマンド

### リンティング
```bash
npm run lint
```
- ESLintによるコード品質チェック
- Next.js推奨設定を使用

### TypeScriptチェック
```bash
npx tsc --noEmit
```
- 型チェックのみ実行（ビルドなし）
- CI/CDで重要

### テスト
```bash
npm test                # 単発実行
npm run test:watch      # 監視モード
npm run test:ui         # UI付きテスト実行
```
- Vitestによる高速テスト実行
- 41個のAPIテストを含む

## 依存関係管理
```bash
npm install             # パッケージインストール
npm audit               # セキュリティ脆弱性チェック
npm audit fix           # 自動修復
```

## Git関連
```bash
git status              # 変更状況確認
git add .               # 全変更をステージング
git commit -m "message" # コミット
git push                # プッシュ
```

## 開発完了時の必須チェックリスト
1. `npm run lint` - リンティングエラー0件
2. `npx tsc --noEmit` - TypeScriptエラー0件  
3. `npm test` - 全テスト成功
4. `npm run build` - ビルド成功