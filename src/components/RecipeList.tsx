import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { RecipeListItem } from "./RecipeListItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipeId: string | null;
  onSelectRecipe: (id: string) => void;
}

export const RecipeList = ({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
}: RecipeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecipes = recipes
    .filter((recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

  return (
    <div className="h-screen flex flex-col bg-list-bg border-r border-border">
      <div className="p-4 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground mb-4">FlavourVault</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredRecipes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searchTerm ? "No recipes found" : "No recipes yet"}
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeListItem
              key={recipe.id}
              name={recipe.name}
              isSelected={recipe.id === selectedRecipeId}
              onSelect={() => onSelectRecipe(recipe.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
