import { loadRecipes } from './localStorage'
import { createRecipes } from './recipes'
import type { LegacyRecipe } from '@/types/recipe'
import type { CreateRecipeData } from './recipes'

export interface MigrationResult {
  success: boolean
  migratedCount: number
  error?: string
}

const MIGRATION_KEY = 'flavourvault_migration_completed'

// Check if migration has already been completed
export const isMigrationCompleted = (): boolean => {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'true'
  } catch (error) {
    console.error('Error checking migration status:', error)
    return false
  }
}

// Mark migration as completed
const markMigrationCompleted = (): void => {
  try {
    localStorage.setItem(MIGRATION_KEY, 'true')
  } catch (error) {
    console.error('Error marking migration as completed:', error)
  }
}

// Transform legacy recipe to new format
const transformLegacyRecipe = (legacyRecipe: LegacyRecipe): CreateRecipeData => {
  return {
    name: legacyRecipe.name,
    servings: legacyRecipe.servings,
    notes: legacyRecipe.notes,
    ingredients: legacyRecipe.ingredients,
    order_index: legacyRecipe.order,
  }
}

// Migrate localStorage recipes to Supabase
export const migrateLocalStorageRecipes = async (): Promise<MigrationResult> => {
  try {
    // Check if migration already completed
    if (isMigrationCompleted()) {
      return {
        success: true,
        migratedCount: 0,
        error: 'Migration already completed'
      }
    }

    // Load existing localStorage recipes
    const legacyRecipes = loadRecipes() as unknown as LegacyRecipe[]
    
    if (!legacyRecipes || legacyRecipes.length === 0) {
      markMigrationCompleted()
      return {
        success: true,
        migratedCount: 0,
        error: 'No recipes to migrate'
      }
    }

    // Transform legacy recipes to new format
    const recipesToMigrate = legacyRecipes.map(transformLegacyRecipe)

    // Create recipes in Supabase
    const { data, error } = await createRecipes(recipesToMigrate)

    if (error || !data) {
      return {
        success: false,
        migratedCount: 0,
        error: error || 'Failed to migrate recipes'
      }
    }

    // Mark migration as completed
    markMigrationCompleted()

    // Optionally clear localStorage recipes after successful migration
    // Uncomment the next line if you want to remove localStorage data after migration
    // clearLocalStorageRecipes()

    return {
      success: true,
      migratedCount: data.length,
    }
  } catch (error) {
    console.error('Error during migration:', error)
    return {
      success: false,
      migratedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    }
  }
}

// Clear localStorage recipes (use with caution)
export const clearLocalStorageRecipes = (): void => {
  try {
    localStorage.removeItem('flavourvault_recipes')
    console.log('localStorage recipes cleared')
  } catch (error) {
    console.error('Error clearing localStorage recipes:', error)
  }
}

// Reset migration status (for testing purposes)
export const resetMigrationStatus = (): void => {
  try {
    localStorage.removeItem(MIGRATION_KEY)
    console.log('Migration status reset')
  } catch (error) {
    console.error('Error resetting migration status:', error)
  }
}

// Get migration status info
export const getMigrationInfo = () => {
  try {
    const isCompleted = isMigrationCompleted()
    const legacyRecipes = loadRecipes() as unknown as LegacyRecipe[]
    const legacyCount = legacyRecipes ? legacyRecipes.length : 0

    return {
      isCompleted,
      legacyRecipesCount: legacyCount,
      hasLegacyData: legacyCount > 0
    }
  } catch (error) {
    console.error('Error getting migration info:', error)
    return {
      isCompleted: false,
      legacyRecipesCount: 0,
      hasLegacyData: false
    }
  }
}