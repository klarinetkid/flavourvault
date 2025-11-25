import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ScalingControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const ScalingControl = ({
  value,
  onChange,
  min = 1,
  max = 10,
}: ScalingControlProps) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground">
        SCALE
      </span>
      <div className="flex items-center gap-1 border border-border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
          {value}x
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};