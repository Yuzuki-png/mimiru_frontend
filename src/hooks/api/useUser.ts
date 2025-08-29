import useSWR from 'swr';
import { api } from '../../lib/api';
import { ProfileUser } from '../../types/User';

interface UsersResponse {
  data: ProfileUser[];
  total: number;
}

export const useSuggestedUsers = (limit = 10) => {
  return useSWR<UsersResponse>(
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
    }
  );
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