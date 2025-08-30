import useAppSWR from '../useAppSWR';
import useSWRMutation from 'swr/mutation';
import useAxios from '../useAxios';
import { AudioContent, PaginatedResult, CreateAudioContentData } from '../../types';
import { mutate } from 'swr';

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

export function useAudioContent(id: number | string | null) {
  const key = id ? `/audio-contents/${id}` : null;
  return useAppSWR<AudioContent>(key);
}

export function useCreateAudioContent() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'create-audio-content',
    async (_key: string, { arg }: { 
      arg: { data: CreateAudioContentData; file: File } 
    }) => {
      const formData = new FormData();
      
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
      
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/audio-contents'),
        undefined,
        { revalidate: true }
      );
      
      return response.data;
    }
  );
}

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
      
      mutate(`/audio-contents/${arg.id}`);
      mutate((key) => typeof key === 'string' && key.startsWith('/audio-contents?'));
      
      return response.data;
    }
  );
}

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
      
      const { isLiked, totalLikes } = response.data as { isLiked: boolean; totalLikes: number };
      
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
        false
      );
      
      mutate((key) => typeof key === 'string' && key.includes('/audio-contents'), undefined, { revalidate: true });
      
      return response.data;
    }
  );
}

export function useDeleteAudioContent() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'delete-audio-content',
    async (_key: string, { arg }: { arg: { id: number | string } }) => {
      await axiosClient(`/audio-contents/${arg.id}`, {
        method: 'DELETE',
      });
      
      mutate((key) => typeof key === 'string' && key.startsWith('/audio-contents'));
      
      return { success: true };
    }
  );
}

export function useTrendingAudioContents(limit = 10, params?: { category?: string }) {
  const queryParams = new URLSearchParams();
  queryParams.set('limit', String(limit));
  
  if (params?.category) {
    queryParams.set('category', params.category);
  }
  
  return useAppSWR<PaginatedResult<AudioContent>>(`/audio-contents/trending?${queryParams.toString()}`);
}

export function useLatestAudioContents(limit = 10, params?: { category?: string }) {
  const queryParams = new URLSearchParams();
  queryParams.set('limit', String(limit));
  
  if (params?.category) {
    queryParams.set('category', params.category);
  }
  
  return useAppSWR<PaginatedResult<AudioContent>>(`/audio-contents/latest?${queryParams.toString()}`);
}

export function useRecommendedAudioContents(limit = 10) {
  return useAppSWR<AudioContent[]>(`/audio-contents/recommended?limit=${limit}`);
}

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

export function useAudioContentStats(id: number | string | null) {
  const key = id ? `/audio-contents/${id}/stats` : null;
  
  return useAppSWR<{
    plays: number;
    likes: number;
    shares: number;
    comments: number;
  }>(key);
}