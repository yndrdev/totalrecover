'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks'
import { validateEmail, validatePassword, formatAuthError, checkRateLimit, clearRateLimit } from '@/lib/auth-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react'

interface AuthFormProps {
  mode?: 'login' | 'signup'
  onModeChange?: (mode: 'login' | 'signup') => void
  redirectTo?: string
  showMagicLink?: boolean
  className?: string
}

function AuthFormInner({ 
  mode = 'login', 
  onModeChange, 
  redirectTo,
  showMagicLink = true,
  className = ''
}: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient' as 'patient' | 'provider' | 'nurse' | 'admin'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const { signIn, signUp, signInWithMagicLink } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect parameter from URL
  const urlRedirect = searchParams.get('redirect')
  const finalRedirectTo = redirectTo || urlRedirect

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear errors when user starts typing
    if (error) setError('')
    if (validationErrors.length > 0) setValidationErrors([])
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    // Email validation
    if (!validateEmail(formData.email)) {
      errors.push('Please enter a valid email address')
    }

    // Password validation
    if (!formData.password) {
      errors.push('Password is required')
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors)
      }
      
      // Confirm password validation for signup
      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match')
      }
    }

    // Name validation for signup
    if (!isLogin) {
      if (!formData.firstName.trim()) {
        errors.push('First name is required')
      }
      if (!formData.lastName.trim()) {
        errors.push('Last name is required')
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(formData.email)
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime) : new Date()
      const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60))
      setError(`Too many attempts. Please wait ${waitMinutes} minutes before trying again.`)
      return
    }

    setIsLoading(true)

    try {
      if (isLogin) {
        // Handle login
        const result = await signIn(formData.email, formData.password)
        
        if (result.success) {
          clearRateLimit(formData.email)
          setSuccess('Login successful! Redirecting...')
          
          // Redirect after a short delay
          setTimeout(() => {
            if (finalRedirectTo) {
              router.push(finalRedirectTo)
            } else {
              // Will be handled by the auth hook based on user role
              router.refresh()
            }
          }, 1000)
        } else {
          setError(formatAuthError(result.error))
        }
      } else {
        // Handle signup
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`
        
        const result = await signUp(formData.email, formData.password, {
          full_name: fullName,
          role: formData.role
        })
        
        if (result.success) {
          clearRateLimit(formData.email)
          
          if (result.requiresEmailConfirmation) {
            setSuccess('Account created successfully! Please check your email to verify your account.')
          } else {
            setSuccess('Account created and verified! Redirecting...')
            setTimeout(() => {
              if (finalRedirectTo) {
                router.push(finalRedirectTo)
              } else {
                router.refresh()
              }
            }, 1000)
          }
        } else {
          setError(formatAuthError(result.error))
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Auth form error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!formData.email) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(`magic_${formData.email}`)
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime) : new Date()
      const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60))
      setError(`Too many magic link requests. Please wait ${waitMinutes} minutes before trying again.`)
      return
    }

    setError('')
    setSuccess('')
    setIsMagicLinkLoading(true)

    try {
      const result = await signInWithMagicLink(formData.email)
      
      if (result.success) {
        clearRateLimit(`magic_${formData.email}`)
        setSuccess('Magic link sent! Please check your email and click the link to sign in.')
      } else {
        setError(formatAuthError(result.error))
      }
    } catch (error) {
      setError('Failed to send magic link. Please try again.')
      console.error('Magic link error:', error)
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  const toggleMode = () => {
    const newMode = isLogin ? 'signup' : 'login'
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setValidationErrors([])
    
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  return (
    <Card className={`w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="space-y-1 pb-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#006DB1' }}>
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Join Our Platform'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isLogin 
              ? 'Sign in to your healthcare dashboard'
              : 'Create your secure healthcare account'
            }
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Messages */}
        {(error || validationErrors.length > 0) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                {error && <p>{error}</p>}
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields (Sign Up Only) */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a... *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.role === 'patient'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <User className={`w-5 h-5 mb-1 ${
                      formData.role === 'patient' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium block ${
                      formData.role === 'patient' ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      Patient
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'provider' }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.role === 'provider'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <Stethoscope className={`w-5 h-5 mb-1 ${
                      formData.role === 'provider' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium block ${
                      formData.role === 'provider' ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      Provider
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                placeholder="your.email@example.com"
                required
                disabled={isLoading || isMagicLinkLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                className="pl-10 pr-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                placeholder={isLogin ? 'Enter your password' : 'Create a secure password'}
                required
                disabled={isLoading || isMagicLinkLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading || isMagicLinkLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="pl-10 pr-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading || isMagicLinkLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading || isMagicLinkLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || isMagicLinkLoading}
            className="w-full py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#006DB1' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Magic Link Option */}
        {showMagicLink && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleMagicLink}
              disabled={isMagicLinkLoading || isLoading || !formData.email}
              className="w-full py-3 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
            >
              {isMagicLinkLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" style={{ color: '#006DB1' }} />
                  Sign in with Magic Link
                </>
              )}
            </Button>
          </>
        )}

        {/* Toggle Login/Signup */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-1 font-medium hover:underline"
              style={{ color: '#006DB1' }}
              disabled={isLoading || isMagicLinkLoading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AuthForm(props: AuthFormProps) {
  return (
    <Suspense fallback={
      <div className={`w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm ${props.className || ''}`}>
        <div className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#006DB1' }}>
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mx-8"></div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#006DB1' }} />
          </div>
        </div>
      </div>
    }>
      <AuthFormInner {...props} />
    </Suspense>
  )
}