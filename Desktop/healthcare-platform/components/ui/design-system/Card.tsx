'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// <thinking>
// 1. DESIGN ANALYSIS:
//    - Primary purpose: Container for grouped content in healthcare contexts
//    - Users: Providers viewing patient info, patients viewing tasks
//    - Information hierarchy: Clear separation of content sections
//
// 2. UX CONSIDERATIONS:
//    - Visual grouping of related information
//    - Clear boundaries between content areas
//    - Hover states for interactive cards
//    - Consistent spacing and shadows
//
// 3. VISUAL DESIGN:
//    - White background with subtle borders
//    - Elevated variant for important content
//    - Status variants for health information
//    - Rounded corners for friendly appearance
//
// 4. HEALTHCARE CONTEXT:
//    - Clean, professional appearance
//    - Status cards for medical alerts
//    - Sufficient contrast for readability
//    - Calm color palette
//
// 5. IMPLEMENTATION PLAN:
//    - Multiple variants for different contexts
//    - Flexible padding options
//    - Support for headers and footers
//    - Responsive on all devices
// </thinking>

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'success' | 'warning' | 'info' | 'error'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    interactive = false,
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-xl border transition-all duration-200'
    
    const variants = {
      default: 'bg-white border-gray-200 shadow-sm',
      elevated: 'bg-white border-gray-200 shadow-lg',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-orange-50 border-orange-200',
      info: 'bg-blue-50 border-blue-200',
      error: 'bg-red-50 border-red-200',
    }
    
    const paddings = {
      none: '',
      sm: 'p-5',
      md: 'p-7',
      lg: 'p-9',
    }
    
    const interactiveStyles = interactive 
      ? 'hover:shadow-md cursor-pointer' 
      : ''
    
    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          interactiveStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex items-start justify-between pb-4', className)}
        ref={ref}
        {...props}
      >
        <div className="space-y-1">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-base text-gray-600">{subtitle}</p>
          )}
          {children}
        </div>
        {action && (
          <div className="ml-4">{action}</div>
        )}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }