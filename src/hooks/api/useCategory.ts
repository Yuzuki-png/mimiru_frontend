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

export function useCategories() {
  return useAppSWR<Category[]>('/categories');
}

export function useActiveCategories() {
  return useAppSWR<Category[]>('/categories?active=true');
}