import useAppSWR from '../useAppSWR';
import useSWRMutation from 'swr/mutation';
import useAxios from '../useAxios';
import { AudioContent, PaginatedResult, CreateAudioContentData } from '../../types';
import { mutate } from 'swr';

// 音声コンテンツリスト取得
export function useAudioContents(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'duration' | 'likes';
  sortOrder?: 'asc' | 'desc';
}) {
  const queryParams = params ? new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString() : '';
  
  const key = queryParams ? `/audio-contents?${queryParams}` : '/audio-contents';
  
  return useAppSWR<PaginatedResult<AudioContent>>(key);
}

// 音声コンテンツ詳細取得
export function useAudioContent(id: number | string | null) {
  const key = id ? `/audio-contents/${id}` : null;
  return useAppSWR<AudioContent>(key);
}

// 音声コンテンツ作成
export function useCreateAudioContent() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'create-audio-content',
    async (_key: string, { arg }: { 
      arg: { data: CreateAudioContentData; file: File } 
    }) => {
      const formData = new FormData();
      
      // データをFormDataに追加
      Object.entries(arg.data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      formData.append('audioFile', arg.file);
      
      const response = await axiosClient<AudioContent>('/audio-contents', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // 関連データを再検証
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/audio-contents'),
        undefined,
        { revalidate: true }
      );
      
      return response.data;
    }
  );
}

// 音声コンテンツ更新
export function useUpdateAudioContent() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'update-audio-content',
    async (_key: string, { arg }: { 
      arg: { id: number | string; data: Partial<AudioContent> } 
    }) => {
      const response = await axiosClient<AudioContent>(`/audio-contents/${arg.id}`, {
        method: 'PUT',
        data: arg.data,
      });
      
      // 特定アイテムとリストを再検証
      mutate(`/audio-contents/${arg.id}`);
      mutate((key) => typeof key === 'string' && key.startsWith('/audio-contents?'));
      
      return response.data;
    }
  );
}

// いいね機能（トグル）
export function useLikeAudioContent() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'like-audio-content',
    async (_key: string, { arg }: { 
      arg: { id: number | string } 
    }) => {
      const response = await axiosClient(`/audio-contents/${arg.id}/like`, {
        method: 'POST',
      });
      
      // サーバーからの正確なレスポンスで更新
      const { isLiked, totalLikes } = response.data as { isLiked: boolean; totalLikes: number };
      
      // 楽観的更新
      mutate(
        `/audio-contents/${arg.id}`,
        (current?: AudioContent) => {
          if (!current) return current;
          return {
            ...current,
            isLiked,
            _count: {
              ...current._count,
              likes: totalLikes,
            },
          };
        },
        false // サーバーから再取得しない
      );
      
      // トレンド・新着・リストも更新
      mutate((key) => typeof key === 'string' && key.includes('/audio-contents'), undefined, { revalidate: true });
      
      return response.data;
    }
  );
}

// 音声コンテンツ削除
export function useDeleteAudioContent() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'delete-audio-content',
    async (_key: string, { arg }: { arg: { id: number | string } }) => {
      await axiosClient(`/audio-contents/${arg.id}`, {
        method: 'DELETE',
      });
      
      // 関連データを再検証
      mutate((key) => typeof key === 'string' && key.startsWith('/audio-contents'));
      
      return { success: true };
    }
  );
}

// トレンド音声コンテンツ
export function useTrendingAudioContents(limit = 10) {
  return useAppSWR<PaginatedResult<AudioContent>>(`/audio-contents/trending?limit=${limit}`);
}

// 新着音声コンテンツ
export function useLatestAudioContents(limit = 10) {
  return useAppSWR<PaginatedResult<AudioContent>>(`/audio-contents/latest?limit=${limit}`);
}

// おすすめ音声コンテンツ
export function useRecommendedAudioContents(limit = 10) {
  return useAppSWR<AudioContent[]>(`/audio-contents/recommended?limit=${limit}`);
}

// ユーザーの音声コンテンツ取得
export function useUserAudioContents(userId: string | null, params?: {
  page?: number;
  limit?: number;
}) {
  const queryParams = params ? new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString() : '';
  
  const key = userId 
    ? queryParams 
      ? `/users/${userId}/audio-contents?${queryParams}`
      : `/users/${userId}/audio-contents`
    : null;
  
  return useAppSWR<PaginatedResult<AudioContent>>(key);
}

// いいねした音声コンテンツ取得
export function useLikedAudioContents(params?: {
  page?: number;
  limit?: number;
}) {
  const queryParams = params ? new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString() : '';
  
  const key = queryParams ? `/audio-contents/liked?${queryParams}` : '/audio-contents/liked';
  
  return useAppSWR<PaginatedResult<AudioContent>>(key);
}

// 音声コンテンツ検索
export function useSearchAudioContents(query: string | null, params?: {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'createdAt' | 'title' | 'duration' | 'likes';
  sortOrder?: 'asc' | 'desc';
}) {
  const searchParams = new URLSearchParams();
  if (query) searchParams.set('search', query);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  
  const key = query ? `/audio-contents?${searchParams.toString()}` : null;
  return useAppSWR<PaginatedResult<AudioContent>>(key);
}

// 音声コンテンツの再生回数を記録
export function useRecordPlay() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'record-play',
    async (_key: string, { arg }: { 
      arg: { id: number | string; duration?: number } 
    }) => {
      const response = await axiosClient(`/audio-contents/${arg.id}/play`, {
        method: 'POST',
        data: { duration: arg.duration },
      });
      
      return response.data;
    }
  );
}

// 音声コンテンツの統計情報取得
export function useAudioContentStats(id: number | string | null) {
  const key = id ? `/audio-contents/${id}/stats` : null;
  
  return useAppSWR<{
    plays: number;
    likes: number;
    shares: number;
    comments: number;
  }>(key);
}