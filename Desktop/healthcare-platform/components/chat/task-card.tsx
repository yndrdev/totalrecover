"use client";

import React from 'react';
import { Card } from '@/components/ui/design-system/Card';
import { Button } from '@/components/ui/design-system/Button';
import { StatusBadge, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator';
import { FileText, Video, MessageSquare, Activity, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { colors } from '@/lib/design-system/constants';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    task_type: 'form' | 'video' | 'message' | 'exercise';
    status: 'pending' | 'in_progress' | 'completed';
    recovery_day: number;
    recovery_phase?: string;
    duration_minutes?: number;
    priority?: 'high' | 'medium' | 'low';
  };
  onSelect?: (task: any) => void;
  compact?: boolean;
}

export function TaskCard({ task, onSelect, compact = false }: TaskCardProps) {
  const getTaskIcon = () => {
    switch (task.task_type) {
      case 'form':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'exercise':
        return <Activity className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTaskColor = () => {
    switch (task.task_type) {
      case 'form':
        return colors.primary.blue; // TJV brand blue #006DB1
      case 'video':
        return colors.accent.purple;
      case 'message':
        return colors.accent.teal;
      case 'exercise':
        return colors.secondary.green;
      default:
        return colors.gray[600];
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-accent-orange bg-accent-orange/10';
      case 'low':
        return 'text-secondary bg-secondary-light/10';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  {/* <thinking>
  Visual Design: Clean task card with appropriate icons and status indicators
  Healthcare Context: Task types relevant to recovery journey (forms, videos, exercises)
  UX Design: Compact and expanded views for different contexts
  </thinking> */}

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(task)}
        className={`w-full p-3 rounded-lg border transition-all hover:shadow-md ${
          task.status === 'completed'
            ? 'bg-secondary-light/5 border-secondary-light'
            : 'bg-white border-gray-200 hover:border-primary hover:bg-primary-light/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div 
            className={`p-2 rounded-lg ${
              task.status === 'completed' ? 'bg-secondary-light/20' : 'bg-primary-light/10'
            }`}
            style={{ color: task.status === 'completed' ? colors.secondary.green : getTaskColor() }}
          >
            {getTaskIcon()}
          </div>
          <div className="flex-1 text-left">
            <h4 className={`font-medium text-sm ${
              task.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <RecoveryDayBadge day={task.recovery_day} />
              {task.duration_minutes && (
                <span className="text-xs text-gray-600">
                  {task.duration_minutes} min
                </span>
              )}
            </div>
          </div>
          {task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-secondary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-primary" />
          )}
        </div>
      </button>
    );
  }

  return (
    <Card 
      className={`transition-all ${
        task.status === 'completed' ? 'opacity-75 bg-secondary-light/5' : 'hover:shadow-lg cursor-pointer hover:border-primary'
      }`}
      onClick={() => task.status !== 'completed' && onSelect?.(task)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className={`p-2 rounded-lg ${
                task.status === 'completed' ? 'bg-secondary-light/20' : 'bg-primary-light/10'
              }`}
              style={{ color: task.status === 'completed' ? colors.secondary.green : getTaskColor() }}
            >
              {getTaskIcon()}
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${
                task.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <RecoveryDayBadge day={task.recovery_day} />
                {task.recovery_phase && (
                  <span className="text-sm text-gray-600">{task.recovery_phase}</span>
                )}
              </div>
            </div>
          </div>
          <StatusBadge status={task.status} />
        </div>

        {task.description && (
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {task.duration_minutes && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{task.duration_minutes} min</span>
              </div>
            )}
            {task.priority && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor()}`}>
                {task.priority} priority
              </span>
            )}
          </div>
          {task.status !== 'completed' && (
            <Button size="sm" variant="primary">
              Start Task
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}