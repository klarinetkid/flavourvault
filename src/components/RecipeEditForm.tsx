import { useState } from "react";
import { Recipe, Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IngredientRow } from "./IngredientRow";
import { Plus } from "lucide-react";

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

  const handleMoveIngredient = (index: number, direction: "up" | "down") => {
    const newIngredients = [...editedRecipe.ingredients];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newIngredients[index], newIngredients[targetIndex]] = [
      newIngredients[targetIndex],
      newIngredients[index],
    ];
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedRecipe);
  };

  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">
          {recipe.id.startsWith("new-") ? "New Recipe" : "Edit Recipe"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
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
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Ingredients</h2>
              <Button
                type="button"
                onClick={handleAddIngredient}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-2">
              {editedRecipe.ingredients.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No ingredients yet. Click "Add Ingredient" to start.
                </p>
              ) : (
                editedRecipe.ingredients.map((ingredient, index) => (
                  <IngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    onUpdate={(updated) => handleUpdateIngredient(index, updated)}
                    onDelete={() => handleDeleteIngredient(index)}
                    onMoveUp={() => handleMoveIngredient(index, "up")}
                    onMoveDown={() => handleMoveIngredient(index, "down")}
                    canMoveUp={index > 0}
                    canMoveDown={index < editedRecipe.ingredients.length - 1}
                  />
                ))
              )}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" size="lg">
              Save Recipe
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
