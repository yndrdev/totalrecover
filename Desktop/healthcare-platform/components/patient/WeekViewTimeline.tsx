'use client'

import React, { useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'
import {
  CheckCircle2,
  AlertTriangle,
  Circle,
  Clock,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Date formatting utility
const format = (date: Date, formatStr: string) => {
  if (formatStr === 'MMM d') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    return `${month} ${day}`
  }
  return date.toLocaleDateString()
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export type DayStatus = {
  day: number
  date: Date
  hasCompletedTasks: boolean
  hasPendingTasks: boolean
  hasMissedTasks: boolean
  taskCount: number
  completedCount: number
  messageCount?: number
}

interface WeekViewTimelineProps {
  surgeryDate: string | null
  currentDay: number
  selectedDay: number | null
  dayStatuses: Map<number, DayStatus>
  activeFilters: {
    missedTasks: boolean
    completedTasks: boolean
  }
  onDaySelect: (day: number) => void
  onFilterToggle: (filter: 'missedTasks' | 'completedTasks') => void
  startDay?: number
  endDay?: number
  showFuture?: boolean
  title?: string
  subtitle?: string
}

export function WeekViewTimeline({
  surgeryDate,
  currentDay,
  selectedDay,
  dayStatuses,
  activeFilters,
  onDaySelect,
  onFilterToggle,
  startDay = -45,
  endDay = 200,
  showFuture = true,
  title = "Recovery Timeline",
  subtitle
}: WeekViewTimelineProps) {
  // Get day status icon
  const getDayStatusIcon = useCallback((status: DayStatus | undefined) => {
    if (!status || status.taskCount === 0) return null

    if (status.hasMissedTasks) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    if (status.hasCompletedTasks && status.completedCount === status.taskCount) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (status.hasPendingTasks) {
      return <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
    }
    return null
  }, [])

  // Filter days based on active filters
  const filteredDays = Array.from({ length: endDay - startDay + 1 }, (_, i) => i + startDay)
    .filter(day => {
      // Don't show future days if showFuture is false
      if (!showFuture && day > currentDay) return false
      
      // If no filters active, show all days
      if (!activeFilters.missedTasks && !activeFilters.completedTasks) {
        return true
      }
      
      const status = dayStatuses.get(day)
      if (!status) return false
      
      // Apply filters
      if (activeFilters.missedTasks && activeFilters.completedTasks) {
        // Both filters active - show days with either missed OR completed tasks
        return status.hasMissedTasks || status.hasCompletedTasks
      } else if (activeFilters.missedTasks) {
        // Only missed tasks filter active
        return status.hasMissedTasks
      } else if (activeFilters.completedTasks) {
        // Only completed tasks filter active  
        return status.hasCompletedTasks
      }
      
      return true
    })

  return (
    <div className="w-[280px] border-r bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="p-4 border-b bg-white space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => onFilterToggle('missedTasks')}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeFilters.missedTasks
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            Missed Tasks
          </button>
          <button
            onClick={() => onFilterToggle('completedTasks')}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeFilters.completedTasks
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </button>
        </div>
      </div>

      {/* Timeline Days */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {filteredDays.map(day => {
            const status = dayStatuses.get(day)
            const isToday = day === currentDay
            const isSelected = day === selectedDay
            const isPast = day < currentDay

            return (
              <button
                key={day}
                onClick={() => onDaySelect(day)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all",
                  isSelected && "bg-blue-600 text-white shadow-sm",
                  !isSelected && "hover:bg-gray-100",
                  isToday && !isSelected && "ring-2 ring-blue-600 ring-offset-1"
                )}
                title={
                  status && status.taskCount > 0
                    ? `${status.taskCount} tasks, ${status.completedCount} completed${status.messageCount ? `, ${status.messageCount} messages` : ''}`
                    : 'No tasks scheduled'
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isSelected && "text-white"
                    )}>
                      Day {day}
                    </p>
                    <p className={cn(
                      "text-xs",
                      isSelected ? "text-blue-100" : "text-gray-500"
                    )}>
                      {surgeryDate
                        ? format(addDays(new Date(surgeryDate), day), 'MMM d')
                        : 'No date'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDayStatusIcon(status)}
                    {status && status.taskCount > 0 && (
                      <RecoveryDayBadge day={day} />
                    )}
                    {status && status.messageCount && status.messageCount > 0 && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {status.messageCount}
                      </span>
                    )}
                  </div>
                </div>
                {isToday && !isSelected && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">Today</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}