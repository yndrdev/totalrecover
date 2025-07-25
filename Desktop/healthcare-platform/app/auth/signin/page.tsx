'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, CheckCircle, Heart, Users, Activity } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const roleFromUrl = searchParams.get('role');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const isPatient = roleFromUrl === 'patient';
  const isProvider = roleFromUrl === 'provider';

  useEffect(() => {
    // Check if user just registered
    const message = searchParams.get('message');
    if (message) {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    console.log('[SignIn] Starting login process for:', formData.email);
    console.log('[SignIn] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[SignIn] Has anon key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    try {
      console.log('[SignIn] Calling signInWithPassword...');
      
      // Simple auth request without race condition
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      console.log('[SignIn] Auth response received:', { 
        hasData: !!authData, 
        hasError: !!authError,
        error: authError?.message 
      });

      if (authError) {
        console.error('[SignIn] Auth error details:', {
          message: authError.message,
          status: authError.status,
          code: authError.code
        });
        throw authError;
      }
      if (!authData.user) {
        console.error('[SignIn] No user data returned');
        throw new Error('Login failed');
      }
      
      console.log('[SignIn] Auth successful for user:', authData.user.id);

      // Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('[SignIn] Profile fetch error:', profileError);
        console.log('[SignIn] Profile not found, will create on redirect');
        
        // If profile doesn't exist, redirect based on URL parameter
        // The destination page will handle profile creation if needed
        if (isPatient) {
          console.log('[SignIn] Redirecting new patient to profile page');
          router.push(`/patient/${authData.user.id}`);
        } else {
          console.log('[SignIn] Redirecting new provider to /provider/patients');
          router.push('/provider/patients');
        }
        return;
      }

      console.log('[SignIn] User profile found:', { role: profile.role });
      
      // Route based on role
      if (profile.role === 'patient') {
        // Redirect to patient profile page
        console.log('[SignIn] Redirecting patient to:', `/patient/${authData.user.id}`);
        router.push(`/patient/${authData.user.id}`);
      } else {
        // All provider roles go to patients page
        console.log('[SignIn] Redirecting provider to: /provider/patients');
        
        // Use window.location for immediate redirect
        window.location.href = '/provider/patients';
      }
    } catch (err) {
      console.error('[SignIn] Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a timeout handler to detect hanging requests
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('[SignIn] Login is taking longer than expected...');
        // Don't automatically fail, just warn
      }, 15000); // 15 second warning

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isPatient ? '' : isProvider ? '' : ''
            }`} style={{ backgroundColor: isPatient ? '#C8DBE9' : isProvider ? '#002238' : '#006DB1' }}>
              {isPatient ? (
                <Heart className="h-8 w-8" style={{ color: '#002238' }} />
              ) : isProvider ? (
                <Users className="h-8 w-8 text-white" />
              ) : (
                <Activity className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center" style={{ color: '#002238' }}>
            {isPatient ? 'Patient Sign In' : isProvider ? 'Staff Sign In' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {isPatient 
              ? 'Access your recovery journey' 
              : isProvider 
              ? 'Manage your patients and protocols'
              : 'Sign in to your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {searchParams.get('message') || 'Account created successfully! Please sign in.'}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="focus:ring-2"
                style={{ '--tw-ring-color': '#006DB1' } as any}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="focus:ring-2"
                style={{ '--tw-ring-color': '#006DB1' } as any}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 text-lg"
              style={{ backgroundColor: isPatient ? '#006DB1' : '#002238', color: 'white' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Need an account?{' '}
                <Link 
                  href={`/auth/signup${roleFromUrl ? `?role=${roleFromUrl}` : ''}`} 
                  className="font-medium"
                  style={{ color: '#006DB1' }}
                >
                  Sign up
                </Link>
              </p>
              {isPatient && (
                <p className="text-sm text-gray-600">
                  Having trouble signing in?{' '}
                  <Link href="/auth/patient-access" className="font-medium" style={{ color: '#006DB1' }}>
                    Request magic link
                  </Link>
                </p>
              )}
              <p className="text-sm text-gray-600">
                <Link href="/" className="font-medium text-gray-500 hover:text-gray-700">
                  ← Back to home
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#006DB1' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}