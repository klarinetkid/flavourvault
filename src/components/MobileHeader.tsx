import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  onNewRecipe: () => void;
  showNewButton?: boolean;
}

export const MobileHeader = ({
  onToggleSidebar,
  onNewRecipe,
  showNewButton = true,
}: MobileHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card md:hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">FlavourVault</h1>
      </div>
      {showNewButton && (
        <Button
          onClick={onNewRecipe}
          size="sm"
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      )}
    </div>
  );
};