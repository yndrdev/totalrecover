'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BudgetData {
  category: string
  allocated: number
  spent: number
  remaining: number
  percentage: number
  status: 'under' | 'on-track' | 'over' | 'critical'
}

interface BudgetChartProps {
  data: BudgetData[]
  totalAllocated: number
  totalSpent: number
  className?: string
}

const statusConfig = {
  under: { color: 'text-green-600', bg: 'bg-green-100', label: 'Under Budget' },
  'on-track': { color: 'text-blue-600', bg: 'bg-blue-100', label: 'On Track' },
  over: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Over Budget' },
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' }
}

export function BudgetChart({ data, totalAllocated, totalSpent, className }: BudgetChartProps) {
  const totalPercentage = (totalSpent / totalAllocated) * 100
  const isOverBudget = totalPercentage > 100
  const variance = totalSpent - totalAllocated

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-6 touch-target-large">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget Overview
            </h3>
            <p className="text-sm text-muted-foreground">
              Track spending across project categories
            </p>
          </div>
          
          <Badge 
            variant="outline"
            className={cn(
              isOverBudget ? 'border-red-200 text-red-700 bg-red-50' : 'border-green-200 text-green-700 bg-green-50'
            )}
          >
            {isOverBudget ? 'Over Budget' : 'On Track'}
          </Badge>
        </div>

        {/* Total Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Allocated</p>
            <p className="text-xl font-bold text-foreground">
              ${totalAllocated.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className={cn(
              'text-xl font-bold',
              isOverBudget ? 'text-red-600' : 'text-foreground'
            )}>
              ${totalSpent.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </p>
            <div className="flex items-center justify-center gap-1">
              {isOverBudget ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <p className={cn(
                'text-xl font-bold',
                isOverBudget ? 'text-red-600' : 'text-green-600'
              )}>
                ${Math.abs(variance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar - Total */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className={cn(
              'text-sm font-medium',
              isOverBudget ? 'text-red-600' : 'text-foreground'
            )}>
              {totalPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={cn(
                'h-3 rounded-full transition-all duration-500',
                isOverBudget ? 'bg-red-500' : 'bg-green-500'
              )}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
            {isOverBudget && (
              <div 
                className="h-3 bg-red-600 rounded-full -mt-3"
                style={{ 
                  width: `${Math.min(totalPercentage - 100, 20)}%`,
                  marginLeft: '100%'
                }}
              />
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Category Breakdown</h4>
          
          {data.map((category, index) => {
            const status = statusConfig[category.status]
            const isOver = category.percentage > 100
            
            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h5 className="font-medium text-foreground">
                      {category.category}
                    </h5>
                    <Badge 
                      variant="outline"
                      className={cn('text-xs', status.bg, status.color)}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  
                  {category.status === 'critical' && (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Allocated:</span>
                    <p className="font-medium">${category.allocated.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spent:</span>
                    <p className={cn(
                      'font-medium',
                      isOver ? 'text-red-600' : 'text-foreground'
                    )}>
                      ${category.spent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {isOver ? 'Over:' : 'Remaining:'}
                    </span>
                    <p className={cn(
                      'font-medium',
                      isOver ? 'text-red-600' : 'text-green-600'
                    )}>
                      ${Math.abs(category.remaining).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar - Category */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Usage</span>
                    <span className={cn(
                      'text-xs font-medium',
                      isOver ? 'text-red-600' : 'text-foreground'
                    )}>
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        category.status === 'under' ? 'bg-green-500' :
                        category.status === 'on-track' ? 'bg-blue-500' :
                        category.status === 'over' ? 'bg-orange-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                    {isOver && (
                      <div 
                        className="h-2 bg-red-600 rounded-full -mt-2"
                        style={{ 
                          width: `${Math.min(category.percentage - 100, 20)}%`,
                          marginLeft: '100%'
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Alerts */}
        {data.some(item => item.status === 'over' || item.status === 'critical') && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-orange-800 mb-1">Budget Alerts</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  {data.filter(item => item.status === 'over' || item.status === 'critical').map((item) => (
                    <li key={item.category}>
                      • {item.category} is {item.percentage.toFixed(1)}% of allocated budget
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}