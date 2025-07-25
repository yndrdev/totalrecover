'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { invitationService } from '@/lib/services/invitation-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, AlertCircle, CheckCircle, Calendar, Stethoscope } from 'lucide-react';

interface InvitationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  surgery_type?: string | null;
  surgery_date?: string | null;
  custom_message?: string | null;
  provider_name?: string;
  practice_name?: string;
  tenant_id: string;
  provider_id: string;
  practice_id?: string;
  date_of_birth?: string | null;
}

export default function InvitationAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      // Validate the invitation token
      const validationResult = await invitationService.validateInvitation(token);
      
      if (!validationResult.valid || !validationResult.invitation) {
        setError(validationResult.error || 'Invalid invitation');
        setIsValid(false);
        return;
      }

      // Get provider and practice info
      const { data: providerData } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', validationResult.invitation.provider_id)
        .single();

      let providerName = 'Your Healthcare Provider';
      let practiceName = 'Healthcare Team';

      if (providerData) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', providerData.user_id)
          .single();
        
        if (userData) {
          providerName = userData.full_name;
        }

        const { data: practiceData } = await supabase
          .from('practices')
          .select('name')
          .eq('id', validationResult.invitation.practice_id || '')
          .single();
        
        if (practiceData) {
          practiceName = practiceData.name;
        }
      }

      const invitationWithDetails: InvitationData = {
        ...validationResult.invitation,
        provider_name: providerName,
        practice_name: practiceName
      };

      setInvitation(invitationWithDetails);
      setFormData(prev => ({
        ...prev,
        phone: invitationWithDetails.phone || '',
        dateOfBirth: invitationWithDetails.date_of_birth || ''
      }));
      setIsValid(true);

      // Mark invitation as opened
      await invitationService.markInvitationOpened(token);
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation');
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!invitation) {
        throw new Error('No invitation data');
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Accept invitation (this will mark it as accepted in the database)
      const { data: acceptResult, error: acceptError } = await supabase
        .rpc('accept_patient_invitation', {
          p_token: token
        });

      if (acceptError) throw acceptError;

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            role: 'patient',
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            full_name: `${invitation.first_name} ${invitation.last_name}`,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
            tenant_id: invitation.tenant_id,
            invited_by: invitation.provider_id,
            surgery_type: invitation.surgery_type,
            surgery_date: invitation.surgery_date
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Wait a moment for the database trigger to create records
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create user record manually if needed
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: invitation.email,
          full_name: `${invitation.first_name} ${invitation.last_name}`,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          role: 'patient',
          tenant_id: invitation.tenant_id,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          is_active: true
        });

      if (userError) {
        console.error('Error creating user record:', userError);
      }

      // Create patient record
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          profile_id: authData.user.id,
          tenant_id: invitation.tenant_id,
          practice_id: invitation.practice_id || null,
          mrn: `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          date_of_birth: formData.dateOfBirth,
          surgery_date: invitation.surgery_date || null,
          surgery_type: invitation.surgery_type || null,
          primary_provider_id: invitation.provider_id,
          phone_number: formData.phone,
          status: 'active'
        });

      if (patientError) {
        console.error('Error creating patient record:', patientError);
      }

      // Update invitation with created user info
      await invitationService.updateInvitationStatus(invitation.id, 'accepted', {
        created_user_id: authData.user.id
      });

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: formData.password
      });

      if (signInError) {
        // If sign in fails, redirect to login
        router.push('/login?message=Account created successfully! Please sign in.');
      } else {
        // Redirect to patient page with profile ID
        router.push(`/patient/${authData.user.id}?welcome=true`);
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Validating invitation...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'This invitation link is invalid or has expired.'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Please contact your healthcare provider for a new invitation.
              </p>
              <Button variant="outline" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center" style={{ color: '#059669' }}>
            Welcome to Your Healthcare Journey
          </CardTitle>
          <CardDescription className="text-center">
            Complete your registration to access your recovery portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Invitation Details */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <p className="font-medium text-blue-900">
                Invited by {invitation.provider_name}
              </p>
            </div>
            {invitation.practice_name && (
              <p className="text-sm text-blue-700 ml-7">
                {invitation.practice_name}
              </p>
            )}
            {invitation.surgery_type && (
              <div className="flex items-center gap-2 ml-7">
                <p className="text-sm text-blue-700">
                  Procedure: {invitation.surgery_type}
                </p>
              </div>
            )}
            {invitation.surgery_date && (
              <div className="flex items-center gap-2 ml-7">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Scheduled: {new Date(invitation.surgery_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {invitation.custom_message && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-800 italic">
                  &ldquo;{invitation.custom_message}&rdquo;
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Pre-filled Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={invitation.first_name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={invitation.last_name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={invitation.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Editable Fields */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Your Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Accept Invitation & Create Account
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in instead
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}