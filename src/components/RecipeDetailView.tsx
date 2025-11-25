import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecipeDetailViewProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
}

export const RecipeDetailView = ({
  recipe,
  onEdit,
  onDelete,
}: RecipeDetailViewProps) => {
  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">{recipe.name}</h1>
          <div className="flex gap-2">
            <Button onClick={onEdit} variant="default">
              Edit
            </Button>
            <Button onClick={onDelete} variant="destructive">
              Delete
            </Button>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-1">
              SERVINGS
            </h2>
            <p className="text-2xl font-medium text-foreground">
              {recipe.servings}
            </p>
          </div>

          {recipe.notes && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                NOTES
              </h2>
              <p className="text-foreground whitespace-pre-wrap">
                {recipe.notes}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Ingredients
          </h2>
          {recipe.ingredients.length === 0 ? (
            <p className="text-muted-foreground">No ingredients added</p>
          ) : (
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <span className="flex-1 font-medium text-foreground">
                    {ingredient.name}
                  </span>
                  <span className="text-muted-foreground">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
