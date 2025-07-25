"use client";

import { SignupForm } from "@/components/auth/signup-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full max-w-md space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        <SignupForm />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}