import * as React from "react";
import { Info, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  className?: string;
  icon?: "info" | "help";
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoTooltip({ 
  content, 
  className, 
  icon = "info",
  side = "top" 
}: InfoTooltipProps) {
  const Icon = icon === "info" ? Info : HelpCircle;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={cn("h-4 w-4 text-muted-foreground cursor-help", className)} />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}