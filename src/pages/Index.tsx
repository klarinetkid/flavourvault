import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { loadRecipes, saveRecipes } from "@/lib/localStorage";
import { RecipeList } from "@/components/RecipeList";
import { RecipeDetailView } from "@/components/RecipeDetailView";
import { RecipeEditForm } from "@/components/RecipeEditForm";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ViewMode = "empty" | "view" | "edit";

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("empty");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadedRecipes = loadRecipes();
    setRecipes(loadedRecipes);
  }, []);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    setViewMode("view");
    // Close sidebar on mobile when selecting a recipe
    setIsSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const handleNewRecipe = () => {
    const newRecipe: Recipe = {
      id: `new-${Date.now()}`,
      name: "",
      servings: 1,
      notes: "",
      ingredients: [],
      createdAt: Date.now(),
      order: recipes.length,
    };
    setRecipes([...recipes, newRecipe]);
    setSelectedRecipeId(newRecipe.id);
    setViewMode("edit");
    // Close sidebar on mobile when creating new recipe
    setIsSidebarOpen(false);
  };

  const handleSaveRecipe = (updatedRecipe: Recipe) => {
    const isNew = updatedRecipe.id.startsWith("new-");
    
    let newRecipes: Recipe[];
    if (isNew) {
      // Replace temporary ID with permanent one
      const permanentRecipe = {
        ...updatedRecipe,
        id: `recipe-${Date.now()}`,
      };
      newRecipes = recipes.map((r) =>
        r.id === updatedRecipe.id ? permanentRecipe : r
      );
      setSelectedRecipeId(permanentRecipe.id);
    } else {
      newRecipes = recipes.map((r) =>
        r.id === updatedRecipe.id ? updatedRecipe : r
      );
    }

    setRecipes(newRecipes);
    saveRecipes(newRecipes);
    setViewMode("view");
  };

  const handleDeleteRecipe = () => {
    if (!selectedRecipeId) return;
    
    const newRecipes = recipes.filter((r) => r.id !== selectedRecipeId);
    setRecipes(newRecipes);
    saveRecipes(newRecipes);
    setSelectedRecipeId(null);
    setViewMode("empty");
  };

  const handleEditRecipe = () => {
    setViewMode("edit");
  };

  const handleCancelEdit = () => {
    if (selectedRecipe?.id.startsWith("new-")) {
      // Remove unsaved new recipe
      const newRecipes = recipes.filter((r) => r.id !== selectedRecipeId);
      setRecipes(newRecipes);
      setSelectedRecipeId(null);
      setViewMode("empty");
    } else {
      setViewMode("view");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader
        onToggleSidebar={handleToggleSidebar}
        onNewRecipe={handleNewRecipe}
        showNewButton={viewMode !== "empty"}
      />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50 w-80 flex-shrink-0 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block
        `}
      >
        <RecipeList
          recipes={recipes}
          selectedRecipeId={selectedRecipeId}
          onSelectRecipe={handleSelectRecipe}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0">
        {viewMode === "empty" && (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Welcome to FlavourVault
              </h2>
              <p className="text-muted-foreground mb-6">
                Start by creating your first recipe
              </p>
              <Button onClick={handleNewRecipe} size="lg">
                <Plus className="h-5 w-5 mr-2" />
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
        {viewMode === "edit" && selectedRecipe && (
          <RecipeEditForm
            recipe={selectedRecipe}
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
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;
