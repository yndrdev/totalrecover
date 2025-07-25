'use client'

import React from 'react'
import { 
  MessageSquare, 
  FileText, 
  Video, 
  Activity, 
  Plus,
  Edit,
  Trash2 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Task {
  id: string
  type: 'message' | 'form' | 'video' | 'exercise' | 'education'
  title: string
  status: 'completed' | 'pending' | 'missed' | 'in_progress'
  day: number
  phase: string
}

interface TaskCardProps {
  task: Task
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
}

const taskTypeConfig = {
  message: {
    icon: MessageSquare,
    label: 'Message',
    colors: {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  },
  form: {
    icon: FileText,
    label: 'Form',
    colors: {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  },
  video: {
    icon: Video,
    label: 'Video',
    colors: {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  },
  exercise: {
    icon: Activity,
    label: 'Exercise',
    colors: {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  },
  education: {
    icon: FileText,
    label: 'Education',
    colors: {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const config = taskTypeConfig[task.type]
  const Icon = config.icon
  const colorClass = config.colors[task.status]

  return (
    <div className={cn(
      "border rounded-lg p-2 text-xs",
      colorClass
    )}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          <span className="font-medium capitalize">{config.label}</span>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button 
              onClick={() => onEdit(task.id)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(task.id)}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="font-medium text-gray-900 truncate">
        {task.title}
      </div>
    </div>
  )
}

interface AddTaskButtonProps {
  onAdd?: () => void
}

export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  return (
    <button 
      onClick={onAdd}
      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
    >
      <Plus className="h-3 w-3" />
      Add Task
    </button>
  )
}