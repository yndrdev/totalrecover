'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { colors } from '@/lib/design-system/constants'

// <thinking>
// 1. DESIGN ANALYSIS:
//    - Primary purpose: Consistent, accessible button component for all actions
//    - Users: Healthcare providers and patients performing various actions
//    - Information hierarchy: Primary actions most prominent, secondary less so
//
// 2. UX CONSIDERATIONS:
//    - Clear visual feedback on hover, focus, and active states
//    - Minimum touch target size of 44px for accessibility
//    - Loading states to prevent duplicate submissions
//    - Disabled states clearly indicated
//
// 3. VISUAL DESIGN:
//    - Primary: Blue (#2563eb) for main actions
//    - Secondary: White with border for secondary actions
//    - Success: Green (#059669) for positive actions
//    - Warning: Orange (#ea580c) for caution actions
//    - Consistent padding and border radius
//
// 4. HEALTHCARE CONTEXT:
//    - Professional appearance to build trust
//    - Clear action labels for medical contexts
//    - Error prevention through clear states
//    - Compliance with accessibility standards
//
// 5. IMPLEMENTATION PLAN:
//    - Support multiple variants and sizes
//    - Include loading and disabled states
//    - Full keyboard and screen reader support
//    - Responsive sizing for mobile
// </thinking>

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  loadingText?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    loadingText = 'Loading...',
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-[#006DB1] text-white hover:bg-[#005A92] focus:ring-[#006DB1]',
      secondary: 'bg-white border border-gray-300 text-[#002238] hover:bg-gray-50 focus:ring-[#006DB1]',
      success: 'bg-[#059669] text-white hover:bg-[#047857] focus:ring-[#059669]',
      warning: 'bg-[#ea580c] text-white hover:bg-[#dc2626] focus:ring-[#ea580c]',
      danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] focus:ring-[#dc2626]',
      ghost: 'bg-transparent text-[#002238] hover:bg-[#C8DBE9]/20 focus:ring-[#006DB1]',
    }
    
    const sizes = {
      sm: 'px-4 py-2.5 text-base rounded-md min-h-[44px]',
      md: 'px-5 py-3 text-lg rounded-lg min-h-[48px]',
      lg: 'px-6 py-3.5 text-xl rounded-lg min-h-[52px]',
    }
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading, please wait</span>
            {loadingText}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="mr-2" aria-hidden="true">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="ml-2" aria-hidden="true">{icon}</span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }