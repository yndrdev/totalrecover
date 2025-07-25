"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TaskMetadata, MissedTaskRecoveryProps } from '@/types/chat';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  X, 
  ExternalLink,
  Play,
  FileText,
  Pill,
  Activity,
  Calendar,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/design-system/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

{/* <thinking>
Healthcare Context: Missed task recovery component for patient compliance
- Update to use new design system components and colors
- Maintain clear visual hierarchy for task importance
- Use healthcare-appropriate success/warning colors
- Ensure accessibility for patient interaction
</thinking> */}

interface MissedTaskRecoveryState {
  completing: Set<string>;
  completed: Set<string>;
  dismissed: Set<string>;
  loading: boolean;
  error: string | null;
}

export default function MissedTaskRecovery({
  missedTasks,
  recoveryDay,
  onCompleteTask,
  onDismissTask
}: MissedTaskRecoveryProps) {
  const supabase = createClient();
  
  const [state, setState] = useState<MissedTaskRecoveryState>({
    completing: new Set(),
    completed: new Set(),
    dismissed: new Set(),
    loading: false,
    error: null
  });

  // Filter out dismissed and completed tasks
  const visibleTasks = missedTasks.filter(
    task => !state.dismissed.has(task.task_id) && !state.completed.has(task.task_id)
  );

  // Group tasks by importance
  const criticalTasks = visibleTasks.filter(task => task.importance === 'critical');
  const highTasks = visibleTasks.filter(task => task.importance === 'high');
  const mediumTasks = visibleTasks.filter(task => task.importance === 'medium');
  const lowTasks = visibleTasks.filter(task => task.importance === 'low');

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    setState(prev => ({
      ...prev,
      completing: new Set([...prev.completing, taskId]),
      error: null
    }));

    try {
      // Call parent handler
      await onCompleteTask(taskId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        completing: new Set([...prev.completing].filter(id => id !== taskId)),
        completed: new Set([...prev.completed, taskId])
      }));

      // Show success message briefly
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          completed: new Set([...prev.completed].filter(id => id !== taskId))
        }));
      }, 3000);

    } catch (error) {
      console.error('Error completing task:', error);
      setState(prev => ({
        ...prev,
        completing: new Set([...prev.completing].filter(id => id !== taskId)),
        error: 'Failed to complete task. Please try again.'
      }));
    }
  };

  // Handle task dismissal
  const handleDismissTask = async (taskId: string) => {
    try {
      await onDismissTask(taskId);
      setState(prev => ({
        ...prev,
        dismissed: new Set([...prev.dismissed, taskId])
      }));
    } catch (error) {
      console.error('Error dismissing task:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to dismiss task. Please try again.'
      }));
    }
  };

  // Get task icon based on type
  const getTaskIcon = (taskType: TaskMetadata['task_type']) => {
    switch (taskType) {
      case 'exercise':
        return <Activity className="h-4 w-4" />;
      case 'medication':
        return <Pill className="h-4 w-4" />;
      case 'form':
        return <FileText className="h-4 w-4" />;
      case 'check_in':
        return <CheckCircle className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get importance color
  const getImportanceColor = (importance: TaskMetadata['importance']) => {
    switch (importance) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Calculate completion progress
  const totalTasks = missedTasks.length;
  const completedCount = state.completed.size;
  const dismissedCount = state.dismissed.size;
  const progressPercentage = totalTasks > 0 ? ((completedCount + dismissedCount) / totalTasks) * 100 : 0;

  if (visibleTasks.length === 0 && missedTasks.length > 0) {
    return (
      <Card variant="success" className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">All missed tasks addressed!</p>
              <p className="text-sm text-green-600">
                Great job catching up on your recovery activities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <Card variant="warning" className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">
                  Missed Tasks - Day {recoveryDay}
                </h3>
                <p className="text-sm text-orange-700">
                  Complete these important recovery activities
                </p>
              </div>
            </div>
          </div>
          
          {totalTasks > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Progress</span>
                <span className="text-orange-700">
                  {completedCount + dismissedCount} of {totalTasks}
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-orange-200"
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Error alert */}
      {state.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Critical tasks */}
      {criticalTasks.length > 0 && (
        <TaskSection
          title="Critical Tasks"
          description="These tasks are essential for your recovery"
          tasks={criticalTasks}
          onComplete={handleCompleteTask}
          onDismiss={handleDismissTask}
          completing={state.completing}
          getTaskIcon={getTaskIcon}
          getImportanceColor={getImportanceColor}
        />
      )}

      {/* High priority tasks */}
      {highTasks.length > 0 && (
        <TaskSection
          title="High Priority Tasks"
          description="Important activities for your recovery progress"
          tasks={highTasks}
          onComplete={handleCompleteTask}
          onDismiss={handleDismissTask}
          completing={state.completing}
          getTaskIcon={getTaskIcon}
          getImportanceColor={getImportanceColor}
        />
      )}

      {/* Medium priority tasks */}
      {mediumTasks.length > 0 && (
        <TaskSection
          title="Medium Priority Tasks"
          description="Helpful activities for your recovery"
          tasks={mediumTasks}
          onComplete={handleCompleteTask}
          onDismiss={handleDismissTask}
          completing={state.completing}
          getTaskIcon={getTaskIcon}
          getImportanceColor={getImportanceColor}
        />
      )}

      {/* Low priority tasks */}
      {lowTasks.length > 0 && (
        <TaskSection
          title="Low Priority Tasks"
          description="Optional activities when you have time"
          tasks={lowTasks}
          onComplete={handleCompleteTask}
          onDismiss={handleDismissTask}
          completing={state.completing}
          getTaskIcon={getTaskIcon}
          getImportanceColor={getImportanceColor}
        />
      )}

      {/* Information about task completion */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Recovery tip:</strong> Completing missed tasks helps ensure your recovery stays on track. 
          Your care team will be notified when you complete these activities.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Task Section Component
interface TaskSectionProps {
  title: string;
  description: string;
  tasks: TaskMetadata[];
  onComplete: (taskId: string) => void;
  onDismiss: (taskId: string) => void;
  completing: Set<string>;
  getTaskIcon: (taskType: TaskMetadata['task_type']) => React.ReactNode;
  getImportanceColor: (importance: TaskMetadata['importance']) => string;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  description,
  tasks,
  onComplete,
  onDismiss,
  completing,
  getTaskIcon,
  getImportanceColor
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.task_id}
            task={task}
            onComplete={onComplete}
            onDismiss={onDismiss}
            isCompleting={completing.has(task.task_id)}
            getTaskIcon={getTaskIcon}
            getImportanceColor={getImportanceColor}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Individual Task Card Component
interface TaskCardProps {
  task: TaskMetadata;
  onComplete: (taskId: string) => void;
  onDismiss: (taskId: string) => void;
  isCompleting: boolean;
  getTaskIcon: (taskType: TaskMetadata['task_type']) => React.ReactNode;
  getImportanceColor: (importance: TaskMetadata['importance']) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDismiss,
  isCompleting,
  getTaskIcon,
  getImportanceColor
}) => {
  return (
    <div className={`border rounded-lg p-4 ${getImportanceColor(task.importance)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
            {getTaskIcon(task.task_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h5 className="font-medium text-gray-900 truncate">
                {task.title}
              </h5>
              <Badge variant="outline" className="text-xs">
                {task.task_type.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">
              {task.description}
            </p>
            
            {task.due_time && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>
                  Originally due: {new Date(task.due_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          <Button
            onClick={() => onComplete(task.task_id)}
            disabled={isCompleting}
            size="sm"
            variant="primary"
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                Completing...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Complete Now
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onDismiss(task.task_id)}
            disabled={isCompleting}
            variant="secondary"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Task importance explanation */}
      {task.importance === 'critical' && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
          <strong>Why this is critical:</strong> This task is essential for preventing complications 
          and ensuring proper healing.
        </div>
      )}
      
      {task.importance === 'high' && (
        <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
          <strong>Why this is important:</strong> This task significantly contributes to your 
          recovery progress and helps prevent setbacks.
        </div>
      )}
    </div>
  );
};