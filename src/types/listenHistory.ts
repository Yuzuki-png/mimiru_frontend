export interface ListenHistory {
  id: number;
  currentTime: number;
  duration?: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  audioContentId: number;
  audioContent: {
    id: number;
    title: string;
    description: string;
    duration?: number;
    audioUrl: string;
    thumbnailUrl?: string;
    author: {
      id: number;
      name?: string;
    };
    category: {
      id: number;
      name: string;
    };
  };
}

export interface ListenHistoryResponse {
  data: ListenHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateListenHistoryDto {
  audioContentId: number;
  currentTime?: number;
  duration?: number;
  completed?: boolean;
}