'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// <thinking>
// 1. DESIGN ANALYSIS:
//    - Purpose: Loading placeholder to indicate content is being fetched
//    - Users: All users waiting for data to load
//    - Information hierarchy: Matches the layout of actual content
//
// 2. UX CONSIDERATIONS:
//    - Reduces perceived loading time with visual feedback
//    - Matches the structure of the content it's replacing
//    - Subtle animation to indicate loading state
//    - Professional appearance for healthcare context
//
// 3. VISUAL DESIGN:
//    - Light gray background with gentle shimmer animation
//    - Rounded corners consistent with other components
//    - Various sizes for different content types
//    - Accessible with proper contrast
//
// 4. HEALTHCARE CONTEXT:
//    - Clean, professional appearance
//    - Calming color scheme to reduce anxiety
//    - Clear indication that content is loading
//    - Consistent with brand colors
//
// 5. IMPLEMENTATION PLAN:
//    - Multiple size variants
//    - Support for different shapes (text, avatar, card)
//    - Composable for complex layouts
//    - Accessibility considerations
// </thinking>

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'avatar' | 'card' | 'button' | 'custom'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  lines?: number
  animated?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'text',
    size = 'md',
    lines = 1,
    animated = true,
    ...props 
  }, ref) => {
    const baseStyles = 'bg-gray-200 rounded-md'
    
    const animations = animated 
      ? 'animate-pulse' 
      : ''
    
    const variants = {
      text: {
        sm: 'h-4',
        md: 'h-5',
        lg: 'h-6',
        xl: 'h-7'
      },
      avatar: {
        sm: 'h-8 w-8 rounded-full',
        md: 'h-10 w-10 rounded-full',
        lg: 'h-12 w-12 rounded-full',
        xl: 'h-16 w-16 rounded-full'
      },
      card: {
        sm: 'h-32 w-full rounded-lg',
        md: 'h-40 w-full rounded-lg',
        lg: 'h-48 w-full rounded-lg',
        xl: 'h-64 w-full rounded-lg'
      },
      button: {
        sm: 'h-9 w-20 rounded-md',
        md: 'h-10 w-24 rounded-md',
        lg: 'h-11 w-28 rounded-lg',
        xl: 'h-12 w-32 rounded-lg'
      },
      custom: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-10'
      }
    }
    
    const sizeClass = variants[variant][size]
    
    // For multi-line text skeletons
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseStyles,
                sizeClass,
                animations,
                index === lines - 1 ? 'w-3/4' : 'w-full', // Last line shorter
                className
              )}
              ref={index === 0 ? ref : undefined}
              {...(index === 0 ? props : {})}
            />
          ))}
        </div>
      )
    }
    
    return (
      <div
        className={cn(
          baseStyles,
          sizeClass,
          animations,
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Pre-built skeleton layouts for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 space-y-4', className)}>
    <div className="flex items-center space-x-3">
      <Skeleton variant="avatar" size="md" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" size="md" className="w-1/3" />
        <Skeleton variant="text" size="sm" className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
    <div className="flex space-x-2">
      <Skeleton variant="button" size="sm" />
      <Skeleton variant="button" size="sm" />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {/* Table header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} variant="text" size="sm" className="flex-1" />
      ))}
    </div>
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            variant="text" 
            size="md" 
            className="flex-1" 
          />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonList: React.FC<{ items?: number; showAvatar?: boolean; className?: string }> = ({ 
  items = 5, 
  showAvatar = true, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        {showAvatar && <Skeleton variant="avatar" size="sm" />}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" size="md" className="w-3/4" />
          <Skeleton variant="text" size="sm" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

export { Skeleton }