import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { loadRecipes, saveRecipes } from "@/lib/localStorage";
import { RecipeList } from "@/components/RecipeList";
import { RecipeDetailView } from "@/components/RecipeDetailView";
import { RecipeEditForm } from "@/components/RecipeEditForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ViewMode = "empty" | "view" | "edit";

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("empty");

  useEffect(() => {
    const loadedRecipes = loadRecipes();
    setRecipes(loadedRecipes);
  }, []);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    setViewMode("view");
  };

  const handleReorderRecipe = (id: string, direction: "up" | "down") => {
    const currentIndex = recipes.findIndex((r) => r.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= recipes.length) return;

    const newRecipes = [...recipes];
    [newRecipes[currentIndex], newRecipes[targetIndex]] = [
      newRecipes[targetIndex],
      newRecipes[currentIndex],
    ];

    // Update order values
    newRecipes.forEach((recipe, index) => {
      recipe.order = index;
    });

    setRecipes(newRecipes);
    saveRecipes(newRecipes);
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
      <div className="w-80 flex-shrink-0">
        <RecipeList
          recipes={recipes}
          selectedRecipeId={selectedRecipeId}
          onSelectRecipe={handleSelectRecipe}
          onReorderRecipe={handleReorderRecipe}
        />
      </div>
      <div className="flex-1">
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
      {viewMode !== "empty" && (
        <Button
          onClick={handleNewRecipe}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;
