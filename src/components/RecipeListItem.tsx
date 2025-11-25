interface RecipeListItemProps {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const RecipeListItem = ({
  name,
  isSelected,
  onSelect,
}: RecipeListItemProps) => {
  return (
    <div
      className={`p-3 border-b border-border ${
        isSelected ? "bg-list-selected" : "bg-list-bg hover:bg-list-hover"
      } cursor-pointer transition-colors`}
      onClick={onSelect}
    >
      <span className="text-sm font-medium text-foreground">{name}</span>
    </div>
  );
};
