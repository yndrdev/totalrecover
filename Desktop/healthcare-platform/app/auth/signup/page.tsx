'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Activity, ArrowRight, Stethoscope, Loader2 } from 'lucide-react';

function SignUpHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  useEffect(() => {
    // If role is specified in URL, redirect to appropriate signup page
    if (roleFromUrl === 'patient') {
      router.push('/auth/patient-signup');
    } else if (roleFromUrl === 'provider') {
      router.push('/auth/staff-signup');
    }
  }, [roleFromUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#002238' }}>
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#002238' }}>
            Choose Your Account Type
          </h1>
          <p className="text-xl text-gray-600">
            Select how you\'ll be using TJV Recovery
          </p>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Patient Card */}
          <Card className="hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer" 
                onClick={() => router.push('/auth/patient-signup')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8DBE9' }}>
                  <Heart className="h-8 w-8" style={{ color: '#002238' }} />
                </div>
              </div>
              <CardTitle className="text-2xl" style={{ color: '#002238' }}>I\'m a Patient</CardTitle>
              <CardDescription className="text-lg">
                Start your recovery journey with personalized support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#006DB1' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-700">24/7 AI recovery assistant</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#006DB1' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-700">Personalized recovery protocols</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#006DB1' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-700">Direct messaging with care team</span>
                </li>
              </ul>
              <Button className="w-full" style={{ backgroundColor: '#006DB1', color: 'white' }}>
                <Heart className="mr-2 h-5 w-5" />
                Create Patient Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Staff Card */}
          <Card className="hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer" 
                onClick={() => router.push('/auth/staff-signup')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#002238' }}>
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl" style={{ color: '#002238' }}>I\'m Healthcare Staff</CardTitle>
              <CardDescription className="text-lg">
                Join your medical team on TJV Recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#002238' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-700">Manage patient recovery protocols</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#002238' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-700">Monitor patient progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#002238' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-700">Collaborate with care teams</span>
                </li>
              </ul>
              <Button className="w-full" style={{ backgroundColor: '#002238', color: 'white' }}>
                <Stethoscope className="mr-2 h-5 w-5" />
                Create Staff Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium" style={{ color: '#006DB1' }}>
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <Link href="/" className="hover:text-gray-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#006DB1' }} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignUpHandler />
    </Suspense>
  );
}