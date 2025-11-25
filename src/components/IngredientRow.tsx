import { Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

interface IngredientRowProps {
  ingredient: Ingredient;
  onUpdate: (ingredient: Ingredient) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const IngredientRow = ({
  ingredient,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: IngredientRowProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
      <Input
        type="text"
        placeholder="Ingredient name"
        value={ingredient.name}
        onChange={(e) =>
          onUpdate({ ...ingredient, name: e.target.value })
        }
        className="flex-1"
      />
      <Input
        type="number"
        placeholder="Amount"
        value={ingredient.amount || ""}
        onChange={(e) =>
          onUpdate({ ...ingredient, amount: parseFloat(e.target.value) || 0 })
        }
        className="w-24"
      />
      <Input
        type="text"
        placeholder="Unit"
        value={ingredient.unit}
        onChange={(e) =>
          onUpdate({ ...ingredient, unit: e.target.value })
        }
        className="w-24"
      />
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onMoveUp}
          disabled={!canMoveUp}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onMoveDown}
          disabled={!canMoveDown}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
