import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from './config';

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.apiTimeout,
});

export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 認証情報をクリア
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      
      // ログインページ以外では再ログインを促す
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/auth/login')) {
        
        // 少し遅延を入れてからリダイレクト（トーストが表示されるように）
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
        
        // カスタムイベントを発行してトースト表示
        window.dispatchEvent(new CustomEvent('auth-required', {
          detail: { message: 'セッションが期限切れです。再ログインが必要です。' }
        }));
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (email: string, password: string, name?: string) => {
    const userData = { email, password, name };
    
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        localStorage.setItem('userEmail', email);
      }
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('予期しないエラーが発生しました');
      }
    }
  },
  
  login: async (email: string, password: string) => {
    const loginData = { email, password };
    
    try {
      const response = await api.post('/auth/login', loginData);
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        localStorage.setItem('userEmail', email);
      }
      
      return response.data;
    } catch (error) {
      
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          throw new Error('サーバーに接続できません。バックエンドが起動していることを確認してください。');
        }
        
        if (error.response?.status === 401) {
          throw new Error('メールアドレスまたはパスワードが間違っています');
        }
        
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        
        throw new Error(`サーバーエラー: ${error.response?.status || 'Unknown'}`);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('予期しないエラーが発生しました');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // ネットワークエラーまたは認証エラーの場合は再スローしない
        if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
          return null;
        }
      }
      throw error;
    }
  },
};

export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData: { name?: string; profile?: string }) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('パスワード変更に失敗しました');
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete('/users/account');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('アカウント削除に失敗しました');
    }
  },

  getLearningStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  toggleFollow: async (userId: string) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowing: async (userId?: string, params?: { page?: number; limit?: number }) => {
    const endpoint = userId ? `/users/${userId}/following` : '/users/me/following';
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  getFollowers: async (userId?: string, params?: { page?: number; limit?: number }) => {
    const endpoint = userId ? `/users/${userId}/followers` : '/users/me/followers';
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  search: async (query: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get('/users/search', { 
      params: { q: query, ...params }
    });
    return response.data;
  },

  getContents: async (userId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/users/${userId}/contents`, { params });
    return response.data;
  },
};

export const audioContentApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isLiked?: string;
    minDuration?: number;
    maxDuration?: number;
    sortBy?: string;
  }) => {
    const response = await api.get('/audio-contents', { params });
    return response.data;
  },

  search: async (query: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    minDuration?: number;
    maxDuration?: number;
    sortBy?: string;
  }) => {
    const searchParams = {
      search: query,
      ...params
    };
    const response = await api.get('/audio-contents', { params: searchParams });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/audio-contents/${id}`);
    return response.data;
  },

  create: async (audioData: {
    title: string;
    description: string;
    category: string;
    duration?: number;
    audioFile: File;
  }) => {
    const formData = new FormData();
    formData.append('title', audioData.title);
    formData.append('description', audioData.description);
    // カテゴリ（日本語名）とカテゴリID（数値）を送信
    formData.append('category', audioData.category);
    
    // カテゴリIDマッピング（seedスクリプトの順序に合わせる）
    const categoryIdMap: { [key: string]: string } = {
      "ビジネス": "1",
      "教育": "2",
      "エンターテイメント": "3", 
      "ニュース": "4",
      "健康": "5",
      "テクノロジー": "6"
    };
    
    if (categoryIdMap[audioData.category]) {
      formData.append('categoryId', categoryIdMap[audioData.category]);
    }
    
    // durationを文字列として送信
    if (audioData.duration !== undefined && audioData.duration > 0) {
      formData.append('duration', audioData.duration.toString());
    }
    
    formData.append('audioFile', audioData.audioFile);


    try {
      const response = await api.post('/audio-contents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw error;
    }
  },

  toggleLike: async (id: string) => {
    const response = await api.post(`/audio-contents/${id}/like`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/audio-contents/${id}`);
    return response.data;
  }
};

export const playlistApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  create: async (playlistData: {
    name: string;
    description?: string;
  }) => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },

  update: async (id: string, playlistData: {
    name: string;
    description?: string;
  }) => {
    const response = await api.put(`/playlists/${id}`, playlistData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  addItem: async (id: string, audioContentId: number, position?: number) => {
    const response = await api.post(`/playlists/${id}/items`, {
      audioContentId: audioContentId,
      position
    });
    return response.data;
  },

  removeItem: async (id: string, itemId: string) => {
    const response = await api.delete(`/playlists/${id}/items/${itemId}`);
    return response.data;
  },

  reorderItems: async (id: string, items: { id: number; position: number }[]) => {
    const response = await api.put(`/playlists/${id}/items/reorder`, { items });
    return response.data;
  }
};

export const playbackApi = {
  getStatus: async () => {
    const response = await api.get('/playback/status');
    return response.data;
  },

  play: async (audioContentId: string) => {
    const response = await api.post(`/playback/play/${audioContentId}`);
    return response.data;
  },

  pause: async () => {
    const response = await api.post('/playback/pause');
    return response.data;
  },

  stop: async () => {
    const response = await api.post('/playback/stop');
    return response.data;
  },

  seek: async (time: number) => {
    const response = await api.post('/playback/seek', { time });
    return response.data;
  },

  setVolume: async (volume: number) => {
    const response = await api.post('/playback/volume', { volume });
    return response.data;
  }
};

export const notificationApi = {
  getAll: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};


export default api; 