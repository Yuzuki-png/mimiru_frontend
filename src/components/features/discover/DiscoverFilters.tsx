"use client";

import React from 'react';
import { Button } from '../../ui';

interface Category {
  id: number;
  name: string;
}

interface DiscoverFiltersProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  isLoading?: boolean;
}

const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="whitespace-nowrap flex-shrink-0"
      >
        すべて
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="whitespace-nowrap flex-shrink-0"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default DiscoverFilters;