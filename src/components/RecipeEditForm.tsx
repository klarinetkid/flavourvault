import { useState, useEffect } from "react";
import { Recipe, Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DraggableIngredientList } from "./DraggableIngredientList";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { TagInput } from "./TagInput";
import { getUserTags } from "@/lib/recipes";

interface RecipeEditFormProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export const RecipeEditForm = ({
  recipe,
  onSave,
  onCancel,
}: RecipeEditFormProps) => {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      const { data, error } = await getUserTags();
      if (!error && data) {
        setAvailableTags(data);
      }
    };
    loadTags();
  }, []);

  // Check if there are unsaved changes
  const hasChanges = () => {
    return (
      editedRecipe.name !== recipe.name ||
      editedRecipe.servings !== recipe.servings ||
      editedRecipe.notes !== recipe.notes ||
      JSON.stringify(editedRecipe.ingredients) !== JSON.stringify(recipe.ingredients) ||
      JSON.stringify(editedRecipe.tags) !== JSON.stringify(recipe.tags)
    );
  };

  const handleCancelClick = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleCancelConfirm = () => {
    onCancel();
  };

  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: `ingredient-${Date.now()}`,
      name: "",
      amount: 0,
      unit: "",
    };
    setEditedRecipe({
      ...editedRecipe,
      ingredients: [...editedRecipe.ingredients, newIngredient],
    });
  };

  const handleUpdateIngredient = (index: number, ingredient: Ingredient) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = ingredient;
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const handleDeleteIngredient = (index: number) => {
    const newIngredients = editedRecipe.ingredients.filter((_, i) => i !== index);
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const handleReorderIngredients = (reorderedIngredients: Ingredient[]) => {
    setEditedRecipe({ ...editedRecipe, ingredients: reorderedIngredients });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedRecipe);
  };

  return (
    <div className="h-full overflow-y-auto p-4 recipe-detail-mobile md:p-8 md:pt-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
          {recipe.id.startsWith("new-") ? "New Recipe" : "Edit Recipe"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  RECIPE NAME
                </label>
                <Input
                  type="text"
                  value={editedRecipe.name}
                  onChange={(e) =>
                    setEditedRecipe({ ...editedRecipe, name: e.target.value })
                  }
                  placeholder="Enter recipe name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  SERVINGS
                </label>
                <Input
                  type="number"
                  value={editedRecipe.servings}
                  onChange={(e) =>
                    setEditedRecipe({
                      ...editedRecipe,
                      servings: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Number of servings"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  NOTES
                </label>
                <Textarea
                  value={editedRecipe.notes}
                  onChange={(e) =>
                    setEditedRecipe({ ...editedRecipe, notes: e.target.value })
                  }
                  placeholder="Add any notes or instructions..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  TAGS
                </label>
                <TagInput
                  tags={editedRecipe.tags}
                  onChange={(tags) => setEditedRecipe({ ...editedRecipe, tags })}
                  availableTags={availableTags}
                  maxTags={5}
                  placeholder="Add a tag..."
                />
              </div>

            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">Ingredients</h2>
            </div>

            <DraggableIngredientList
              ingredients={editedRecipe.ingredients}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onReorderIngredients={handleReorderIngredients}
              onAddIngredient={handleAddIngredient}
            />
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Save Recipe
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleCancelClick} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelConfirm}
        title="Discard Changes"
        description="Are you sure you want to discard changes? All unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="destructive"
      />
    </div>
  );
};
