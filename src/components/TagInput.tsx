import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

export const TagInput = ({ 
  tags, 
  onChange, 
  availableTags = [],
  maxTags = 5,
  placeholder = "Add a tag...",
  className 
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Defensive programming: ensure tags is always an array
  const safeTags = tags || [];

  const filteredSuggestions = availableTags.filter(tag =>
    tag.toLowerCase().includes(inputValue.toLowerCase()) &&
    !safeTags.includes(tag)
  );

  const canAddMoreTags = safeTags.length < maxTags;

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !safeTags.includes(trimmedTag) && canAddMoreTags) {
      onChange([...safeTags, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(safeTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && safeTags.length > 0) {
      removeTag(safeTags[safeTags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
  };

  const handleInputFocus = () => {
    if (inputValue && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Display existing tags */}
      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {safeTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
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

      {/* Input field */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={canAddMoreTags ? placeholder : `Maximum ${maxTags} tags reached`}
            disabled={!canAddMoreTags}
            className="flex-1"
          />
          {inputValue.trim() && canAddMoreTags && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag(inputValue)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
            {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag count indicator */}
      <div className="text-xs text-muted-foreground">
        {safeTags.length}/{maxTags} tags
      </div>
    </div>
  );
};