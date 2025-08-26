/**
 * 音声コンテンツAPI - 統一されたAPIクライアントを使用
 */

import { apiClient } from './base';
import { AudioContent, CreateAudioContentData, PaginatedResult, ApiResponse } from '../../types';

interface GetAudioContentsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'duration' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

interface UpdateAudioContentData {
  title?: string;
  description?: string;
  categoryId?: number;
}

export const audioContentApi = {
  /**
   * 音声コンテンツ一覧取得
   */
  async getAudioContents(params?: GetAudioContentsParams): Promise<ApiResponse<PaginatedResult<AudioContent>>> {
    return apiClient.get<PaginatedResult<AudioContent>>('/audio-contents', params);
  },

  /**
   * 音声コンテンツ詳細取得
   */
  async getAudioContent(id: number): Promise<ApiResponse<AudioContent>> {
    return apiClient.get<AudioContent>(`/audio-contents/${id}`);
  },

  /**
   * 音声コンテンツ作成
   */
  async createAudioContent(data: CreateAudioContentData, audioFile: File): Promise<ApiResponse<AudioContent>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('duration', data.duration.toString());
    formData.append('audioFile', audioFile);

    return apiClient.postFormData<AudioContent>('/audio-contents', formData);
  },

  /**
   * 音声コンテンツ更新
   */
  async updateAudioContent(id: number, data: UpdateAudioContentData): Promise<ApiResponse<AudioContent>> {
    return apiClient.put<AudioContent>(`/audio-contents/${id}`, data);
  },

  /**
   * 音声コンテンツ削除
   */
  async deleteAudioContent(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/audio-contents/${id}`);
  },

  /**
   * いいね追加
   */
  async likeAudioContent(id: number): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/audio-contents/${id}/like`);
  },

  /**
   * いいね削除
   */
  async unlikeAudioContent(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/audio-contents/${id}/like`);
  },

  /**
   * トレンドコンテンツ取得
   */
  async getTrendingContents(limit?: number): Promise<ApiResponse<AudioContent[]>> {
    return apiClient.get<AudioContent[]>('/audio-contents/trending', { limit });
  },

  /**
   * 新着コンテンツ取得
   */
  async getLatestContents(limit?: number): Promise<ApiResponse<AudioContent[]>> {
    return apiClient.get<AudioContent[]>('/audio-contents/latest', { limit });
  },

  /**
   * おすすめコンテンツ取得
   */
  async getRecommendedContents(limit?: number): Promise<ApiResponse<AudioContent[]>> {
    return apiClient.get<AudioContent[]>('/audio-contents/recommended', { limit });
  },

  /**
   * ユーザーの音声コンテンツ取得
   */
  async getUserAudioContents(userId: string, params?: GetAudioContentsParams): Promise<ApiResponse<PaginatedResult<AudioContent>>> {
    return apiClient.get<PaginatedResult<AudioContent>>(`/users/${userId}/audio-contents`, params);
  },

  /**
   * いいねした音声コンテンツ取得
   */
  async getLikedAudioContents(params?: GetAudioContentsParams): Promise<ApiResponse<PaginatedResult<AudioContent>>> {
    return apiClient.get<PaginatedResult<AudioContent>>('/audio-contents/liked', params);
  },

  /**
   * 音声コンテンツ検索
   */
  async searchAudioContents(query: string, params?: Omit<GetAudioContentsParams, 'search'>): Promise<ApiResponse<PaginatedResult<AudioContent>>> {
    return apiClient.get<PaginatedResult<AudioContent>>('/audio-contents/search', {
      ...params,
      q: query,
    });
  },

  /**
   * カテゴリ別音声コンテンツ取得
   */
  async getAudioContentsByCategory(categoryId: number, params?: GetAudioContentsParams): Promise<ApiResponse<PaginatedResult<AudioContent>>> {
    return apiClient.get<PaginatedResult<AudioContent>>(`/categories/${categoryId}/audio-contents`, params);
  },

  /**
   * 音声コンテンツの再生回数を記録
   */
  async recordPlay(id: number, duration?: number): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/audio-contents/${id}/play`, { duration });
  },

  /**
   * 音声コンテンツの統計情報取得
   */
  async getAudioContentStats(id: number): Promise<ApiResponse<{
    plays: number;
    likes: number;
    shares: number;
    comments: number;
  }>> {
    return apiClient.get<{
      plays: number;
      likes: number;
      shares: number;
      comments: number;
    }>(`/audio-contents/${id}/stats`);
  },
};