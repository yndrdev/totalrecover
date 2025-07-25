'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// <thinking>
// 1. DESIGN ANALYSIS:
//    - Primary purpose: Text input for forms in healthcare contexts
//    - Users: Providers entering patient data, patients filling forms
//    - Information hierarchy: Clear labels and error states
//
// 2. UX CONSIDERATIONS:
//    - Large touch targets for mobile use
//    - Clear focus states for keyboard navigation
//    - Error messages below inputs
//    - Placeholder text for guidance
//
// 3. VISUAL DESIGN:
//    - Gray border, blue focus ring
//    - Adequate padding for readability
//    - Red border for error states
//    - Consistent with button styling
//
// 4. HEALTHCARE CONTEXT:
//    - Clear labels for medical terminology
//    - Support for various input types
//    - Validation for critical data
//    - Professional appearance
//
// 5. IMPLEMENTATION PLAN:
//    - Support all HTML input types
//    - Error and success states
//    - Label and helper text integration
//    - Full accessibility support
// </thinking>

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  errors?: string[]
  helperText?: string
  success?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  required?: boolean
  'aria-describedby'?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    errors,
    helperText,
    success,
    icon,
    iconPosition = 'left',
    required,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorList = errors || (error ? [error] : [])
    const hasError = errorList.length > 0
    
    const baseStyles = 'w-full px-4 py-4 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[48px]'
    
    const stateStyles = hasError
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : success
      ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
      : 'border-gray-300 focus:ring-[#006DB1] focus:border-[#006DB1]'
    
    // Generate aria-describedby
    const ariaDescribedBy = []
    if (hasError) ariaDescribedBy.push(`${inputId}-error`)
    if (helperText) ariaDescribedBy.push(`${inputId}-help`)
    const ariaDescribedByValue = ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined
    
    const iconPadding = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : ''
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-base font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div 
              className={cn(
                'absolute inset-y-0 flex items-center pointer-events-none',
                iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'
              )}
            >
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              baseStyles,
              stateStyles,
              iconPadding,
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'text-base mt-2',
            error ? 'text-error' : 'text-gray-600'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  success?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    success,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    const baseStyles = 'w-full px-4 py-4 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none min-h-[120px]'
    
    const stateStyles = error
      ? 'border-error focus:ring-error'
      : success
      ? 'border-secondary focus:ring-secondary'
      : 'border-gray-300 focus:ring-primary focus:border-transparent'
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={textareaId} 
            className="block text-base font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            baseStyles,
            stateStyles,
            className
          )}
          ref={ref}
          {...props}
        />
        
        {(error || helperText) && (
          <p className={cn(
            'text-base mt-2',
            error ? 'text-error' : 'text-gray-600'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Input, Textarea }