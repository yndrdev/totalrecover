'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function MagicLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('Invalid magic link');
        }

        // Extract phone number from demo token
        // In production, this would be a secure JWT token
        if (token.startsWith('demo-')) {
          const phoneNumber = token.replace('demo-', '');
          
          // Find patient by phone number
          const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('*, profiles!inner(*)')
            .eq('phone_number', phoneNumber)
            .single();

          if (patientError || !patient) {
            throw new Error('Patient not found');
          }

          // In production, we would:
          // 1. Verify the token with backend
          // 2. Create a session for the patient
          // 3. Use Supabase's signInWithOtp or similar
          
          // For demo, we'll simulate a successful login
          // by storing patient info in localStorage
          localStorage.setItem('demo_patient_id', patient.profile_id);
          localStorage.setItem('demo_patient_name', 
            `${patient.profiles.first_name} ${patient.profiles.last_name}`);
          
          setStatus('success');
          
          // Redirect to patient chat after a moment
          setTimeout(() => {
            router.push('/patient/chat');
          }, 2000);
        } else {
          throw new Error('Invalid token format');
        }
      } catch (err) {
        console.error('Magic link error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify magic link');
        setStatus('error');
      }
    };

    handleMagicLink();
  }, [searchParams, supabase, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Verifying Magic Link
            </CardTitle>
            <CardDescription className="text-center">
              Please wait while we log you in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Login Successful!
            </CardTitle>
            <CardDescription className="text-center">
              Redirecting you to your recovery dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Magic Link Error
          </CardTitle>
          <CardDescription className="text-center">
            {error || 'The magic link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={() => router.push('/auth/patient-access')}
            className="w-full"
          >
            Request New Link
          </Button>
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              Contact your practice
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <MagicLinkHandler />
    </Suspense>
  );
}