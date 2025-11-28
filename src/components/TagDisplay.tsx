import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagDisplayProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const TagDisplay = ({ 
  tags, 
  onTagClick, 
  variant = 'default',
  className 
}: TagDisplayProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-wrap gap-1",
      variant === 'compact' ? "gap-1" : "gap-2",
      className
    )}>
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className={cn(
            "text-xs font-medium",
            variant === 'compact' ? "px-2 py-0.5 text-xs" : "px-2 py-1",
            onTagClick && "cursor-pointer hover:bg-secondary/80 transition-colors"
          )}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
};