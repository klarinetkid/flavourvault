import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes, useCreateRecipe, useUpdateRecipe, useDeleteRecipe } from "@/hooks/useRecipes";
import { migrateLocalStorageRecipes, getMigrationInfo } from "@/lib/migration";
import { RecipeList } from "@/components/RecipeList";
import { RecipeDetailView } from "@/components/RecipeDetailView";
import { RecipeEditForm } from "@/components/RecipeEditForm";
import { MobileHeader } from "@/components/MobileHeader";
import { LoadingSpinner, FullPageSpinner } from "@/components/LoadingSpinner";
import { ErrorDisplay } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, LogOut, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "empty" | "view" | "edit";

const Index = () => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("empty");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    isChecking: boolean;
    isComplete: boolean;
    hasLegacyData: boolean;
  }>({
    isChecking: true,
    isComplete: false,
    hasLegacyData: false,
  });

  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // React Query hooks
  const { data: recipes = [], isLoading, error, refetch } = useRecipes();
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();

  // Check for migration on component mount
  useEffect(() => {
    const checkMigration = async () => {
      try {
        const migrationInfo = getMigrationInfo();
        
        if (!migrationInfo.isCompleted && migrationInfo.hasLegacyData) {
          // Attempt automatic migration
          const result = await migrateLocalStorageRecipes();
          
          if (result.success) {
            toast({
              title: "Migration Complete",
              description: `Successfully migrated ${result.migratedCount} recipes from local storage.`,
            });
            // Refetch recipes to show migrated data
            refetch();
          } else {
            toast({
              title: "Migration Failed",
              description: result.error || "Failed to migrate recipes from local storage.",
              variant: "destructive",
            });
          }
        }

        setMigrationStatus({
          isChecking: false,
          isComplete: migrationInfo.isCompleted,
          hasLegacyData: migrationInfo.hasLegacyData,
        });
      } catch (error) {
        console.error('Migration check failed:', error);
        setMigrationStatus({
          isChecking: false,
          isComplete: false,
          hasLegacyData: false,
        });
      }
    };

    if (user) {
      checkMigration();
    }
  }, [user, toast, refetch]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    setViewMode("view");
    setIsSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewRecipe = () => {
    const tempRecipe: Recipe = {
      id: `new-${Date.now()}`,
      user_id: user!.id,
      name: "",
      servings: 1,
      notes: "",
      ingredients: [],
      tags: [],                    // NEW: Default empty tags array
      is_favourite: false,         // NEW: Default favourite status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_index: recipes.length,
    };
    
    setSelectedRecipeId(tempRecipe.id);
    setViewMode("edit");
    setIsSidebarOpen(false);
  };

  const handleSaveRecipe = async (updatedRecipe: Recipe) => {
    const isNew = updatedRecipe.id.startsWith("new-");
    
    try {
      if (isNew) {
        // Create new recipe
        const { name, servings, notes, ingredients, tags, is_favourite, order_index } = updatedRecipe;
        const result = await createRecipeMutation.mutateAsync({
          name,
          servings,
          notes,
          ingredients,
          tags,
          is_favourite,
          order_index,
        });
        
        if (result) {
          setSelectedRecipeId(result.id);
          toast({
            title: "Recipe Created",
            description: "Your recipe has been saved successfully.",
          });
        }
      } else {
        // Update existing recipe
        const { name, servings, notes, ingredients, tags, is_favourite, order_index } = updatedRecipe;
        await updateRecipeMutation.mutateAsync({
          id: updatedRecipe.id,
          updates: {
            name,
            servings,
            notes,
            ingredients,
            tags,
            is_favourite,
            order_index,
          },
        });
        
        toast({
          title: "Recipe Updated",
          description: "Your changes have been saved successfully.",
        });
      }
      
      setViewMode("view");
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save recipe.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async () => {
    if (!selectedRecipeId) return;
    
    try {
      await deleteRecipeMutation.mutateAsync(selectedRecipeId);
      setSelectedRecipeId(null);
      setViewMode("empty");
      
      toast({
        title: "Recipe Deleted",
        description: "The recipe has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete recipe.",
        variant: "destructive",
      });
    }
  };

  const handleEditRecipe = () => {
    setViewMode("edit");
  };

  const handleCancelEdit = () => {
    if (selectedRecipe?.id.startsWith("new-")) {
      setSelectedRecipeId(null);
      setViewMode("empty");
    } else {
      setViewMode("view");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading spinner while checking migration
  if (migrationStatus.isChecking) {
    return <FullPageSpinner text="Setting up your recipes..." />;
  }

  // Show error if recipes failed to load
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorDisplay 
          error={error instanceof Error ? error.message : "Failed to load recipes"} 
          onRetry={() => refetch()}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header - Fixed at top for small screens */}
      <MobileHeader
        onToggleSidebar={handleToggleSidebar}
        onNewRecipe={handleNewRecipe}
        showNewButton={viewMode !== "empty"}
      />

      {/* User Info and Sign Out - Desktop */}
      <div className="hidden md:block fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="h-8"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Migration Info Alert */}
      {migrationStatus.hasLegacyData && !migrationStatus.isComplete && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 max-w-md">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              We found recipes in your local storage. They will be automatically migrated to your account.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on small screens, visible on medium+ screens */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50 w-80 flex-shrink-0 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block
          hidden md:block
        `}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner text="Loading recipes..." />
          </div>
        ) : (
          <RecipeList
            recipes={recipes}
            selectedRecipeId={selectedRecipeId}
            onSelectRecipe={handleSelectRecipe}
          />
        )}
      </div>

      {/* Mobile Sidebar - Only shown when toggled on small screens */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-80 flex-shrink-0 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden pt-16
        `}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner text="Loading recipes..." />
          </div>
        ) : (
          <RecipeList
            recipes={recipes}
            selectedRecipeId={selectedRecipeId}
            onSelectRecipe={handleSelectRecipe}
          />
        )}
      </div>

      {/* Main Content - Adjusted for mobile header */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0">
        {viewMode === "empty" && (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Welcome to FlavourVault
              </h2>
              <p className="text-muted-foreground mb-6">
                {recipes.length === 0 
                  ? "Start by creating your first recipe"
                  : "Select a recipe from the sidebar or create a new one"
                }
              </p>
              <Button 
                onClick={handleNewRecipe} 
                size="lg"
                disabled={createRecipeMutation.isPending}
              >
                {createRecipeMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                New Recipe
              </Button>
            </div>
          </div>
        )}
        
        {viewMode === "view" && selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            onEdit={handleEditRecipe}
            onDelete={handleDeleteRecipe}
          />
        )}
        
        {viewMode === "edit" && (
          <RecipeEditForm
            recipe={selectedRecipe || {
              id: `new-${Date.now()}`,
              user_id: user!.id,
              name: "",
              servings: 1,
              notes: "",
              ingredients: [],
              tags: [],                    // NEW: Default empty tags array
              is_favourite: false,         // NEW: Default favourite status
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              order_index: recipes.length,
            }}
            onSave={handleSaveRecipe}
            onCancel={handleCancelEdit}
          />
        )}
      </div>

      {/* Desktop Floating Action Button */}
      {viewMode !== "empty" && (
        <Button
          onClick={handleNewRecipe}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hidden md:flex"
          size="icon"
          disabled={createRecipeMutation.isPending}
        >
          {createRecipeMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      )}
    </div>
  );
};

export default Index;