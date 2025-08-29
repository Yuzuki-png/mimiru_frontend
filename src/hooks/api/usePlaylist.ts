import useAppSWR from '../useAppSWR';
import useSWRMutation from 'swr/mutation';
import useAxios from '../useAxios';
import { mutate } from 'swr';

export interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

export interface PlaylistItem {
  id: number;
  playlistId: number;
  audioContentId: number;
  addedAt: string;
  audioContent: {
    id: number;
    title: string;
    duration: number;
    author: {
      name: string;
    };
  };
}

export function usePlaylists() {
  return useAppSWR<{ data: Playlist[] }>('/playlists');
}

export function usePlaylist(id: number | string | null) {
  const key = id ? `/playlists/${id}` : null;
  return useAppSWR<Playlist>(key);
}

export function useCreatePlaylist() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'create-playlist',
    async (_key: string, { arg }: { 
      arg: { name: string; description?: string } 
    }) => {
      const response = await axiosClient<Playlist>('/playlists', {
        method: 'POST',
        data: arg,
      });
      
      mutate('/playlists');
      
      return response.data;
    }
  );
}

export function useUpdatePlaylist() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'update-playlist',
    async (_key: string, { arg }: { 
      arg: { id: number | string; data: Partial<Playlist> } 
    }) => {
      const response = await axiosClient<Playlist>(`/playlists/${arg.id}`, {
        method: 'PUT',
        data: arg.data,
      });
      
      mutate(`/playlists/${arg.id}`);
      mutate('/playlists');
      
      return response.data;
    }
  );
}

export function useDeletePlaylist() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'delete-playlist',
    async (_key: string, { arg }: { arg: { id: number | string } }) => {
      await axiosClient(`/playlists/${arg.id}`, {
        method: 'DELETE',
      });
      
      mutate('/playlists');
      
      return { success: true };
    }
  );
}

export function useAddPlaylistItem() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'add-playlist-item',
    async (_key: string, { arg }: { 
      arg: { playlistId: number | string; audioContentId: number | string } 
    }) => {
      const response = await axiosClient(`/playlists/${arg.playlistId}/items`, {
        method: 'POST',
        data: { audioContentId: arg.audioContentId },
      });
      
      mutate(`/playlists/${arg.playlistId}`);
      mutate(`/playlists/${arg.playlistId}/items`);
      
      return response.data;
    }
  );
}

export function useRemovePlaylistItem() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'remove-playlist-item',
    async (_key: string, { arg }: { 
      arg: { playlistId: number | string; itemId: number | string } 
    }) => {
      await axiosClient(`/playlists/${arg.playlistId}/items/${arg.itemId}`, {
        method: 'DELETE',
      });
      
      mutate(`/playlists/${arg.playlistId}`);
      mutate(`/playlists/${arg.playlistId}/items`);
      
      return { success: true };
    }
  );
}

export function usePlaylistItems(playlistId: number | string | null) {
  const key = playlistId ? `/playlists/${playlistId}/items` : null;
  return useAppSWR<{ data: PlaylistItem[] }>(key);
}