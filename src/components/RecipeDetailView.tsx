import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { ScalingControl } from "./ScalingControl";
import { TagDisplay } from "./TagDisplay";
import { FavouriteButton } from "./FavouriteButton";
import { toggleRecipeFavourite } from "@/lib/recipes";
import { useToast } from "@/hooks/use-toast";

interface RecipeDetailViewProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onRecipeUpdate?: (recipe: Recipe) => void;
}

export const RecipeDetailView = ({
  recipe,
  onEdit,
  onDelete,
  onRecipeUpdate,
}: RecipeDetailViewProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();

  // Reset scale when recipe changes
  useEffect(() => {
    setScale(1);
  }, [recipe.id]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const handleFavouriteToggle = async (isFavourite: boolean) => {
    try {
      const { data, error } = await toggleRecipeFavourite(recipe.id, isFavourite);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update favourite status",
          variant: "destructive",
        });
      } else if (data && onRecipeUpdate) {
        onRecipeUpdate(data);
        toast({
          title: isFavourite ? "Added to favourites" : "Removed from favourites",
          description: `${recipe.name} has been ${isFavourite ? 'added to' : 'removed from'} your favourites.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favourite status",
        variant: "destructive",
      });
    }
  };

  // Calculate scaled values
  const scaledServings = recipe.servings * scale;
  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    amount: ingredient.amount * scale
  }));
  return (
    <div className="h-full overflow-y-auto p-4 recipe-detail-mobile md:p-8 md:pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground break-words">
                {recipe.name}
              </h1>
              <FavouriteButton
                isFavourite={recipe.is_favourite}
                onToggle={handleFavouriteToggle}
                size="lg"
                variant="icon"
                className="[&>svg]:!h-6 [&>svg]:!w-6"
              />
            </div>
            {recipe.tags.length > 0 && (
              <TagDisplay
                tags={recipe.tags}
                className="mb-2"
              />
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={onEdit} variant="default" size="sm" className="md:size-default">
              Edit
            </Button>
            <Button onClick={handleDeleteClick} variant="destructive" size="sm" className="md:size-default">
              Delete
            </Button>
          </div>
        </div>

        <Card className="p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">
                SERVINGS
              </h2>
              <p className="text-xl md:text-2xl font-medium text-foreground">
                {scaledServings}
                {scale > 1 && (
                  <span className="text-xs md:text-sm text-muted-foreground ml-2 block sm:inline">
                    (originally {recipe.servings})
                  </span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0">
              <ScalingControl
                value={scale}
                onChange={handleScaleChange}
                min={1}
                max={10}
              />
            </div>
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

        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">
            Ingredients
          </h2>
          {recipe.ingredients.length === 0 ? (
            <p className="text-muted-foreground">No ingredients added</p>
          ) : (
            <div className="space-y-2">
              {scaledIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-3 border-b border-border last:border-0"
                >
                  <span className="flex-1 font-medium text-foreground text-sm md:text-base">
                    {ingredient.name}
                  </span>
                  <span className="text-muted-foreground text-sm md:text-base flex-shrink-0">
                    {ingredient.amount} {ingredient.unit}
                    {scale > 1 && (
                      <span className="text-xs text-muted-foreground/70 ml-1 block sm:inline">
                        (was {ingredient.amount / scale})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe"
        description="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};
