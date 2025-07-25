'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, AlertCircle, CheckCircle } from 'lucide-react';

function PatientAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  useEffect(() => {
    // Format phone number from URL params
    if (searchParams.get('phone')) {
      setPhoneNumber(searchParams.get('phone') || '');
    }
  }, [searchParams]);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+${digits}`;
    } else if (phone.startsWith('+')) {
      return phone;
    } else {
      return `+${digits}`;
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Check if there's an invitation for this phone number
      const { data: invitations } = await supabase
        .from('patient_invitations')
        .select('*')
        .eq('phone', formattedPhone)
        .in('status', ['pending', 'sent', 'opened'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (invitations && invitations.length > 0) {
        // Found an invitation
        setInvitationData(invitations[0]);
        setSuccess('We found your invitation! Please verify your phone number to continue.');
        
        // Send SMS verification code
        const { error: smsError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: false // Don't create user yet
          }
        });

        if (smsError) throw smsError;
        
        setShowVerification(true);
      } else {
        // No invitation found - check if patient exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('phone', formattedPhone)
          .single();

        if (existingUser) {
          // Existing patient - send login code
          const { error: smsError } = await supabase.auth.signInWithOtp({
            phone: formattedPhone
          });

          if (smsError) throw smsError;
          
          setSuccess('Welcome back! We sent a verification code to your phone.');
          setShowVerification(true);
        } else {
          setError('No invitation found for this phone number. Please contact your healthcare provider.');
        }
      }
    } catch (err) {
      console.error('Phone submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process phone number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Verify OTP
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms'
      });

      if (authError) throw authError;

      if (invitationData) {
        // This is a new patient with invitation
        // Accept the invitation and create account
        const { data: acceptResult, error: acceptError } = await supabase
          .rpc('accept_patient_invitation', {
            p_token: invitationData.invitation_token
          });

        if (acceptError) throw acceptError;

        // Create user account if needed
        if (!authData.user) {
          // Create account with invitation data
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            phone: formattedPhone,
            password: Math.random().toString(36).slice(-8), // Temp password
            options: {
              data: {
                role: 'patient',
                first_name: invitationData.first_name,
                last_name: invitationData.last_name,
                full_name: `${invitationData.first_name} ${invitationData.last_name}`,
                phone: formattedPhone,
                email: invitationData.email,
                tenant_id: invitationData.tenant_id,
                invited_by: invitationData.provider_id,
                date_of_birth: invitationData.date_of_birth,
                surgery_type: invitationData.surgery_type,
                surgery_date: invitationData.surgery_date
              }
            }
          });

          if (signUpError) throw signUpError;
        }

        // Route to patient profile page
        router.push(`/patient/${acceptResult.user_id}?welcome=true`);
      } else {
        // Existing patient login - get user ID from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.push(`/patient/${user.id}`);
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center" style={{ color: '#059669' }}>
            Patient Access
          </CardTitle>
          <CardDescription className="text-center">
            {showVerification 
              ? 'Enter the verification code sent to your phone'
              : 'Access your recovery portal with your phone number'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showVerification ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-600">
                  Enter the phone number associated with your patient account
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Are you a provider?{' '}
                  <a href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
                    Provider signup
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Have an invitation link?{' '}
                  <a href="/auth/invite" className="font-medium text-green-600 hover:text-green-500">
                    Use invitation link
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {invitationData && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium text-blue-900">Invitation Details:</p>
                  <p className="text-sm text-blue-700">
                    Provider: {invitationData.provider_name || 'Your Healthcare Provider'}
                  </p>
                  {invitationData.surgery_type && (
                    <p className="text-sm text-blue-700">
                      Surgery: {invitationData.surgery_type}
                    </p>
                  )}
                  {invitationData.surgery_date && (
                    <p className="text-sm text-blue-700">
                      Date: {new Date(invitationData.surgery_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  required
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-lg text-center tracking-widest focus:ring-2 focus:ring-green-500"
                  maxLength={6}
                />
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode('');
                  setError(null);
                  setSuccess(null);
                }}
              >
                Use a different phone number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PatientAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center" style={{ color: '#059669' }}>
              Patient Access
            </CardTitle>
            <CardDescription className="text-center">
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#059669' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PatientAccessForm />
    </Suspense>
  );
}