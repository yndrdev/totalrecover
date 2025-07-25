"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PainScaleProps {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
  showLabels?: boolean;
  size?: 'default' | 'large';
}

const painLabels = {
  0: "No Pain",
  1: "Very Mild",
  2: "Mild", 
  3: "Mild",
  4: "Moderate",
  5: "Moderate",
  6: "Moderate",
  7: "Severe",
  8: "Severe",
  9: "Very Severe",
  10: "Worst Possible"
};

const painEmojis = {
  0: "😊",
  1: "🙂", 
  2: "😐",
  3: "😐",
  4: "😕",
  5: "😟",
  6: "😣",
  7: "😖",
  8: "😰",
  9: "😩",
  10: "😱"
};

const painColors = {
  0: "bg-success hover:bg-success/90 border-success text-white",
  1: "bg-success hover:bg-success/90 border-success text-white",
  2: "bg-success hover:bg-success/90 border-success text-white",
  3: "bg-warning/70 hover:bg-warning/80 border-warning text-white",
  4: "bg-warning hover:bg-warning/90 border-warning text-white",
  5: "bg-warning hover:bg-warning/90 border-warning text-white",
  6: "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white",
  7: "bg-destructive/80 hover:bg-destructive/90 border-destructive text-white",
  8: "bg-destructive hover:bg-destructive/90 border-destructive text-white",
  9: "bg-destructive hover:bg-destructive/90 border-destructive text-white",
  10: "bg-red-600 hover:bg-red-700 border-red-600 text-white"
};

export function PainScale({
  value,
  onChange,
  className,
  disabled = false,
  showLabels = true,
  size = 'default'
}: PainScaleProps) {
  const [selectedValue, setSelectedValue] = React.useState<number | undefined>(value);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = (painLevel: number) => {
    if (disabled) return;
    
    setSelectedValue(painLevel);
    onChange?.(painLevel);
  };

  const buttonSize = size === 'large' ? 'h-16 w-16 text-lg' : 'h-12 w-12 text-base';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Scale Description */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          How would you rate your pain?
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a number from 0 (no pain) to 10 (worst possible pain)
        </p>
      </div>

      {/* Pain Scale Buttons */}
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 justify-items-center">
        {Array.from({ length: 11 }, (_, i) => i).map((level) => {
          const isSelected = selectedValue === level;
          const colorClass = isSelected ? painColors[level as keyof typeof painColors] : '';
          
          return (
            <div key={level} className="flex flex-col items-center gap-1">
              <Button
                onClick={() => handleSelect(level)}
                disabled={disabled}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  buttonSize,
                  "touch-target rounded-lg font-semibold transition-all duration-200",
                  "border-2 hover:scale-105 active:scale-95",
                  !isSelected && "hover:border-primary hover:bg-primary/5",
                  isSelected && colorClass,
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs sm:text-sm">{painEmojis[level as keyof typeof painEmojis]}</span>
                  <span className="font-bold">{level}</span>
                </div>
              </Button>
              
              {/* Labels for mobile - only show for selected or key values */}
              {showLabels && (isSelected || level === 0 || level === 5 || level === 10) && (
                <span className="text-xs text-muted-foreground text-center leading-tight max-w-[4rem]">
                  {painLabels[level as keyof typeof painLabels]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Value Display */}
      {selectedValue !== undefined && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{painEmojis[selectedValue as keyof typeof painEmojis]}</span>
            <div className="text-left">
              <div className="font-semibold text-lg">
                Pain Level: {selectedValue}/10
              </div>
              <div className="text-sm text-muted-foreground">
                {painLabels[selectedValue as keyof typeof painLabels]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• 0-3: Mild pain that doesn&apos;t interfere with daily activities</p>
        <p>• 4-6: Moderate pain that may limit some activities</p>
        <p>• 7-10: Severe pain that significantly limits daily activities</p>
      </div>
    </div>
  );
}