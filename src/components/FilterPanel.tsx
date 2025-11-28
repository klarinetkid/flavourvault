import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filter, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeFilters } from "@/types/recipe";

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  availableTags: string[];
  className?: string;
}

export const FilterPanel = ({ 
  isOpen, 
  onToggle, 
  filters, 
  onFiltersChange, 
  availableTags,
  className 
}: FilterPanelProps) => {
  const [tagInput, setTagInput] = useState("");

  const updateFilter = (key: keyof RecipeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.selectedTags.includes(tag)) {
      updateFilter('selectedTags', [...filters.selectedTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFilter('selectedTags', filters.selectedTags.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      selectedTags: [],
      showFavouritesOnly: false,
      searchInIngredients: false,
    });
    setTagInput("");
  };

  const hasActiveFilters = 
    filters.selectedTags.length > 0 || 
    filters.showFavouritesOnly || 
    filters.searchInIngredients;

  const filteredAvailableTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
    !filters.selectedTags.includes(tag)
  );

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput.trim());
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Filter Toggle Button - Icon Only */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className={cn(
          "relative",
          hasActiveFilters && "border-primary text-primary"
        )}
        title="Filters"
      >
        <Filter className="h-4 w-4" />
        {hasActiveFilters && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {filters.selectedTags.length + (filters.showFavouritesOnly ? 1 : 0) + (filters.searchInIngredients ? 1 : 0)}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="fixed top-16 left-0 z-50 w-80 p-4 shadow-lg">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Search Options</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-ingredients"
                  checked={filters.searchInIngredients}
                  onCheckedChange={(checked) => 
                    updateFilter('searchInIngredients', checked)
                  }
                />
                <label 
                  htmlFor="search-ingredients" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Search in ingredients (exact match)
                </label>
              </div>
            </div>

            {/* Favourites Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Favourites</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favourites-only"
                  checked={filters.showFavouritesOnly}
                  onCheckedChange={(checked) => 
                    updateFilter('showFavouritesOnly', checked)
                  }
                />
                <label 
                  htmlFor="favourites-only" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show favourites only
                </label>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Tags</h4>
              
              {/* Selected Tags */}
              {filters.selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.selectedTags.map((tag, index) => (
                    <Badge key={index} variant="default" className="gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="pl-9"
                  />
                </div>

                {/* Tag Suggestions */}
                {tagInput && filteredAvailableTags.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-md shadow-md max-h-32 overflow-y-auto">
                    {filteredAvailableTags.slice(0, 8).map((tag, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </Card>
      )}
    </div>
  );
};