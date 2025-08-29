# コードスタイルと規約

## 命名規則

### ファイル・コンポーネント名
- **コンポーネント**: PascalCase (例: `UserProfile.tsx`)
- **ページファイル**: kebab-case (例: `user-profile/page.tsx`)
- **ユーティリティ**: camelCase (例: `apiClient.ts`)

### 変数・関数名
- **変数**: camelCase (例: `userName`, `isLoading`)
- **定数**: UPPER_SNAKE_CASE (例: `API_BASE_URL`)
- **コンポーネントProps**: PascalCase interface (例: `UserProfileProps`)

### TypeScript型定義
- **Interface**: PascalCase (例: `AudioContent`, `UserProfile`)
- **Type**: PascalCase (例: `AuthState`, `ApiResponse`)
- **Enum**: PascalCase (例: `ContentStatus`)

## コードスタイル

### React/Next.js規約
- 関数コンポーネントのみ使用
- TypeScriptを厳密モードで使用
- App Routerパターンに従う
- Server ComponentsとClient Componentsを適切に分離

### インポート順序
1. React/Next.js関連
2. 外部ライブラリ
3. 内部コンポーネント/ユーティリティ
4. 型定義

```typescript
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/outline';

import { UserProfile } from '../components/UserProfile';
import { api } from '../lib/api';
import { User } from '../types/User';
```

### CSS/スタイリング
- Tailwind CSSを主要なスタイリング手法として使用
- コンポーネント固有のスタイルは可能な限りTailwindで
- ダーク/ライトモード対応必須
- レスポンシブデザイン対応

### エラーハンドリング
- try-catch文を適切に使用
- ユーザーフレンドリーなエラーメッセージ
- 認証エラー時の自動リダイレクト実装

## 言語規約

### 日本語使用箇所
- UIテキスト（ボタン、ラベル、メッセージ等）
- コメント（複雑なロジックの説明）
- エラーメッセージ
- git commitメッセージ

### 英語使用箇所
- 変数名、関数名、ファイル名
- API エンドポイント
- 型定義名
- ライブラリ・外部依存関係関連

## 品質基準

### 必須チェック項目
- ESLintエラー: 0件
- TypeScriptエラー: 0件
- テスト通過率: 100%
- ビルド成功

### 推奨事項
- 単一責任原則に従ったコンポーネント設計
- 再利用可能なフックの作成
- パフォーマンスを考慮したメモ化
- アクセシビリティ対応