"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Clock, Play, AlertTriangle } from "lucide-react";

const taskCardVariants = cva(
  "healthcare-card transition-all duration-200 hover:shadow-md",
  {
    variants: {
      status: {
        pending: "border-l-4 border-l-primary bg-white",
        completed: "border-l-4 border-l-success bg-success/5",
        overdue: "border-l-4 border-l-destructive bg-destructive/5",
        in_progress: "border-l-4 border-l-warning bg-warning/5",
      },
      size: {
        default: "p-4",
        compact: "p-3",
        large: "p-6",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  }
);

interface TaskCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof taskCardVariants> {
  title: string;
  description?: string;
  type: 'pain_assessment' | 'exercise' | 'education' | 'walking' | 'medication' | 'form';
  progress?: number;
  onComplete?: () => void;
  onStart?: () => void;
  isCompleted?: boolean;
  dueTime?: string;
  icon?: React.ReactNode;
}

const TaskIcon = ({ type, isCompleted }: { type: TaskCardProps['type']; isCompleted?: boolean }) => {
  if (isCompleted) {
    return <Check className="w-5 h-5 text-success" />;
  }

  const iconClass = "w-5 h-5 text-primary";
  
  switch (type) {
    case 'pain_assessment':
      return <span className="text-lg">📊</span>;
    case 'exercise':
      return <span className="text-lg">💪</span>;
    case 'education':
      return <span className="text-lg">🎓</span>;
    case 'walking':
      return <span className="text-lg">🚶</span>;
    case 'medication':
      return <span className="text-lg">💊</span>;
    case 'form':
      return <span className="text-lg">📋</span>;
    default:
      return <Clock className={iconClass} />;
  }
};

export function TaskCard({
  className,
  status,
  size,
  title,
  description,
  type,
  progress,
  onComplete,
  onStart,
  isCompleted = false,
  dueTime,
  icon,
  ...props
}: TaskCardProps) {
  const cardStatus = isCompleted ? 'completed' : status;

  return (
    <div
      className={cn(taskCardVariants({ status: cardStatus, size }), className)}
      {...props}
    >
      <div className="flex items-start gap-4">
        {/* Task Icon */}
        <div className="flex-shrink-0 mt-1">
          {icon || <TaskIcon type={type} isCompleted={isCompleted} />}
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={cn(
              "font-semibold text-base leading-tight",
              isCompleted ? "text-success line-through" : "text-foreground"
            )}>
              {title}
            </h4>
            {dueTime && !isCompleted && (
              <span className="flex-shrink-0 text-sm text-muted-foreground">
                {dueTime}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {description}
            </p>
          )}

          {/* Progress Bar */}
          {progress !== undefined && progress > 0 && progress < 100 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isCompleted && (
            <div className="flex gap-2 flex-wrap">
              {onStart && (
                <Button
                  onClick={onStart}
                  variant="outline"
                  size="sm"
                  className="touch-target"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {type === 'exercise' ? 'Watch Video' : 
                   type === 'education' ? 'Start Learning' : 
                   'Begin'}
                </Button>
              )}
              {onComplete && (
                <Button
                  onClick={onComplete}
                  size="sm"
                  className="touch-target"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <Check className="w-4 h-4" />
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { taskCardVariants };