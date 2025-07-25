// Healthcare Platform - Accessibility Utilities
// WCAG 2.1 AA Compliance for 40+ Age Group

/**
 * WCAG Color Contrast Utilities
 * Ensures all text meets minimum contrast ratios
 */

// Calculate relative luminance for color contrast
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  
  const r1 = parseInt(hex1.substr(0, 2), 16)
  const g1 = parseInt(hex1.substr(2, 2), 16)
  const b1 = parseInt(hex1.substr(4, 2), 16)
  
  const r2 = parseInt(hex2.substr(0, 2), 16)
  const g2 = parseInt(hex2.substr(2, 2), 16)
  const b2 = parseInt(hex2.substr(4, 2), 16)
  
  const lum1 = getLuminance(r1, g1, b1)
  const lum2 = getLuminance(r2, g2, b2)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

// Validate color combinations meet WCAG standards
export function validateColorContrast(foreground: string, background: string, isLargeText = false): {
  ratio: number
  passes: boolean
  level: 'AA' | 'AAA' | 'fail'
} {
  const ratio = getContrastRatio(foreground, background)
  const minRatio = isLargeText ? 3 : 4.5 // WCAG AA standards
  const aaRatio = isLargeText ? 4.5 : 7 // WCAG AAA standards
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= minRatio,
    level: ratio >= aaRatio ? 'AAA' : ratio >= minRatio ? 'AA' : 'fail'
  }
}

/**
 * Focus Management Utilities
 */

// Trap focus within a container (for modals, dropdowns)
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Close modal or dropdown
      const closeButton = container.querySelector('[data-close]') as HTMLElement
      if (closeButton) closeButton.click()
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  firstFocusable?.focus()
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

// Manage focus restoration
export function manageFocusReturn(triggerElement: HTMLElement) {
  return () => {
    triggerElement.focus()
  }
}

/**
 * Screen Reader Utilities
 */

// Announce dynamic content changes
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Generate unique IDs for form labels
export function generateA11yId(prefix = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Touch Target Utilities
 */

// Ensure minimum 44px touch targets
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= 44 && rect.height >= 44
}

/**
 * Keyboard Navigation Utilities
 */

// Handle arrow key navigation in lists/grids
export function handleArrowNavigation(
  container: HTMLElement,
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical'
) {
  const focusableItems = container.querySelectorAll('[role="option"], [role="menuitem"], button, [href]') as NodeListOf<HTMLElement>
  
  function handleKeyDown(e: KeyboardEvent) {
    const currentIndex = Array.from(focusableItems).indexOf(document.activeElement as HTMLElement)
    let nextIndex = currentIndex
    
    switch (e.key) {
      case 'ArrowDown':
        if (orientation !== 'horizontal') {
          e.preventDefault()
          nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0
        }
        break
      case 'ArrowUp':
        if (orientation !== 'horizontal') {
          e.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1
        }
        break
      case 'ArrowRight':
        if (orientation !== 'vertical') {
          e.preventDefault()
          nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0
        }
        break
      case 'ArrowLeft':
        if (orientation !== 'vertical') {
          e.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1
        }
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = focusableItems.length - 1
        break
    }
    
    if (nextIndex !== currentIndex) {
      focusableItems[nextIndex]?.focus()
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Brand Color Accessibility Validation
 */

// Validate our brand colors meet accessibility standards
export const BRAND_COLOR_VALIDATION = {
  // Primary combinations
  navyOnWhite: validateColorContrast('#002238', '#FFFFFF'), // Should pass AAA
  blueOnWhite: validateColorContrast('#006DB1', '#FFFFFF'), // Should pass AA
  whiteOnNavy: validateColorContrast('#FFFFFF', '#002238'), // Should pass AAA
  whiteOnBlue: validateColorContrast('#FFFFFF', '#006DB1'), // Should pass AA
  
  // Light blue combinations
  navyOnLightBlue: validateColorContrast('#002238', '#C8DBE9'), // Should pass AA
  blueOnLightBlue: validateColorContrast('#006DB1', '#C8DBE9'), // Check ratio
}

/**
 * Form Accessibility Helpers
 */

// Validate form accessibility
export function validateFormAccessibility(form: HTMLFormElement): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check all inputs have labels
  const inputs = form.querySelectorAll('input, select, textarea')
  inputs.forEach((input: any) => {
    const hasLabel = form.querySelector(`label[for="${input.id}"]`) || input.getAttribute('aria-label')
    if (!hasLabel) {
      issues.push(`Input ${input.name || input.type} missing label`)
    }
  })
  
  // Check required fields are marked
  const requiredInputs = form.querySelectorAll('[required]')
  requiredInputs.forEach((input: any) => {
    if (!input.getAttribute('aria-required')) {
      input.setAttribute('aria-required', 'true')
    }
  })
  
  // Check error messages are associated
  const errorMessages = form.querySelectorAll('[role="alert"], .error-message')
  errorMessages.forEach((error: any) => {
    const associatedInput = form.querySelector(`[aria-describedby="${error.id}"]`)
    if (!associatedInput && !error.getAttribute('aria-live')) {
      issues.push('Error message not properly associated with input')
    }
  })
  
  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Healthcare-Specific Accessibility Features
 */

// Announce important health information
export function announceHealthUpdate(message: string) {
  announceToScreenReader(`Health update: ${message}`, 'assertive')
}

// Validate medical form accessibility
export function validateMedicalForm(form: HTMLFormElement) {
  const validation = validateFormAccessibility(form)
  
  // Additional medical form checks
  const medicationInputs = form.querySelectorAll('[data-medication], [name*="medication"]')
  medicationInputs.forEach((input: any) => {
    if (!input.getAttribute('aria-describedby')) {
      validation.issues.push('Medication inputs should have detailed descriptions')
    }
  })
  
  return validation
}

export default {
  validateColorContrast,
  trapFocus,
  manageFocusReturn,
  announceToScreenReader,
  generateA11yId,
  validateTouchTarget,
  handleArrowNavigation,
  BRAND_COLOR_VALIDATION,
  validateFormAccessibility,
  announceHealthUpdate,
  validateMedicalForm
}