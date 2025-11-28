import { supabase } from './supabase'
import type { Recipe, Ingredient, RecipeFilters } from '@/types/recipe'

export interface CreateRecipeData {
  name: string
  servings: number
  notes: string
  ingredients: Ingredient[]
  tags?: string[]          // NEW: Optional tags array
  is_favourite?: boolean   // NEW: Optional favourite status
  order_index?: number
}

export interface UpdateRecipeData {
  name?: string
  servings?: number
  notes?: string
  ingredients?: Ingredient[]
  tags?: string[]          // NEW: Optional tags array
  is_favourite?: boolean   // NEW: Optional favourite status
  order_index?: number
}

export interface RecipeResponse {
  data: Recipe | null
  error: string | null
}

export interface RecipesResponse {
  data: Recipe[] | null
  error: string | null
}

// Get all recipes for the current user
export const getRecipes = async (): Promise<RecipesResponse> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching recipes:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return { data: null, error: 'Failed to fetch recipes' }
  }
}

// Get a single recipe by ID
export const getRecipe = async (id: string): Promise<RecipeResponse> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching recipe:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return { data: null, error: 'Failed to fetch recipe' }
  }
}

// Create a new recipe
export const createRecipe = async (recipeData: CreateRecipeData): Promise<RecipeResponse> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    // Get the highest order_index to append new recipe at the end
    const { data: existingRecipes } = await supabase
      .from('recipes')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingRecipes && existingRecipes.length > 0 
      ? (existingRecipes[0].order_index || 0) + 1 
      : 0

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          ...recipeData,
          user_id: user.id,
          order_index: recipeData.order_index ?? nextOrderIndex,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating recipe:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error creating recipe:', error)
    return { data: null, error: 'Failed to create recipe' }
  }
}

// Update an existing recipe
export const updateRecipe = async (id: string, updates: UpdateRecipeData): Promise<RecipeResponse> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recipe:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating recipe:', error)
    return { data: null, error: 'Failed to update recipe' }
  }
}

// Delete a recipe
export const deleteRecipe = async (id: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting recipe:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return { error: 'Failed to delete recipe' }
  }
}

// Update recipe order (for drag and drop reordering)
export const updateRecipeOrder = async (recipeUpdates: { id: string; order_index: number }[]): Promise<{ error: string | null }> => {
  try {
    const updates = recipeUpdates.map(({ id, order_index }) => 
      supabase
        .from('recipes')
        .update({ order_index, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Error updating recipe order:', errors)
      return { error: 'Failed to update recipe order' }
    }

    return { error: null }
  } catch (error) {
    console.error('Error updating recipe order:', error)
    return { error: 'Failed to update recipe order' }
  }
}

// Bulk create recipes (useful for migration)
export const createRecipes = async (recipes: CreateRecipeData[]): Promise<RecipesResponse> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const recipesWithUserId = recipes.map((recipe, index) => ({
      ...recipe,
      user_id: user.id,
      order_index: recipe.order_index ?? index,
    }))

    const { data, error } = await supabase
      .from('recipes')
      .insert(recipesWithUserId)
      .select()

    if (error) {
      console.error('Error creating recipes:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error creating recipes:', error)
    return { data: null, error: 'Failed to create recipes' }
  }
}

// Toggle favourite status
export const toggleRecipeFavourite = async (
  id: string,
  isFavourite: boolean
): Promise<RecipeResponse> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update({
        is_favourite: isFavourite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating favourite status:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating favourite status:', error)
    return { data: null, error: 'Failed to update favourite status' }
  }
}

// Get all unique tags for current user
export const getUserTags = async (): Promise<{ data: string[] | null; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .rpc('get_user_tags', { user_uuid: user.id })

    if (error) {
      console.error('Error fetching tags:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return { data: null, error: 'Failed to fetch tags' }
  }
}

// Advanced recipe search with filters
export const searchRecipes = async (filters: RecipeFilters): Promise<RecipesResponse> => {
  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('order_index', { ascending: true })

    // Apply favourite filter
    if (filters.showFavouritesOnly) {
      query = query.eq('is_favourite', true)
    }

    // Apply tag filters (OR logic for multiple tags)
    if (filters.selectedTags.length > 0) {
      query = query.overlaps('tags', filters.selectedTags)
    }

    const { data: recipes, error } = await query

    if (error) {
      console.error('Error searching recipes:', error)
      return { data: null, error: error.message }
    }

    // Client-side filtering for search terms
    let filteredRecipes = recipes || []

    if (filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase()
      
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Search in recipe name
        const nameMatch = recipe.name.toLowerCase().includes(searchTerm)
        
        // Search in ingredients if enabled
        const ingredientMatch = filters.searchInIngredients &&
          recipe.ingredients.some((ingredient: Ingredient) =>
            ingredient.name.toLowerCase() === searchTerm
          )

        return nameMatch || ingredientMatch
      })
    }

    return { data: filteredRecipes, error: null }
  } catch (error) {
    console.error('Error searching recipes:', error)
    return { data: null, error: 'Failed to search recipes' }
  }
}