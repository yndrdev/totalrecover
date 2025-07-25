'use client'

import React from 'react'
import { Button } from '@/components/ui/design-system/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigationProps {
  currentWeek: number
  totalWeeks: number
  onPreviousWeek: () => void
  onNextWeek: () => void
  weekRange: string
  className?: string
}

export function WeekNavigation({
  currentWeek,
  totalWeeks,
  onPreviousWeek,
  onNextWeek,
  weekRange,
  className
}: WeekNavigationProps) {
  const isPreviousDisabled = currentWeek <= 1
  const isNextDisabled = currentWeek >= totalWeeks

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <Button
        onClick={onPreviousWeek}
        disabled={isPreviousDisabled}
        variant="secondary"
        size="sm"
        className="px-3 py-1.5 text-sm"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous Week
      </Button>
      
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-900">
          Week {currentWeek} of {totalWeeks}
        </h4>
        <p className="text-sm text-gray-600">
          {weekRange}
        </p>
      </div>
      
      <Button
        onClick={onNextWeek}
        disabled={isNextDisabled}
        variant="secondary"
        size="sm"
        className="px-3 py-1.5 text-sm"
      >
        Next Week
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}