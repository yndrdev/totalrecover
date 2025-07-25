// Healthcare Platform - Form Validation Utilities
// Enhanced validation for medical forms with accessibility support

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FormField {
  name: string
  label: string
  value: any
  rules: ValidationRule[]
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'select' | 'checkbox' | 'number'
}

/**
 * Core Validation Functions
 */

// Validate a single field
export function validateField(field: FormField): ValidationResult {
  const errors: string[] = []
  const { value, rules, label } = field

  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(rule.message || `${label} is required`)
      continue // Skip other validations if required fails
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      continue
    }

    // Length validations
    if (rule.minLength && value.toString().length < rule.minLength) {
      errors.push(rule.message || `${label} must be at least ${rule.minLength} characters`)
    }

    if (rule.maxLength && value.toString().length > rule.maxLength) {
      errors.push(rule.message || `${label} must be no more than ${rule.maxLength} characters`)
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      errors.push(rule.message || `${label} format is invalid`)
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) {
        errors.push(customError)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate entire form
export function validateForm(fields: FormField[]): { [key: string]: ValidationResult } {
  const results: { [key: string]: ValidationResult } = {}
  
  fields.forEach(field => {
    results[field.name] = validateField(field)
  })
  
  return results
}

/**
 * Healthcare-Specific Validation Rules
 */

// Medical Record Number (MRN) validation
export const mrnValidation: ValidationRule = {
  required: true,
  pattern: /^[A-Z0-9]{6,12}$/,
  message: 'Medical Record Number must be 6-12 alphanumeric characters'
}

// Phone number validation (US format)
export const phoneValidation: ValidationRule = {
  pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  message: 'Please enter a valid phone number (e.g., (555) 123-4567)'
}

// Email validation (enhanced)
export const emailValidation: ValidationRule = {
  pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  message: 'Please enter a valid email address'
}

// Date of birth validation
export const dobValidation: ValidationRule = {
  required: true,
  custom: (value: string) => {
    if (!value) return null
    
    const date = new Date(value)
    const now = new Date()
    const age = now.getFullYear() - date.getFullYear()
    
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date'
    }
    
    if (date > now) {
      return 'Date of birth cannot be in the future'
    }
    
    if (age > 120) {
      return 'Please enter a valid date of birth'
    }
    
    return null
  }
}

// Surgery date validation
export const surgeryDateValidation: ValidationRule = {
  custom: (value: string) => {
    if (!value) return null
    
    const date = new Date(value)
    const now = new Date()
    const maxFuture = new Date()
    maxFuture.setFullYear(maxFuture.getFullYear() + 1)
    
    if (isNaN(date.getTime())) {
      return 'Please enter a valid surgery date'
    }
    
    if (date > maxFuture) {
      return 'Surgery date cannot be more than 1 year in the future'
    }
    
    return null
  }
}

// Password validation for healthcare context
export const passwordValidation: ValidationRule = {
  required: true,
  minLength: 8,
  custom: (value: string) => {
    if (!value) return null
    
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return 'Password must contain uppercase, lowercase, number, and special character'
    }
    
    return null
  }
}

// Emergency contact validation
export const emergencyContactValidation = {
  name: {
    required: true,
    minLength: 2,
    message: 'Emergency contact name is required'
  } as ValidationRule,
  phone: phoneValidation,
  relationship: {
    required: true,
    message: 'Please specify relationship to patient'
  } as ValidationRule
}

/**
 * Form State Management
 */

export class FormValidator {
  private fields: { [key: string]: FormField } = {}
  private errors: { [key: string]: string[] } = {}
  private touched: { [key: string]: boolean } = {}

  addField(field: FormField) {
    this.fields[field.name] = field
    this.errors[field.name] = []
    this.touched[field.name] = false
  }

  updateFieldValue(name: string, value: any) {
    if (this.fields[name]) {
      this.fields[name].value = value
      this.validateField(name)
    }
  }

  markFieldTouched(name: string) {
    this.touched[name] = true
  }

  validateField(name: string): ValidationResult {
    const field = this.fields[name]
    if (!field) return { isValid: true, errors: [] }

    const result = validateField(field)
    this.errors[name] = result.errors
    return result
  }

  validateAll(): boolean {
    let isValid = true
    
    Object.keys(this.fields).forEach(name => {
      const result = this.validateField(name)
      if (!result.isValid) {
        isValid = false
      }
    })
    
    return isValid
  }

  getFieldErrors(name: string): string[] {
    return this.errors[name] || []
  }

  isFieldTouched(name: string): boolean {
    return this.touched[name] || false
  }

  getFormData(): { [key: string]: any } {
    const data: { [key: string]: any } = {}
    Object.keys(this.fields).forEach(name => {
      data[name] = this.fields[name].value
    })
    return data
  }

  reset() {
    Object.keys(this.fields).forEach(name => {
      this.fields[name].value = ''
      this.errors[name] = []
      this.touched[name] = false
    })
  }

  // Get first error for accessibility announcements
  getFirstError(): string | null {
    for (const fieldName of Object.keys(this.errors)) {
      if (this.errors[fieldName].length > 0) {
        return `${this.fields[fieldName].label}: ${this.errors[fieldName][0]}`
      }
    }
    return null
  }
}

/**
 * Accessibility Helpers
 */

// Generate aria-describedby for form fields
export function generateAriaDescribedBy(fieldName: string, hasError: boolean, hasHelp: boolean): string {
  const ids: string[] = []
  if (hasError) ids.push(`${fieldName}-error`)
  if (hasHelp) ids.push(`${fieldName}-help`)
  return ids.join(' ') || undefined as any
}

// Generate error message with proper ARIA attributes
export function generateErrorMessage(fieldName: string, errors: string[]): React.ReactElement | null {
  if (errors.length === 0) return null
  
  return React.createElement('div', {
    id: `${fieldName}-error`,
    role: 'alert',
    'aria-live': 'polite',
    className: 'text-red-600 text-sm mt-1'
  }, errors[0]) // Show only first error for clarity
}

/**
 * Common Healthcare Form Configurations
 */

// Patient registration form fields
export const patientRegistrationFields: Partial<FormField>[] = [
  {
    name: 'firstName',
    label: 'First Name',
    rules: [{ required: true, minLength: 2 }]
  },
  {
    name: 'lastName',
    label: 'Last Name',
    rules: [{ required: true, minLength: 2 }]
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    rules: [{ required: true }, emailValidation]
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    rules: [{ required: true }, phoneValidation]
  },
  {
    name: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    rules: [dobValidation]
  },
  {
    name: 'mrn',
    label: 'Medical Record Number',
    rules: [mrnValidation]
  }
]

// Pre-op form fields
export const preOpFormFields: Partial<FormField>[] = [
  {
    name: 'surgeryDate',
    label: 'Surgery Date',
    type: 'date',
    rules: [{ required: true }, surgeryDateValidation]
  },
  {
    name: 'surgeryType',
    label: 'Surgery Type',
    type: 'select',
    rules: [{ required: true }]
  },
  {
    name: 'allergies',
    label: 'Known Allergies',
    rules: [{ maxLength: 500 }]
  },
  {
    name: 'medications',
    label: 'Current Medications',
    rules: [{ maxLength: 1000 }]
  }
]

export default {
  validateField,
  validateForm,
  FormValidator,
  generateAriaDescribedBy,
  generateErrorMessage,
  mrnValidation,
  phoneValidation,
  emailValidation,
  dobValidation,
  surgeryDateValidation,
  passwordValidation,
  emergencyContactValidation,
  patientRegistrationFields,
  preOpFormFields
}