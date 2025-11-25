import { Ingredient } from "@/types/recipe";
import { DraggableIngredientRow } from "./DraggableIngredientRow";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

interface DraggableIngredientListProps {
  ingredients: Ingredient[];
  onUpdateIngredient: (index: number, ingredient: Ingredient) => void;
  onDeleteIngredient: (index: number) => void;
  onReorderIngredients: (ingredients: Ingredient[]) => void;
}

export const DraggableIngredientList = ({
  ingredients,
  onUpdateIngredient,
  onDeleteIngredient,
  onReorderIngredients,
}: DraggableIngredientListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = ingredients.findIndex((item) => item.id === active.id);
      const newIndex = ingredients.findIndex((item) => item.id === over.id);

      const reorderedIngredients = arrayMove(ingredients, oldIndex, newIndex);
      onReorderIngredients(reorderedIngredients);
    }
  };

  if (ingredients.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No ingredients yet. Click "Add Ingredient" to start.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={ingredients.map((ingredient) => ingredient.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <DraggableIngredientRow
              key={ingredient.id}
              ingredient={ingredient}
              onUpdate={(updated) => onUpdateIngredient(index, updated)}
              onDelete={() => onDeleteIngredient(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};