export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  servings: number;
  notes: string;
  ingredients: Ingredient[];
  tags: string[];           // NEW: Array of tag strings, max 5
  is_favourite: boolean;    // NEW: User-specific favourite status
  created_at: string;
  updated_at: string;
  order_index: number;
}

// New interface for filtering recipes
export interface RecipeFilters {
  searchTerm: string;
  selectedTags: string[];
  showFavouritesOnly: boolean;
  searchInIngredients: boolean;
}

// Legacy interface for localStorage migration
export interface LegacyRecipe {
  id: string;
  name: string;
  servings: number;
  notes: string;
  ingredients: Ingredient[];
  createdAt: number;
  order: number;
}
