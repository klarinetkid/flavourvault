import { useState, useCallback } from 'react';
import type { RecipeFilters } from '@/types/recipe';

const initialFilters: RecipeFilters = {
  searchTerm: '',
  selectedTags: [],
  showFavouritesOnly: false,
  searchInIngredients: false,
};

export const useRecipeFilters = () => {
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof RecipeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters: RecipeFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.selectedTags.length > 0 ||
      filters.showFavouritesOnly ||
      filters.searchInIngredients
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
  };
};