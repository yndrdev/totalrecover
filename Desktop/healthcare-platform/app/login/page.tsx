import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - TJV Recovery Platform",
  description: "Secure access to your personalized recovery journey",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-200/20 via-white to-blue-600/10">
      <div className="flex h-full min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          {/* Status Messages */}
          {params.message && (
            <div className="w-full p-4 rounded-xl bg-green-50 border-2 border-green-200 shadow-sm">
              <p className="text-green-700 text-center font-semibold">{params.message}</p>
            </div>
          )}
          
          {params.error && (
            <div className="w-full p-4 rounded-xl bg-red-50 border-2 border-red-200 shadow-sm">
              <p className="text-red-700 text-center font-semibold">{params.error}</p>
            </div>
          )}

          {/* Login Form Card */}
          <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-slate-200/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900">Sign In</CardTitle>
              <CardDescription className="text-blue-600 font-medium">
                Access your recovery dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-900/70 font-medium">
              🔒 Secure • HIPAA Compliant • Professional Healthcare
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
