"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/design-system/Button";
import { Input } from "@/components/ui/design-system/Input";
import { Card } from "@/components/ui/design-system/Card";
import { Stethoscope, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { colors } from '@/lib/design-system/constants';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*, patients(id)")
          .eq("user_id", data.user.id)
          .single();

        if (profileError || !profile) {
          // If no profile found, try to create one from user metadata
          const userMeta = data.user.user_metadata || {};
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              user_id: data.user.id,
              email: data.user.email!,
              tenant_id: userMeta.tenant_id || 'demo-tenant-001',
              first_name: userMeta.first_name || '',
              last_name: userMeta.last_name || '',
              full_name: userMeta.full_name || 'User',
              role: userMeta.role || 'patient',
              is_active: true
            });
          
          if (createError) {
            console.error('Failed to create profile record:', createError);
            setError('Account setup incomplete. Please contact support.');
            return;
          }
        }

        setSuccess("Login successful! Redirecting...");

        if (onSuccess) {
          onSuccess();
        } else {
          // Route based on user role with proper ID-based routing
          const userRole = profile?.role || data.user.user_metadata?.role || 'patient';
          const userId = data.user.id;
          
          let destination = redirectTo;
          
          if (!destination) {
            switch (userRole) {
              case "patient":
                // For patients, use the patient record ID if available
                const patientId = profile?.patients?.[0]?.id || userId;
                destination = `/patient/patient-${patientId}`;
                break;
              case "surgeon":
              case "nurse":
              case "physical_therapist":
              case "provider":
                destination = `/provider/provider-${userId}`;
                break;
              case "admin":
                destination = `/practice/admin-${userId}`;
                break;
              case "super_admin":
                destination = `/saasadmin/admin-${userId}`;
                break;
              default:
                // Default to patient if role unknown
                destination = `/patient/patient-${userId}`;
            }
          }
          
          setTimeout(() => {
            router.push(destination);
          }, 1000);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType: "patient" | "provider" | "admin") => {
    // Set demo credentials and auto-login
    const credentials = {
      patient: { email: "sarah.johnson@demo.com", password: "demo123!" },
      provider: { email: "dr.smith@demo.com", password: "demo123!" },
      admin: { email: "admin@demo.com", password: "demo123!" }
    };

    const { email, password } = credentials[demoType];
    setEmail(email);
    setPassword(password);
    
    // Auto-submit after a short delay
    setTimeout(() => {
      const form = document.getElementById("login-form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="w-full">
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

      {/* Login Form */}
      <form id="login-form" onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with demo account</span>
        </div>
      </div>

      {/* Demo Login Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => handleDemoLogin("patient")}
          disabled={loading}
        >
          Login as Demo Patient
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => handleDemoLogin("provider")}
          disabled={loading}
        >
          Login as Demo Provider
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => handleDemoLogin("admin")}
          disabled={loading}
        >
          Login as Demo Admin
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
