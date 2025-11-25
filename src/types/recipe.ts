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
  created_at: string;
  updated_at: string;
  order_index: number;
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
