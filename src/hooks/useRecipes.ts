import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getRecipes, 
  getRecipe, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe, 
  updateRecipeOrder 
} from '@/lib/recipes'
import type { Recipe } from '@/types/recipe'
import type { CreateRecipeData, UpdateRecipeData } from '@/lib/recipes'

const RECIPES_QUERY_KEY = 'recipes'

// Hook to get all recipes
export const useRecipes = () => {
  return useQuery({
    queryKey: [RECIPES_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await getRecipes()
      if (error) {
        throw new Error(error)
      }
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get a single recipe
export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: [RECIPES_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await getRecipe(id)
      if (error) {
        throw new Error(error)
      }
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to create a recipe
export const useCreateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recipeData: CreateRecipeData) => {
      const { data, error } = await createRecipe(recipeData)
      if (error) {
        throw new Error(error)
      }
      return data
    },
    onSuccess: (newRecipe) => {
      // Update the recipes list cache
      queryClient.setQueryData<Recipe[]>([RECIPES_QUERY_KEY], (oldRecipes) => {
        if (!oldRecipes) return [newRecipe!]
        return [...oldRecipes, newRecipe!]
      })
      
      // Invalidate and refetch recipes to ensure consistency
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] })
    },
  })
}

// Hook to update a recipe
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRecipeData }) => {
      const { data, error } = await updateRecipe(id, updates)
      if (error) {
        throw new Error(error)
      }
      return data
    },
    onSuccess: (updatedRecipe) => {
      if (!updatedRecipe) return

      // Update the specific recipe cache
      queryClient.setQueryData([RECIPES_QUERY_KEY, updatedRecipe.id], updatedRecipe)
      
      // Update the recipes list cache
      queryClient.setQueryData<Recipe[]>([RECIPES_QUERY_KEY], (oldRecipes) => {
        if (!oldRecipes) return [updatedRecipe]
        return oldRecipes.map(recipe => 
          recipe.id === updatedRecipe.id ? updatedRecipe : recipe
        )
      })
    },
  })
}

// Hook to delete a recipe
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteRecipe(id)
      if (error) {
        throw new Error(error)
      }
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from recipes list cache
      queryClient.setQueryData<Recipe[]>([RECIPES_QUERY_KEY], (oldRecipes) => {
        if (!oldRecipes) return []
        return oldRecipes.filter(recipe => recipe.id !== deletedId)
      })
      
      // Remove the specific recipe cache
      queryClient.removeQueries({ queryKey: [RECIPES_QUERY_KEY, deletedId] })
    },
  })
}

// Hook to update recipe order (for drag and drop)
export const useUpdateRecipeOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recipeUpdates: { id: string; order_index: number }[]) => {
      const { error } = await updateRecipeOrder(recipeUpdates)
      if (error) {
        throw new Error(error)
      }
      return recipeUpdates
    },
    onMutate: async (recipeUpdates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [RECIPES_QUERY_KEY] })

      // Snapshot the previous value
      const previousRecipes = queryClient.getQueryData<Recipe[]>([RECIPES_QUERY_KEY])

      // Optimistically update the cache
      if (previousRecipes) {
        const updatedRecipes = [...previousRecipes]
        recipeUpdates.forEach(({ id, order_index }) => {
          const recipeIndex = updatedRecipes.findIndex(r => r.id === id)
          if (recipeIndex !== -1) {
            updatedRecipes[recipeIndex] = {
              ...updatedRecipes[recipeIndex],
              order_index
            }
          }
        })
        
        // Sort by order_index
        updatedRecipes.sort((a, b) => a.order_index - b.order_index)
        
        queryClient.setQueryData([RECIPES_QUERY_KEY], updatedRecipes)
      }

      // Return a context object with the snapshotted value
      return { previousRecipes }
    },
    onError: (err, recipeUpdates, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRecipes) {
        queryClient.setQueryData([RECIPES_QUERY_KEY], context.previousRecipes)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] })
    },
  })
}

// Hook to invalidate and refetch recipes
export const useRefreshRecipes = () => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] })
  }
}