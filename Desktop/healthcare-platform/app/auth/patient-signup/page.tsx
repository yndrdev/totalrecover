'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, AlertCircle, Heart, ArrowLeft } from 'lucide-react';

export default function PatientSignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    surgeryType: '',
    surgeryDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'patient',
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
            tenant_id: 'demo-tenant-001'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          user_id: authData.user.id,
          tenant_id: 'demo-tenant-001',
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          role: 'patient',
          is_active: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Create patient record
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: authData.user.id,
          tenant_id: 'demo-tenant-001',
          surgery_type: formData.surgeryType || 'TKA',
          surgery_date: formData.surgeryDate || new Date().toISOString()
        });

      if (patientError) {
        console.error('Patient record creation error:', patientError);
      }

      // Redirect to signin page with success message
      router.push('/auth/signin?message=Account created successfully! Please sign in.&role=patient');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-4">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8DBE9' }}>
              <Heart className="h-8 w-8" style={{ color: '#002238' }} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center" style={{ color: '#002238' }}>
            Create Your Patient Account
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Join your personalized recovery journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#002238' }}>Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
              </div>
            </div>

            {/* Surgery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#002238' }}>Surgery Information (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surgeryType">Surgery Type</Label>
                  <select
                    id="surgeryType"
                    value={formData.surgeryType}
                    onChange={(e) => setFormData({ ...formData, surgeryType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  >
                    <option value="">Select surgery type</option>
                    <option value="TKA">Total Knee Replacement</option>
                    <option value="THA">Total Hip Replacement</option>
                    <option value="TSA">Total Shoulder Replacement</option>
                    <option value="ACL">ACL Reconstruction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgeryDate">Surgery Date</Label>
                  <Input
                    id="surgeryDate"
                    type="date"
                    value={formData.surgeryDate}
                    onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#002238' }}>Account Information</h3>
              
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 text-lg"
              style={{ backgroundColor: '#006DB1', color: 'white' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Patient Account
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin?role=patient"
                  className="font-medium" 
                  style={{ color: '#006DB1' }}
                >
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                Are you a healthcare provider?{' '}
                <Link href="/auth/staff-signup" className="font-medium text-gray-700 hover:text-gray-900">
                  Staff signup
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}