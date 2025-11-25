import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '@/lib/recipes'
import type { CreateRecipeData, UpdateRecipeData } from '@/lib/recipes'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  }
}))

describe('Recipe Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecipes', () => {
    it('should fetch recipes successfully', async () => {
      const mockRecipes = [
        {
          id: '1',
          user_id: 'test-user-id',
          name: 'Test Recipe',
          servings: 4,
          notes: 'Test notes',
          ingredients: [],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          order_index: 0
        }
      ]

      const { supabase } = await import('@/lib/supabase')
      const mockFrom = vi.mocked(supabase.from)
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => ({
          data: mockRecipes,
          error: null
        }))
      }))
      mockFrom.mockReturnValue({ select: mockSelect } as any)

      const result = await getRecipes()

      expect(result.data).toEqual(mockRecipes)
      expect(result.error).toBeNull()
      expect(mockFrom).toHaveBeenCalledWith('recipes')
    })

    it('should handle fetch errors', async () => {
      const { supabase } = await import('@/lib/supabase')
      const mockFrom = vi.mocked(supabase.from)
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => ({
          data: null,
          error: { message: 'Database error' }
        }))
      }))
      mockFrom.mockReturnValue({ select: mockSelect } as any)

      const result = await getRecipes()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database error')
    })
  })

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const mockRecipe = {
        id: '1',
        user_id: 'test-user-id',
        name: 'New Recipe',
        servings: 2,
        notes: 'New notes',
        ingredients: [],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        order_index: 0
      }

      const { supabase } = await import('@/lib/supabase')
      const mockFrom = vi.mocked(supabase.from)
      
      // Mock the complete chain for createRecipe
      const mockSingle = vi.fn(() => ({
        data: mockRecipe,
        error: null
      }))
      const mockSelect = vi.fn(() => ({
        single: mockSingle
      }))
      const mockInsert = vi.fn(() => ({
        select: mockSelect
      }))
      
      // Mock the chain for getting existing recipes (order_index calculation)
      const mockLimit = vi.fn(() => ({
        data: [],
        error: null
      }))
      const mockOrder = vi.fn(() => ({
        limit: mockLimit
      }))
      const mockSelectForOrder = vi.fn(() => ({
        order: mockOrder
      }))
      
      mockFrom.mockImplementation((table) => {
        if (table === 'recipes') {
          return {
            select: mockSelectForOrder,
            insert: mockInsert
          } as any
        }
        return {} as any
      })

      const recipeData: CreateRecipeData = {
        name: 'New Recipe',
        servings: 2,
        notes: 'New notes',
        ingredients: []
      }

      const result = await createRecipe(recipeData)

      expect(result.data).toEqual(mockRecipe)
      expect(result.error).toBeNull()
      expect(mockFrom).toHaveBeenCalledWith('recipes')
    })
  })

  describe('updateRecipe', () => {
    it('should update a recipe successfully', async () => {
      const mockUpdatedRecipe = {
        id: '1',
        user_id: 'test-user-id',
        name: 'Updated Recipe',
        servings: 3,
        notes: 'Updated notes',
        ingredients: [],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T01:00:00Z',
        order_index: 0
      }

      const { supabase } = await import('@/lib/supabase')
      const mockFrom = vi.mocked(supabase.from)
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockUpdatedRecipe,
              error: null
            }))
          }))
        }))
      }))
      mockFrom.mockReturnValue({ update: mockUpdate } as any)

      const updates: UpdateRecipeData = {
        name: 'Updated Recipe',
        servings: 3,
        notes: 'Updated notes'
      }

      const result = await updateRecipe('1', updates)

      expect(result.data).toEqual(mockUpdatedRecipe)
      expect(result.error).toBeNull()
      expect(mockFrom).toHaveBeenCalledWith('recipes')
    })
  })

  describe('deleteRecipe', () => {
    it('should delete a recipe successfully', async () => {
      const { supabase } = await import('@/lib/supabase')
      const mockFrom = vi.mocked(supabase.from)
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
      mockFrom.mockReturnValue({ delete: mockDelete } as any)

      const result = await deleteRecipe('1')

      expect(result.error).toBeNull()
      expect(mockFrom).toHaveBeenCalledWith('recipes')
    })

    it('should handle delete errors', async () => {
      const { supabase } = await import('@/lib/supabase')
      const mockFrom = vi.mocked(supabase.from)
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          error: { message: 'Delete failed' }
        }))
      }))
      mockFrom.mockReturnValue({ delete: mockDelete } as any)

      const result = await deleteRecipe('1')

      expect(result.error).toBe('Delete failed')
    })
  })
})