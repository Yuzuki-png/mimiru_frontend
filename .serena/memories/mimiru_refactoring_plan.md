# Mimiruフロントエンド包括的リファクタリング分析

## 1. **コードの重複**

### 現在の課題
- **AudioContent型定義の重複**: 複数のページファイルで同じインターフェースが重複定義されている
  - `src/app/content/[id]/page.tsx`
  - `src/app/dashboard/discover/page.tsx` 
  - `src/app/dashboard/library/page.tsx`
  - `src/app/dashboard/liked/page.tsx`
  - `src/app/dashboard/library/playlist/[id]/page.tsx`
- **localStorageアクセスの散在**: 認証トークン管理が複数箇所で重複実装
- **エラーハンドリングパターンの重複**: try-catch文とエラー処理ロジックが類似実装
- **Playlistインターフェースの重複**: プレイリスト関連の型定義が複数箇所で定義

### 提案する解決策
1. **共通型定義の統合**
   ```typescript
   // src/types/index.ts (新規作成)
   export * from './AudioContent';
   export * from './User';
   export * from './Playlist';
   export * from './Common';
   ```

2. **localStorage抽象化レイヤー**
   ```typescript
   // src/lib/storage.ts (新規作成)
   class StorageManager {
     static setToken(token: string) { /* 実装 */ }
     static getToken(): string | null { /* 実装 */ }
     static clearAuth() { /* 実装 */ }
   }
   ```

### 実装の優先度: **高**
### 期待される効果: 
- メンテナンス工数30%削減
- 型安全性の向上
- 一貫性のあるデータ型管理

### 実装時の注意点:
- 段階的移行でブレイクチェンジを避ける
- 既存のimport文を機械的に置換

## 2. **コンポーネント設計**

### 現在の課題
- **巨大なページコンポーネント**: DiscoverPage(440行)、LibraryPage(380行)など単一責任原則違反
- **PropsDrilling**: Context経由での状態管理だが、中間コンポーネントでの無関係な依存
- **コンポーネント再利用性の低さ**: AudioContentCard、PlaylistCardなどの汎用コンポーネント不足

### 提案する解決策
1. **原子的コンポーネント設計**
   ```
   src/components/
   ├── ui/           # 基本UIコンポーネント
   │   ├── Button/
   │   ├── Card/
   │   ├── Modal/
   │   └── Input/
   ├── features/     # 機能別コンポーネント
   │   ├── audio/
   │   ├── playlist/
   │   └── user/
   └── layout/       # レイアウトコンポーネント
   ```

2. **コンポーネント分離**
   - AudioContentCard: 音声コンテンツ表示の統一
   - PlaylistCard: プレイリスト表示の統一
   - UserProfile: ユーザー情報表示の統一

### 実装の優先度: **高**
### 期待される効果:
- 開発速度の向上
- テスタビリティの改善
- デザイン一貫性の確保

## 3. **状態管理**

### 現在の課題
- **Context過多**: 6つのContextProviderがネストしている
- **状態の非効率な更新**: `useState`と`useReducer`の混在
- **グローバル状態の濫用**: ローカルで管理すべき状態もContextで管理

### 提案する解決策
1. **Context統合**
   ```typescript
   // src/contexts/AppContext.tsx (新規)
   interface AppState {
     auth: AuthState;
     audioPlayer: AudioPlayerState;
     ui: UIState; // sidebar + notifications
   }
   ```

2. **状態管理戦略の統一**
   - すべてのContextで`useReducer`を使用
   - 非同期処理は専用のカスタムフックで管理
   - ローカル状態は`useState`を継続使用

### 実装の優先度: **中**
### 期待される効果:
- レンダリング最適化
- 状態同期バグの削減
- メモリ使用量の削減

### 実装時の注意点:
- 段階的移行で既存機能を保持
- パフォーマンス測定を実施

## 4. **型定義**

### 現在の課題
- **型定義の分散**: 各ページで個別に型定義
- **`unknown`型の多用**: FollowContextで戻り値が`unknown`
- **オプショナル型の不統一**: User型でname?とusername?が混在

### 提案する解決策
1. **厳密な型定義**
   ```typescript
   // src/types/api.ts
   export interface ApiResponse<T> {
     data: T;
     message?: string;
     errors?: Record<string, string[]>;
   }
   
   export interface PaginatedResponse<T> extends ApiResponse<T[]> {
     pagination: {
       page: number;
       limit: number;
       total: number;
       totalPages: number;
     };
   }
   ```

2. **APIレスポンス型の統一**
   - すべてのAPI関数でGenerics使用
   - エラー型の統一

### 実装の優先度: **中**
### 期待される効果:
- 実行時エラーの50%削減
- IDEサポートの向上
- 開発者体験の向上

## 5. **パフォーマンス**

### 現在の課題
- **不必要な再レンダリング**: Context変更時の全子コンポーネント再レンダリング
- **メモ化の不足**: `useCallback`、`useMemo`の適切な使用不足
- **バンドルサイズの非最適化**: 重いライブラリの全体インポート

### 提案する解決策
1. **メモ化戦略**
   ```typescript
   // コンテキスト値のメモ化例
   const contextValue = useMemo(() => ({
     state,
     actions: {
       playAudio: useCallback(playAudio, []),
       pauseAudio: useCallback(pauseAudio, []),
     }
   }), [state]);
   ```

2. **コード分割**
   ```typescript
   // 動的インポート
   const AudioUploadModal = lazy(() => import('./AudioUploadModal'));
   ```

### 実装の優先度: **中**
### 期待される効果:
- 初期ロード時間30%改善
- ユーザーインタラクションレスポンス向上

## 6. **ファイル構造**

### 現在の課題
- **深いネスト**: プレイリスト詳細ページの深いパス
- **機能散在**: 関連機能が異なるディレクトリに分散
- **命名の不統一**: Page、Context、Componentで命名規則が統一されていない

### 提案する解決策
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ルート群
│   ├── (dashboard)/       # ダッシュボード関連ルート群  
│   └── (public)/          # パブリックページ群
├── components/
│   ├── ui/               # 基本UIコンポーネント
│   ├── features/         # 機能別コンポーネント
│   └── layout/           # レイアウトコンポーネント
├── hooks/
│   ├── api/             # API関連フック
│   ├── auth/            # 認証関連フック
│   └── ui/              # UI関連フック
├── lib/
│   ├── api/             # API関連
│   ├── utils/           # ユーティリティ
│   └── constants/       # 定数
└── types/               # 型定義
    ├── api.ts
    ├── ui.ts
    └── domain.ts
```

### 実装の優先度: **低**
### 期待される効果:
- 新規開発者のオンボーディング時間短縮
- コード発見性の向上

## 7. **API層**

### 現在の課題
- **エラーハンドリングの不統一**: authApi、userApi、audioContentApiで異なる実装
- **型安全性の不足**: APIレスポンスの型チェック不足
- **リクエスト重複**: 同じデータを複数箇所で取得

### 提案する解決策
1. **API抽象化レイヤー**
   ```typescript
   // src/lib/api/base.ts
   class ApiClient {
     async get<T>(endpoint: string): Promise<ApiResponse<T>> {
       // 統一されたエラーハンドリング
     }
   }
   ```

2. **React Query導入検討**
   - キャッシュ機能
   - 自動再取得
   - 楽観的更新

### 実装の優先度: **高**
### 期待される効果:
- API通信の信頼性向上
- UX改善（ローディング・エラー状態）
- 開発効率の向上

## 8. **エラーハンドリング**

### 現在の課題
- **エラー表示の不統一**: モーダル、トースト、インラインエラーの混在
- **エラー境界の不足**: ページクラッシュ時の対処不備
- **ユーザーフレンドリーでないメッセージ**: 技術的エラーメッセージの直接表示

### 提案する解決策
1. **エラー境界コンポーネント**
   ```typescript
   // src/components/ErrorBoundary.tsx
   class ErrorBoundary extends React.Component {
     // エラー捕捉と表示の統一
   }
   ```

2. **エラー処理の標準化**
   ```typescript
   // src/lib/errors.ts
   export class AppError extends Error {
     constructor(
       message: string,
       public code: string,
       public userMessage: string
     ) { super(message); }
   }
   ```

### 実装の優先度: **高**
### 期待される効果:
- ユーザー体験の向上
- デバッグ効率の改善
- システム安定性の向上

## 9. **テスト可能性**

### 現在の課題
- **テストファイルの不足**: 現在2ファイルのみ
- **依存関係の結合**: Context依存でコンポーネントテストが困難
- **モック戦略の不備**: API依存のテストが不可能

### 提案する解決策
1. **テストユーティリティ**
   ```typescript
   // src/test/utils.tsx
   export const renderWithProviders = (
     ui: React.ReactElement,
     options?: { initialState?: Partial<AppState> }
   ) => {
     // Context付きのテストレンダリング
   };
   ```

2. **テスト戦略**
   - ユニットテスト: ピュア関数、カスタムフック
   - 統合テスト: ページコンポーネント
   - E2Eテスト: 主要ユーザーフロー

### 実装の優先度: **中**
### 期待される効果:
- コード品質の向上
- リグレッション防止
- リファクタリング安全性の確保

## 10. **アクセシビリティ**

### 現在の課題
- **aria-label不足**: ボタンコンポーネントで部分的実装のみ
- **キーボードナビゲーション**: フォーカス管理の不備
- **セマンティックHTML**: div中心の構造

### 提案する解決策
1. **a11yフック**
   ```typescript
   // src/hooks/useA11y.ts
   export const useA11y = () => {
     const announceToScreenReader = useCallback((message: string) => {
       // スクリーンリーダー対応
     }, []);
   };
   ```

2. **アクセシブルコンポーネント**
   - 適切なARIA属性
   - キーボード操作対応
   - フォーカス管理

### 実装の優先度: **低**
### 期待される効果:
- 法的コンプライアンスの確保
- ユーザーベースの拡大
- SEOの改善

---

## リファクタリング実装計画

### フェーズ1（優先度：高）- 4週間
1. 共通型定義の統合
2. API層の改善とエラーハンドリング統一
3. 基本UIコンポーネントの抽出

### フェーズ2（優先度：中）- 6週間
1. 状態管理の最適化
2. パフォーマンス改善
3. テストインフラの整備

### フェーズ3（優先度：低）- 4週間
1. ファイル構造の再編
2. アクセシビリティ改善
3. ドキュメント整備

**総予想工数**: 14週間  
**期待される総合効果**: 開発効率40%向上、バグ発生率50%削減、新規開発者オンボーディング時間60%短縮