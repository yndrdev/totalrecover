'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressChartProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const sizeConfig = {
  sm: { width: 60, strokeWidth: 4, fontSize: 'text-xs' },
  md: { width: 80, strokeWidth: 6, fontSize: 'text-sm' },
  lg: { width: 120, strokeWidth: 8, fontSize: 'text-lg' }
}

const colorConfig = {
  primary: 'stroke-primary',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500', 
  danger: 'stroke-red-500'
}

export function ProgressChart({ 
  percentage, 
  size = 'md', 
  className,
  showLabel = true,
  color = 'primary'
}: ProgressChartProps) {
  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="transparent"
          className="text-muted-foreground/20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-300 ease-out', colorConfig[color])}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {showLabel && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center font-semibold',
          config.fontSize
        )}>
          {percentage}%
        </div>
      )}
    </div>
  )
}