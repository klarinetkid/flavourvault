import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { FavouriteButton } from "./FavouriteButton";
import { TagDisplay } from "./TagDisplay";

interface RecipeListItemProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: () => void;
  onFavouriteToggle: (isFavourite: boolean) => void;
}

export const RecipeListItem = ({
  recipe,
  isSelected,
  onSelect,
  onFavouriteToggle,
}: RecipeListItemProps) => {
  const [optimisticFavourite, setOptimisticFavourite] = useState(recipe.is_favourite);

  // Sync optimistic state when recipe changes
  useEffect(() => {
    setOptimisticFavourite(recipe.is_favourite);
  }, [recipe.is_favourite]);

  const handleFavouriteToggle = async (isFavourite: boolean) => {
    // Optimistic update - update UI immediately
    setOptimisticFavourite(isFavourite);
    
    try {
      await onFavouriteToggle(isFavourite);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFavourite(!isFavourite);
    }
  };
  return (
    <div
      className={`p-3 border-b border-border ${
        isSelected ? "bg-list-selected" : "bg-list-bg hover:bg-list-hover"
      } cursor-pointer transition-colors`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground truncate">
              {recipe.name}
            </span>
            {optimisticFavourite && (
              <FavouriteButton
                isFavourite={optimisticFavourite}
                onToggle={handleFavouriteToggle}
                size="sm"
                variant="icon"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
