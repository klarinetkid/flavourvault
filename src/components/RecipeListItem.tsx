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
            <FavouriteButton
              isFavourite={recipe.is_favourite}
              onToggle={onFavouriteToggle}
              size="sm"
              variant="icon"
            />
          </div>
          {recipe.tags.length > 0 && (
            <TagDisplay
              tags={recipe.tags}
              variant="compact"
              className="mt-1"
            />
          )}
        </div>
      </div>
    </div>
  );
};
