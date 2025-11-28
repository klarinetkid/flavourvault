import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  isFavourite: boolean;
  onToggle: (isFavourite: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

export const FavouriteButton = ({ 
  isFavourite, 
  onToggle, 
  disabled = false,
  size = 'md',
  variant = 'icon',
  className 
}: FavouriteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle(!isFavourite);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  if (variant === 'button') {
    return (
      <Button
        variant={isFavourite ? "default" : "outline"}
        size={size === 'md' ? 'default' : size}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn("gap-2", className)}
      >
        <Star
          className={cn(
            iconSizes[size],
            isFavourite ? "fill-current" : ""
          )}
        />
        {isFavourite ? "Favourited" : "Add to Favourites"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        sizeClasses[size],
        "hover:bg-transparent",
        className
      )}
      title={isFavourite ? "Remove from favourites" : "Add to favourites"}
    >
      <Star 
        className={cn(
          iconSizes[size],
          "transition-colors",
          isFavourite 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-muted-foreground hover:text-yellow-400"
        )} 
      />
    </Button>
  );
};