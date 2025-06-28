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
      localStorage.removeItem('token');
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
      if (error instanceof Error) {
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
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('予期しないエラーが発生しました');
      }
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },


};

export const audioContentApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => {
    const response = await api.get('/audio-contents', { params });
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
    formData.append('category', audioData.category);
    if (audioData.duration) {
      formData.append('duration', audioData.duration.toString());
    }
    formData.append('audioFile', audioData.audioFile);

    const response = await api.post('/audio-contents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  toggleLike: async (id: string) => {
    const response = await api.post(`/audio-contents/${id}/like`);
    return response.data;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export default api; 