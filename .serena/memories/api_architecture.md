# API アーキテクチャ

## SWR + Axios アーキテクチャ

### データフェッチング戦略
- **SWR**: キャッシュ、再検証、楽観的更新
- **Axios**: HTTP クライアント、インターセプター、エラーハンドリング
- **カスタムフック**: APIエンドポイント毎の型安全なフック

## API モジュール構成

### 認証API (`authApi`)
```typescript
- register(email, password, name?)     // ユーザー登録
- login(email, password)               // ログイン
- getProfile()                        // 認証プロフィール取得
```

### ユーザーAPI (`userApi`)
```typescript
- getProfile()                        // ユーザープロフィール取得
- updateProfile(data)                 // プロフィール更新
- changePassword(data)                // パスワード変更
- deleteAccount()                     // アカウント削除
- uploadAvatar(file)                  // アバター画像アップロード
- toggleFollow(userId)                // フォロー切り替え
- search(query, params?)              // ユーザー検索
```

### 音声コンテンツAPI (`audioContentApi`)
```typescript
- getAll(params?)                     // 一覧取得
- search(query, params?)              // 検索
- getById(id)                        // 詳細取得
- create(audioData)                   // 作成（ファイルアップロード）
- toggleLike(id)                     // いいね切り替え
- delete(id)                         // 削除
```

### プレイリストAPI (`playlistApi`)
```typescript
- getAll(params?)                     // 一覧取得
- getById(id)                        // 詳細取得
- create(data)                       // 作成
- update(id, data)                   // 更新
- delete(id)                         // 削除
- addItem(id, audioContentId)        // アイテム追加
- removeItem(id, itemId)             // アイテム削除
- reorderItems(id, items)            // 並び替え
```

### 通知API (`notificationApi`)
```typescript
- getAll(params?)                     // 一覧取得
- markAsRead(id)                     // 既読マーク
- markAllAsRead()                    // 全既読
- delete(id)                         // 削除
- getUnreadCount()                   // 未読数取得
```

## カスタムフック設計

### SWRフック例
```typescript
export function useAudioContents(params?) {
  const queryParams = params ? new URLSearchParams(...).toString() : '';
  const key = queryParams ? `/audio-contents?${queryParams}` : '/audio-contents';
  return useAppSWR<PaginatedResult<AudioContent>>(key);
}
```

### Mutationフック例
```typescript
export function useCreateAudioContent() {
  return useSWRMutation('create-audio-content', async (key, { arg }) => {
    const formData = new FormData();
    // ... フォームデータ構築
    return await axiosClient('/audio-contents', { 
      method: 'POST', 
      data: formData 
    });
  });
}
```

## 認証・エラーハンドリング

### JWT認証
- localStorage にトークン保存
- Axios インターセプターで自動ヘッダー追加
- 401/403 エラー時の自動ログアウト・リダイレクト

### エラーハンドリング戦略
- APIレベル: Axiosインターセプター
- コンポーネントレベル: try-catch + トースト通知
- グローバルレベル: ErrorBoundary

## パフォーマンス最適化

### SWR設定
- 重複リクエスト排除
- バックグラウンド再検証
- 楽観的更新
- ローカルキャッシュ活用

### データ変更パターン
```typescript
// 楽観的更新例
const { trigger } = useSWRMutation('/audio-contents', updateContent);
await trigger(newData, {
  optimisticData: updatedData,
  rollbackOnError: true
});
```