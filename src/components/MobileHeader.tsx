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
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-border bg-card md:hidden">
      {/* Left: Hamburger Menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="h-8 w-8 flex-shrink-0"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Center: App Title */}
      <h1 className="text-xl font-bold text-foreground absolute left-1/2 transform -translate-x-1/2">
        FlavourVault
      </h1>
      
      {/* Right: New Button */}
      <div className="flex-shrink-0">
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
    </div>
  );
};