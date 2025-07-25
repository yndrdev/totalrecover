'use client'

import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressChart } from '@/components/charts/progress-chart'

interface ProjectStatusCardProps {
  project: {
    id: string
    name: string
    location: string
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'delayed'
    progress: number
    budget: {
      allocated: number
      spent: number
    }
    timeline: {
      startDate: string
      endDate: string
      daysRemaining?: number
    }
    team: {
      size: number
      manager: string
    }
    priority: 'low' | 'medium' | 'high' | 'critical'
  }
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

const statusConfig = {
  planning: { color: 'blue', label: 'Planning' },
  active: { color: 'green', label: 'Active' },
  'on-hold': { color: 'yellow', label: 'On Hold' },
  completed: { color: 'emerald', label: 'Completed' },
  delayed: { color: 'red', label: 'Delayed' }
}

const priorityConfig = {
  low: { color: 'gray', label: 'Low' },
  medium: { color: 'blue', label: 'Medium' },
  high: { color: 'orange', label: 'High' },
  critical: { color: 'red', label: 'Critical' }
}

export function ProjectStatusCard({ project, onClick, className, style }: ProjectStatusCardProps) {
  const status = statusConfig[project.status]
  const priority = priorityConfig[project.priority]
  const budgetUsed = (project.budget.spent / project.budget.allocated) * 100
  const isOverBudget = budgetUsed > 100
  const isDelayed = project.status === 'delayed'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
      style={style}
    >
      <Card 
        className={cn(
          'p-6 hover-lift cursor-pointer touch-target-large transition-all h-full flex flex-col',
          isDelayed && 'border-red-200 bg-red-50/30',
          isOverBudget && 'border-orange-200 bg-orange-50/30'
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {project.location}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                status.color === 'green' && 'border-green-200 text-green-700 bg-green-50',
                status.color === 'blue' && 'border-blue-200 text-blue-700 bg-blue-50',
                status.color === 'yellow' && 'border-yellow-200 text-yellow-700 bg-yellow-50',
                status.color === 'red' && 'border-red-200 text-red-700 bg-red-50',
                status.color === 'emerald' && 'border-emerald-200 text-emerald-700 bg-emerald-50'
              )}
            >
              {status.label}
            </Badge>
            
            {project.priority !== 'low' && (
              <Badge 
                variant="outline"
                className={cn(
                  'text-xs',
                  priority.color === 'orange' && 'border-orange-200 text-orange-700 bg-orange-50',
                  priority.color === 'red' && 'border-red-200 text-red-700 bg-red-50',
                  priority.color === 'blue' && 'border-blue-200 text-blue-700 bg-blue-50'
                )}
              >
                {priority.label} Priority
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Progress
            </p>
            <p className="text-lg font-semibold">
              {project.progress}% Complete
            </p>
          </div>
          
          <ProgressChart 
            percentage={project.progress}
            size="md"
            color={
              project.progress >= 100 ? 'success' :
              project.progress >= 75 ? 'primary' :
              project.progress >= 50 ? 'warning' : 'danger'
            }
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Budget */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Budget</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                ${project.budget.spent.toLocaleString()} / ${project.budget.allocated.toLocaleString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all',
                    isOverBudget ? 'bg-red-500' : 'bg-green-500'
                  )}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Timeline</span>
            </div>
            <div>
              {project.timeline.daysRemaining !== undefined ? (
                <p className={cn(
                  'text-sm font-medium',
                  project.timeline.daysRemaining < 0 ? 'text-red-600' : 'text-foreground'
                )}>
                  {project.timeline.daysRemaining < 0 
                    ? `${Math.abs(project.timeline.daysRemaining)} days overdue`
                    : `${project.timeline.daysRemaining} days left`
                  }
                </p>
              ) : (
                <p className="text-sm font-medium">
                  {new Date(project.timeline.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {project.team.size} team members
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            PM: {project.team.manager}
          </div>
        </div>

        {/* Alert Indicators */}
        {(isDelayed || isOverBudget) && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-orange-50 border border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              {isDelayed && isOverBudget 
                ? 'Project delayed and over budget'
                : isDelayed 
                ? 'Project behind schedule'
                : 'Project over budget'
              }
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}