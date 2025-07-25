import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    label, 
    showValue = true, 
    variant = "default",
    size = "md",
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const getVariantClasses = () => {
      switch (variant) {
        case "success":
          return "bg-[#059669]";
        case "warning":
          return "bg-[#ea580c]";
        case "danger":
          return "bg-[#dc2626]";
        default:
          return "bg-[#2563eb]";
      }
    };
    
    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-2";
        case "lg":
          return "h-6";
        default:
          return "h-4";
      }
    };

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${value} of ${max}`}
        {...props}
      >
        {label && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {showValue && (
              <span className="text-sm font-medium text-gray-600">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          getSizeClasses()
        )}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              getVariantClasses()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

// Recovery Progress Component
export interface RecoveryProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDay: number;
  totalDays: number;
  milestones?: Array<{
    day: number;
    label: string;
    completed: boolean;
  }>;
}

const RecoveryProgress = React.forwardRef<HTMLDivElement, RecoveryProgressProps>(
  ({ currentDay, totalDays, milestones, className, ...props }, ref) => {
    const percentage = (currentDay / totalDays) * 100;
    
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recovery Progress</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Day {currentDay} of {totalDays}</span>
            <span className="text-sm font-medium text-[#2563eb]">
              {Math.round(percentage)}% Complete
            </span>
          </div>
          <ProgressBar
            value={currentDay}
            max={totalDays}
            showValue={false}
            variant={currentDay >= totalDays ? "success" : "default"}
          />
        </div>
        
        {milestones && milestones.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  milestone.completed ? "bg-[#059669]" : "bg-gray-300"
                )}>
                  {milestone.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={cn(
                  "text-sm",
                  milestone.completed ? "text-gray-900" : "text-gray-500"
                )}>
                  Day {milestone.day}: {milestone.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
RecoveryProgress.displayName = "RecoveryProgress";

// Health Metric Progress Component
export interface HealthMetricProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  metric: string;
  value: number;
  target: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
}

const HealthMetricProgress = React.forwardRef<HTMLDivElement, HealthMetricProgressProps>(
  ({ metric, value, target, unit = "", trend, className, ...props }, ref) => {
    const percentage = (value / target) * 100;
    const isAtTarget = percentage >= 100;
    
    const getTrendIcon = () => {
      if (!trend) return null;
      
      switch (trend) {
        case "up":
          return (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414l-5.293 5.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          );
        case "down":
          return (
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        default:
          return (
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          );
      }
    };
    
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{metric}</span>
          <div className="flex items-center space-x-2">
            {trend && getTrendIcon()}
            <span className="text-sm font-semibold text-gray-900">
              {value}{unit} / {target}{unit}
            </span>
          </div>
        </div>
        <ProgressBar
          value={value}
          max={target}
          showValue={false}
          variant={isAtTarget ? "success" : percentage >= 75 ? "warning" : "default"}
          size="sm"
        />
      </div>
    );
  }
);
HealthMetricProgress.displayName = "HealthMetricProgress";

export { ProgressBar, RecoveryProgress, HealthMetricProgress };