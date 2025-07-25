import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        // Recovery day status variants
        preOp: "bg-orange-100 text-orange-800",
        surgeryDay: "bg-red-100 text-red-800",
        earlyRecovery: "bg-blue-100 text-blue-800",
        established: "bg-green-100 text-green-800",
        
        // Task status variants
        pending: "bg-gray-100 text-gray-800",
        inProgress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        overdue: "bg-red-100 text-red-800",
        
        // Health status variants
        excellent: "bg-green-100 text-green-800",
        good: "bg-blue-100 text-blue-800",
        fair: "bg-yellow-100 text-yellow-800",
        poor: "bg-red-100 text-red-800",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "pending",
      size: "md",
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  label?: string;
}

const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, variant, size, label, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusIndicatorVariants({ variant, size, className }))}
        {...props}
      >
        {children || label}
      </span>
    );
  }
);
StatusIndicator.displayName = "StatusIndicator";

// Recovery Day Status Component
export interface RecoveryDayStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  day: number;
  size?: "sm" | "md" | "lg";
}

const RecoveryDayStatus = React.forwardRef<HTMLSpanElement, RecoveryDayStatusProps>(
  ({ day, size = "md", className, ...props }, ref) => {
    const getVariant = () => {
      if (day < 0) return "preOp";
      if (day === 0) return "surgeryDay";
      if (day <= 30) return "earlyRecovery";
      return "established";
    };

    const label = day < 0 ? `Pre-Op Day ${Math.abs(day)}` : `Day ${day}`;

    return (
      <StatusIndicator
        ref={ref}
        variant={getVariant()}
        size={size}
        label={label}
        className={className}
        {...props}
      />
    );
  }
);
RecoveryDayStatus.displayName = "RecoveryDayStatus";

export { StatusIndicator, RecoveryDayStatus, statusIndicatorVariants };