export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  notes: string;
  ingredients: Ingredient[];
  createdAt: number;
  order: number;
}
