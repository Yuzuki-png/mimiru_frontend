import useSWR from 'swr';
import { api } from '../../lib/api';
import { ProfileUser } from '../../types/User';

interface UsersResponse {
  data: ProfileUser[];
  total: number;
}

// ダミーのおすすめユーザー（APIが失敗した場合のフォールバック）
const dummySuggestedUsers: ProfileUser[] = [
  {
    id: '101',
    name: '田中太郎',
    email: 'tanaka@example.com',
    bio: 'ビジネス系ポッドキャスター',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date().toISOString(),
    _count: { followers: 120, following: 45, audioContents: 8 },
  },
  {
    id: '102',
    name: '佐藤一郎',
    email: 'sato@example.com',
    bio: 'テクノロジー系の話題を中心に配信',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date().toISOString(),
    _count: { followers: 89, following: 32, audioContents: 12 },
  },
  {
    id: '103',
    name: '鈴木美咲',
    email: 'suzuki@example.com',
    bio: '健康とウェルネスのスペシャリスト',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date().toISOString(),
    _count: { followers: 156, following: 67, audioContents: 15 },
  },
];

export const useSuggestedUsers = (limit = 10) => {
  const result = useSWR<UsersResponse>(
    `/users/suggested?limit=${limit}`,
    async () => {
      const response = await api.get('/users/suggested', {
        params: { limit }
      });
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      onErrorRetry: () => {
        // エラー時はリトライしない（ダミーデータを使用するため）
        return;
      },
    }
  );

  // APIが失敗またはデータが空の場合はダミーデータを返す
  const data = result.data?.data?.length
    ? result.data
    : (result.error || !result.isLoading)
      ? { data: dummySuggestedUsers.slice(0, limit), total: dummySuggestedUsers.length }
      : result.data;

  return {
    ...result,
    data,
    isLoading: result.isLoading,
  };
};

export const useUsers = (params?: { query?: string; limit?: number }) => {
  const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  
  return useSWR<UsersResponse>(
    params ? `/users/search?${queryString}` : null,
    async () => {
      const response = await api.get('/users/search', { params });
      return response.data;
    }
  );
};