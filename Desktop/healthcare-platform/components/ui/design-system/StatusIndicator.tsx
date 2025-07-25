'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// <thinking>
// 1. DESIGN ANALYSIS:
//    - Primary purpose: Show status of recovery days, tasks, and health metrics
//    - Users: Both providers and patients viewing progress
//    - Information hierarchy: Status should be immediately recognizable
//
// 2. UX CONSIDERATIONS:
//    - Color coding for quick recognition
//    - Icons to support color-blind users
//    - Clear text labels
//    - Consistent sizing across uses
//
// 3. VISUAL DESIGN:
//    - Recovery day colors based on phase
//    - Task status with clear indicators
//    - Online/offline status for users
//    - Professional healthcare appearance
//
// 4. HEALTHCARE CONTEXT:
//    - Medical context requires clear status
//    - Support for various health states
//    - Compliance with accessibility
//    - Trust through consistent design
//
// 5. IMPLEMENTATION PLAN:
//    - Multiple types of status indicators
//    - Support for icons and text
//    - Flexible sizing options
//    - Animated states where appropriate
// </thinking>

export interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'overdue'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className
}) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const statusConfig = {
    pending: {
      colors: 'bg-gray-100 text-gray-800',
      icon: '○',
      label: 'Pending'
    },
    in_progress: {
      colors: 'bg-blue-100 text-blue-800',
      icon: '◐',
      label: 'In Progress'
    },
    completed: {
      colors: 'bg-green-100 text-green-800',
      icon: '✓',
      label: 'Completed'
    },
    skipped: {
      colors: 'bg-yellow-100 text-yellow-800',
      icon: '⟳',
      label: 'Skipped'
    },
    failed: {
      colors: 'bg-red-100 text-red-800',
      icon: '✗',
      label: 'Failed'
    },
    overdue: {
      colors: 'bg-orange-100 text-orange-800',
      icon: '!',
      label: 'Overdue'
    }
  }

  const config = statusConfig[status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      sizes[size],
      config.colors,
      className
    )}>
      {showIcon && <span className="text-base">{config.icon}</span>}
      {config.label}
    </span>
  )
}

export interface RecoveryDayBadgeProps {
  day: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const RecoveryDayBadge: React.FC<RecoveryDayBadgeProps> = ({
  day,
  size = 'md',
  className
}) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const getPhaseColor = (day: number) => {
    if (day < 0) return 'bg-orange-100 text-orange-800' // Pre-op
    if (day === 0) return 'bg-red-100 text-red-800' // Surgery day
    if (day <= 7) return 'bg-red-100 text-red-800' // Acute
    if (day <= 30) return 'bg-blue-100 text-blue-800' // Early
    if (day <= 90) return 'bg-purple-100 text-purple-800' // Intermediate
    if (day <= 180) return 'bg-green-100 text-green-800' // Advanced
    return 'bg-green-100 text-green-800' // Long-term
  }

  const getPhaseLabel = (day: number) => {
    if (day < 0) return 'Pre-Op'
    if (day === 0) return 'Surgery'
    if (day <= 7) return 'Acute'
    if (day <= 30) return 'Early'
    if (day <= 90) return 'Intermediate'
    if (day <= 180) return 'Advanced'
    return 'Long-term'
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-2 rounded-full font-medium',
      sizes[size],
      getPhaseColor(day),
      className
    )}>
      <span className="font-semibold">Day {day}</span>
      <span className="text-xs opacity-75">({getPhaseLabel(day)})</span>
    </span>
  )
}

export interface OnlineStatusProps {
  status: 'online' | 'offline' | 'busy' | 'away'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  pulse?: boolean
  className?: string
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  status,
  size = 'md',
  showLabel = false,
  pulse = true,
  className
}) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      label: 'Online'
    },
    offline: {
      color: 'bg-gray-400',
      label: 'Offline'
    },
    busy: {
      color: 'bg-red-500',
      label: 'Busy'
    },
    away: {
      color: 'bg-yellow-500',
      label: 'Away'
    }
  }

  const config = statusConfig[status]

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="relative">
        <span 
          className={cn(
            'block rounded-full',
            sizes[size],
            config.color,
            pulse && status === 'online' && 'animate-pulse-subtle'
          )}
        />
        {pulse && status === 'online' && (
          <span 
            className={cn(
              'absolute inset-0 rounded-full',
              config.color,
              'animate-ping opacity-75'
            )}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600">{config.label}</span>
      )}
    </div>
  )
}

export interface HealthMetricProps {
  label: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

export const HealthMetric: React.FC<HealthMetricProps> = ({
  label,
  value,
  unit,
  status,
  trend,
  className
}) => {
  const statusColors = {
    normal: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→'
  }

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm text-gray-600">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          'text-2xl font-semibold',
          statusColors[status]
        )}>
          {value}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
        {trend && (
          <span className={cn(
            'text-sm',
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          )}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  )
}

// Simple status indicator for general use
export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  className
}) => {
  const sizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400'
  }

  return (
    <span 
      className={cn(
        'inline-block rounded-full',
        sizes[size],
        statusColors[status],
        className
      )}
    />
  )
}
