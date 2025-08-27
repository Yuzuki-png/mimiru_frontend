import useAppSWR from '../useAppSWR';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
}

// カテゴリリスト取得
export function useCategories() {
  return useAppSWR<Category[]>('/categories');
}

// 有効なカテゴリのみ取得
export function useActiveCategories() {
  return useAppSWR<Category[]>('/categories?active=true');
}