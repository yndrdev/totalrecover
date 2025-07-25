"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/design-system/Button";
import { Input } from "@/components/ui/design-system/Input";
import { Card } from "@/components/ui/design-system/Card";
import { Stethoscope, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle } from "lucide-react";
import { colors } from '@/lib/design-system/constants';

interface SignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SignupForm({ onSuccess, redirectTo }: SignupFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    userType: "patient" as "patient" | "provider" | "nurse" | "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.userType,
            tenant_id: 'demo-tenant-001', // Default tenant for demo
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // Create user record
        const { error: userError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.name,
            role: formData.userType,
            tenant_id: 'demo-tenant-001', // Default tenant for demo
            is_active: true,
          });

        if (userError) {
          console.error("User record creation error:", userError);
          setError("Failed to create user record. Please contact support.");
          return;
        }

        // Create role-specific records if needed
        if (formData.userType === 'patient') {
          const [firstName, ...lastNameParts] = formData.name.split(' ');
          const lastName = lastNameParts.join(' ') || 'Unknown';
          
          const { error: patientError } = await supabase
            .from('patients')
            .insert({
              user_id: data.user.id,
              tenant_id: 'demo-tenant-001',
              mrn: `PAT-${Date.now()}`,
              first_name: firstName,
              last_name: lastName,
              email: formData.email,
              status: 'active',
              preferred_language: 'en'
            });
          
          if (patientError) {
            console.error('Failed to create patient record:', patientError);
          }
        } else if (['provider', 'nurse', 'admin'].includes(formData.userType)) {
          const { error: providerError } = await supabase
            .from('providers')
            .insert({
              user_id: data.user.id,
              tenant_id: 'demo-tenant-001',
              specialty: formData.userType === 'provider' ? 'General Practice' : formData.userType,
              credentials: [],
              is_primary_surgeon: formData.userType === 'provider'
            });
          
          if (providerError) {
            console.error('Failed to create provider record:', providerError);
          }
        }

        setSuccess("Account created successfully! Please check your email to verify your account.");

        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect after a delay
          setTimeout(() => {
            const destination = redirectTo || "/login";
            router.push(destination);
          }, 3000);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  {/* <thinking>
  Visual Design: Professional signup form matching login design
  Healthcare Context: Collecting minimal required information for HIPAA compliance
  UX Design: Clear user type selection and password validation
  </thinking> */}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md" variant="elevated">
        <div className="p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-gray-900 rounded-full mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600 mt-2">Join TJV Recovery Platform</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: "patient" }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.userType === "patient"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={loading}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${
                  formData.userType === "patient" ? "text-blue-600" : "text-gray-600"
                }`} />
                <span className={`text-sm font-medium ${
                  formData.userType === "patient" ? "text-blue-900" : "text-gray-700"
                }`}>
                  Patient
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: "provider" }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.userType === "provider"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={loading}
              >
                <Briefcase className={`w-6 h-6 mx-auto mb-2 ${
                  formData.userType === "provider" ? "text-blue-600" : "text-gray-600"
                }`} />
                <span className={`text-sm font-medium ${
                  formData.userType === "provider" ? "text-blue-900" : "text-gray-700"
                }`}>
                  Provider
                </span>
              </button>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="Enter your full name"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="Enter your email"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  placeholder="Minimum 8 characters"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  placeholder="Re-enter your password"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading || success !== null}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}