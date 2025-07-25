'use client'

import React from 'react'
import { TaskCard, AddTaskButton, Task } from './TaskCard'
import { WeekNavigation } from './WeekNavigation'

interface DayColumn {
  day: number
  displayDay: string
  phase: string
  tasks: Task[]
}

interface WeeklyTimelineViewProps {
  weekData: DayColumn[]
  currentWeek: number
  totalWeeks: number
  weekRange: string
  onPreviousWeek: () => void
  onNextWeek: () => void
  onEditTask?: (taskId: string) => void
  onDeleteTask?: (taskId: string) => void
  onAddTask?: (day: number) => void
}

export function WeeklyTimelineView({
  weekData,
  currentWeek,
  totalWeeks,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  onEditTask,
  onDeleteTask,
  onAddTask
}: WeeklyTimelineViewProps) {
  return (
    <div className="rounded-xl border transition-all duration-200 bg-white border-primary-light/30 shadow-sm hover:shadow-md">
      {/* Week Navigation Header */}
      <div className="p-6 border-b border-primary-light/20 bg-primary-light/5">
        <WeekNavigation
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          weekRange={weekRange}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
        />
      </div>

      {/* Weekly Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekData.map((dayColumn) => (
            <div 
              key={dayColumn.day}
              className="border rounded-lg p-3 min-h-[250px] bg-primary-light/5 border-primary-light/30 hover:bg-primary-light/10 transition-colors"
            >
              {/* Day Header */}
              <div className="text-center mb-3">
                <div className="text-sm font-semibold text-primary-navy">
                  {dayColumn.displayDay}
                </div>
                <div className="text-xs text-primary capitalize mt-1">
                  {dayColumn.phase}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {dayColumn.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
                
                {/* Add Task Button */}
                <AddTaskButton 
                  onAdd={() => onAddTask?.(dayColumn.day)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}