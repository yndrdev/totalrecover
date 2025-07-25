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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, UserPlus, AlertCircle, Users, Stethoscope, Activity, Shield, ArrowLeft, Heart } from 'lucide-react';

export default function StaffSignUpPage() {
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
    staffRole: '', // 'surgeon', 'nurse', 'physical_therapist', 'admin'
    licenseNumber: '',
    department: '',
    organizationName: ''
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

      // Validate staff role selected
      if (!formData.staffRole) {
        throw new Error('Please select your staff role');
      }

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: formData.staffRole,
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            license_number: formData.licenseNumber,
            department: formData.department,
            organization_name: formData.organizationName,
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
          role: formData.staffRole,
          is_active: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Redirect to signin page with success message
      router.push('/auth/signin?message=Account created successfully! Please sign in.&role=provider');
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#002238' }}>
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center" style={{ color: '#002238' }}>
            Create Your Staff Account
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Join the healthcare team at TJV Recovery
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

            {/* Staff Role Selection */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold" style={{ color: '#002238' }}>Select Your Role</Label>
              <RadioGroup
                value={formData.staffRole}
                onValueChange={(value) => setFormData({ ...formData, staffRole: value })}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="surgeon" id="surgeon" />
                    <Label htmlFor="surgeon" className="flex items-center cursor-pointer flex-1">
                      <Stethoscope className="h-5 w-5 mr-2" style={{ color: '#006DB1' }} />
                      <div>
                        <div className="font-medium">Surgeon</div>
                        <div className="text-sm text-gray-600">Orthopedic specialist</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="nurse" id="nurse" />
                    <Label htmlFor="nurse" className="flex items-center cursor-pointer flex-1">
                      <Heart className="h-5 w-5 mr-2" style={{ color: '#006DB1' }} />
                      <div>
                        <div className="font-medium">Nurse</div>
                        <div className="text-sm text-gray-600">Patient care specialist</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="physical_therapist" id="physical_therapist" />
                    <Label htmlFor="physical_therapist" className="flex items-center cursor-pointer flex-1">
                      <Activity className="h-5 w-5 mr-2" style={{ color: '#006DB1' }} />
                      <div>
                        <div className="font-medium">Physical Therapist</div>
                        <div className="text-sm text-gray-600">Rehabilitation specialist</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex items-center cursor-pointer flex-1">
                      <Shield className="h-5 w-5 mr-2" style={{ color: '#006DB1' }} />
                      <div>
                        <div className="font-medium">Administrator</div>
                        <div className="text-sm text-gray-600">Practice management</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

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

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#002238' }}>Professional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number (Optional)</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="e.g., MD123456"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="e.g., Orthopedics"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': '#006DB1' } as any}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Healthcare Organization</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="e.g., TJV Medical Center"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="focus:ring-2" 
                  style={{ '--tw-ring-color': '#006DB1' } as any}
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#002238' }}>Account Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="focus:ring-2" 
                  style={{ '--tw-ring-color': '#006DB1' } as any}
                  placeholder="your@healthcare.org"
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
              disabled={isLoading || !formData.staffRole}
              className="w-full py-6 text-lg"
              style={{ backgroundColor: '#002238', color: 'white' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Staff Account
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin?role=provider"
                  className="font-medium" 
                  style={{ color: '#006DB1' }}
                >
                  Staff sign in
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                Are you a patient?{' '}
                <Link href="/auth/patient-signup" className="font-medium text-gray-700 hover:text-gray-900">
                  Patient signup
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}