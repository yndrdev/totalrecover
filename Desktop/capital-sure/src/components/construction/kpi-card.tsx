'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: LucideIcon
  trend?: 'up' | 'down' | 'flat'
  className?: string
  variant?: 'default' | 'safety' | 'budget' | 'schedule'
  style?: React.CSSProperties
}

const variantStyles = {
  default: 'border-border bg-white',
  safety: 'border-border bg-white',
  budget: 'border-border bg-white', 
  schedule: 'border-border bg-white'
}

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  safety: 'bg-warning/10 text-warning',
  budget: 'bg-success/10 text-success',
  schedule: 'bg-info/10 text-info'
}

export function KPICard({
  title,
  value,
  unit,
  change,
  changeType,
  icon: Icon,
  trend,
  className,
  variant = 'default',
  style
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    
    const iconClass = cn(
      'h-4 w-4',
      trend === 'up' ? 'text-green-600' : 
      trend === 'down' ? 'text-red-600' : 
      'text-gray-600'
    )
    
    return trend === 'up' ? (
      <TrendingUp className={iconClass} />
    ) : trend === 'down' ? (
      <TrendingDown className={iconClass} />
    ) : (
      <Minus className={iconClass} />
    )
  }

  const getChangeColor = () => {
    if (!changeType) return 'text-muted-foreground'
    
    return changeType === 'increase' ? 'text-green-600' :
           changeType === 'decrease' ? 'text-red-600' :
           'text-muted-foreground'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={style}
    >
      <Card className={cn(
        'p-6 cursor-pointer touch-target-large transition-all hover:shadow-md h-full',
        variantStyles[variant]
      )}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold">
                {value}
              </h3>
              {unit && (
                <span className="text-sm text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
            
            {(change !== undefined || trend) && (
              <div className="flex items-center gap-1 mt-2">
                {getTrendIcon()}
                {change !== undefined && (
                  <span className={cn('text-sm font-medium', getChangeColor())}>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  from last month
                </span>
              </div>
            )}
          </div>
          
          <div className={cn(
            'p-3 rounded-lg',
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}