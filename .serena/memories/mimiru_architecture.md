# Mimiruアーキテクチャ詳細

## ディレクトリ構造
```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes (認証のみ実装)
│   ├── auth/              # Google認証コールバック
│   ├── content/           # 個別コンテンツページ
│   ├── dashboard/         # 保護されたダッシュボードエリア
│   │   ├── discover/      # コンテンツ発見ページ
│   │   ├── library/       # ライブラリとプレイリスト
│   │   ├── liked/         # お気に入りコンテンツ
│   │   ├── notifications/ # 通知ページ
│   │   ├── profile/       # プロフィール設定
│   │   └── upload/        # 音声アップロード
│   ├── login/             # ログインページ
│   └── signup/            # サインアップページ
├── components/            # 再利用可能なコンポーネント
├── contexts/              # React Context プロバイダー
├── hooks/                 # カスタムフック
├── lib/                   # API通信とユーティリティ
└── types/                 # TypeScript型定義
```

## Context プロバイダー
- **AuthContext**: 認証状態管理
- **AudioPlayerContext**: グローバル音声再生管理
- **LikeContext**: いいね機能の状態管理
- **FollowContext**: フォロー機能の状態管理
- **NotificationContext**: 通知管理
- **SidebarContext**: サイドバーの開閉状態

## API構造
- **authApi**: 認証関連（login, register, getProfile）
- **userApi**: ユーザー管理（プロフィール、パスワード変更、フォロー機能）
- **audioContentApi**: 音声コンテンツ管理（CRUD、いいね、検索）
- **playlistApi**: プレイリスト管理
- **playbackApi**: 再生制御
- **notificationApi**: 通知管理

## 認証フロー
1. `/login`または`/signup`でフォームを送信
2. AuthContextが`authApi`を通じてバックエンドと通信
3. 成功時にJWTトークンをlocalStorageに保存
4. axiosのデフォルトヘッダーにトークンを設定
5. ユーザープロフィールを読み込んで`/dashboard`にリダイレクト
6. `ProtectedRoute`コンポーネントが保護されたルートをガード