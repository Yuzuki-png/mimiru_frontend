# Mimiru エラーハンドリングシステム

## 概要
統一されたエラーハンドリングとトースト通知システムを実装しました。

## コンポーネント構成

### 1. トースト通知システム
- **Toast.tsx**: 個別トースト表示コンポーネント
- **ToastContainer.tsx**: 複数トースト管理コンテナ
- **ToastContext.tsx**: アプリ全体でのトースト状態管理
- **useToast.ts**: トースト操作のカスタムフック

### 2. エラーハンドリング
- **ErrorHandler.ts**: 統一されたエラーハンドリングクラス
- **AppError型**: 構造化されたエラー情報

## 使用方法

### ToastProvider設定
```tsx
// app/layout.tsx
import { ToastProvider } from '@/contexts/ToastContext';

export default function RootLayout({ children }) {
  return (
    <ToastProvider position="top-right">
      {children}
    </ToastProvider>
  );
}
```

### コンポーネントでの使用
```tsx
import { useToastContext } from '@/contexts/ToastContext';
import { ErrorHandler } from '@/lib/errorHandler';

const MyComponent = () => {
  const { showSuccess, showError } = useToastContext();

  const handleAsync = async () => {
    await ErrorHandler.handleAsyncOperation(
      () => someAsyncFunction(),
      {
        onError: (error) => showError('操作失敗', error.userMessage),
      }
    );
    showSuccess('成功', '操作が完了しました');
  };
};
```

## 機能

### トースト種類
- **success**: 成功メッセージ (緑色)
- **error**: エラーメッセージ (赤色)
- **warning**: 警告メッセージ (黄色)
- **info**: 情報メッセージ (青色)

### 表示位置
- top-right, top-left, top-center
- bottom-right, bottom-left, bottom-center

### ErrorHandler機能
- 統一されたエラーログ出力
- リトライ機能付き非同期操作
- フォールバック値対応
- ユーザーフレンドリーなエラーメッセージ

## AudioContentCardでの実装例
- いいね処理のエラーハンドリング
- 共有機能の成功・エラー通知
- console.errorを統一されたシステムで置き換え

## 利点
- 一貫したエラー表示
- ユーザー体験の向上
- デバッグ効率の改善
- 保守性の向上