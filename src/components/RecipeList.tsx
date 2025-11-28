import { useState, useEffect, useMemo } from "react";
import { Recipe } from "@/types/recipe";
import { RecipeListItem } from "./RecipeListItem";
import { FilterPanel } from "./FilterPanel";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRecipeFilters } from "@/hooks/useRecipeFilters";
import { getUserTags, toggleRecipeFavourite } from "@/lib/recipes";
import { useToast } from "@/hooks/use-toast";

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipeId: string | null;
  onSelectRecipe: (id: string) => void;
  onRecipeUpdate?: (recipe: Recipe) => void;
}

export const RecipeList = ({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  onRecipeUpdate,
}: RecipeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { filters, updateFilter, updateFilters } = useRecipeFilters();
  const { toast } = useToast();

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      const { data, error } = await getUserTags();
      if (error) {
        console.error('Failed to load tags:', error);
      } else {
        setAvailableTags(data || []);
      }
    };
    loadTags();
  }, [recipes]); // Reload when recipes change

  // Handle favourite toggle
  const handleFavouriteToggle = async (recipe: Recipe, isFavourite: boolean) => {
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

  // Apply filters to recipes
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Apply search term filter
    const searchQuery = searchTerm.toLowerCase();
    if (searchQuery) {
      result = result.filter(recipe => {
        const nameMatch = recipe.name.toLowerCase().includes(searchQuery);
        const ingredientMatch = filters.searchInIngredients &&
          recipe.ingredients.some(ingredient =>
            ingredient.name.toLowerCase() === searchQuery
          );
        return nameMatch || ingredientMatch;
      });
    }

    // Apply favourite filter
    if (filters.showFavouritesOnly) {
      result = result.filter(recipe => recipe.is_favourite);
    }

    // Apply tag filters (OR logic)
    if (filters.selectedTags.length > 0) {
      result = result.filter(recipe =>
        filters.selectedTags.some(tag => recipe.tags.includes(tag))
      );
    }

    // Sort by name
    return result.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }, [recipes, searchTerm, filters]);

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Search is already applied via filteredRecipes
      e.currentTarget.blur();
    }
  };

  const hasActiveFilters = filters.selectedTags.length > 0 ||
    filters.showFavouritesOnly ||
    filters.searchInIngredients;

  return (
    <div className="h-screen flex flex-col bg-list-bg border-r border-border">
      <div className="p-4 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground mb-4">FlavourVault</h1>
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={filters.searchInIngredients ? "Search recipes and ingredients..." : "Search recipes..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 pr-20"
            />
          </div>

          {/* Filter Panel */}
          <div className="flex justify-end">
            <FilterPanel
              isOpen={isFilterPanelOpen}
              onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              filters={filters}
              onFiltersChange={updateFilters}
              availableTags={availableTags}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRecipes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searchTerm || hasActiveFilters ? "No recipes found" : "No recipes yet"}
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              isSelected={recipe.id === selectedRecipeId}
              onSelect={() => onSelectRecipe(recipe.id)}
              onFavouriteToggle={(isFavourite) => handleFavouriteToggle(recipe, isFavourite)}
            />
          ))
        )}
      </div>
    </div>
  );
};
