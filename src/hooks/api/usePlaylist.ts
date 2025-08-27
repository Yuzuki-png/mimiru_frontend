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

// プレイリスト一覧取得
export function usePlaylists() {
  return useAppSWR<{ data: Playlist[] }>('/playlists');
}

// プレイリスト詳細取得
export function usePlaylist(id: number | string | null) {
  const key = id ? `/playlists/${id}` : null;
  return useAppSWR<Playlist>(key);
}

// プレイリスト作成
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
      
      // プレイリスト一覧を再検証
      mutate('/playlists');
      
      return response.data;
    }
  );
}

// プレイリスト更新
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
      
      // 特定プレイリストとリストを再検証
      mutate(`/playlists/${arg.id}`);
      mutate('/playlists');
      
      return response.data;
    }
  );
}

// プレイリスト削除
export function useDeletePlaylist() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'delete-playlist',
    async (_key: string, { arg }: { arg: { id: number | string } }) => {
      await axiosClient(`/playlists/${arg.id}`, {
        method: 'DELETE',
      });
      
      // プレイリスト一覧を再検証
      mutate('/playlists');
      
      return { success: true };
    }
  );
}

// プレイリストにアイテム追加
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
      
      // プレイリスト詳細とアイテム一覧を再検証
      mutate(`/playlists/${arg.playlistId}`);
      mutate(`/playlists/${arg.playlistId}/items`);
      
      return response.data;
    }
  );
}

// プレイリストからアイテム削除
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
      
      // プレイリスト詳細とアイテム一覧を再検証
      mutate(`/playlists/${arg.playlistId}`);
      mutate(`/playlists/${arg.playlistId}/items`);
      
      return { success: true };
    }
  );
}

// プレイリストアイテム一覧取得
export function usePlaylistItems(playlistId: number | string | null) {
  const key = playlistId ? `/playlists/${playlistId}/items` : null;
  return useAppSWR<{ data: PlaylistItem[] }>(key);
}