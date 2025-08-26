# Mimiru開発ガイドライン

## 重要な開発原則
- **言語**: 必ず日本語で回答・コメント・UI文言を記述
- **型安全性**: TypeScript厳密モードを維持
- **コード品質**: 開発終了時は必ずリントチェック実行
- **ファイル作成**: 必要最小限のファイル作成、既存ファイル編集を優先
- **ドキュメント**: 明示的な要求がない限りmdファイルやREADMEは作成しない

## 命名規則
- **クラス・インターフェース、ファイル名**: パスカルケース（例: `UserService`）
- **変数・関数**: キャメルケース
- **定数**: UPPER_SNAKE_CASE

## 開発環境要件
- Node.js v20.0.0以上
- バックエンドAPIはポート4003で動作
- 推奨VSCode拡張機能: .vscode/extensions.jsonに記載

## API通信パターン
- axiosインターセプターによる自動トークン注入
- 401エラー時の自動トークン削除
- エラーハンドリングとメッセージのローカライゼーション
- multipart/form-dataサポート（音声アップロード用）

## レイアウトシステム
- 現在のルートに基づくヘッダー/フッターの条件付きレンダリング
- `ConditionalHeader`, `ConditionalFooter`, `ConditionalMain`コンポーネント
- メインレイアウトがAuthProviderとThemeProviderでアプリ全体をラップ

## テーマシステム
- next-themesによるダーク/ライトモードサポート
- ThemeProviderコンポーネントがテーマ状態を管理
- Tailwind CSSでテーマ切り替え対応