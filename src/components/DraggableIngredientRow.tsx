import { Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableIngredientRowProps {
  ingredient: Ingredient;
  onUpdate: (ingredient: Ingredient) => void;
  onDelete: () => void;
}

export const DraggableIngredientRow = ({
  ingredient,
  onUpdate,
  onDelete,
}: DraggableIngredientRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ingredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-muted rounded-md p-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted-foreground/10 rounded flex-shrink-0"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(e) =>
              onUpdate({ ...ingredient, name: e.target.value })
            }
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 pl-8">
          <Input
            type="number"
            placeholder="Amount"
            value={ingredient.amount || ""}
            onChange={(e) =>
              onUpdate({ ...ingredient, amount: parseFloat(e.target.value) || 0 })
            }
            className="flex-1"
          />
          <Input
            type="text"
            placeholder="Unit"
            value={ingredient.unit}
            onChange={(e) =>
              onUpdate({ ...ingredient, unit: e.target.value })
            }
            className="flex-1"
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted-foreground/10 rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
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