"use client";

import React from "react";
import { HealthcareLayout } from "@/components/layout/healthcare-layout";
import { useRouter } from "next/navigation";
import { Plus, Package } from "lucide-react";

export default function PracticeProtocols() {
  const router = useRouter();

  return (
    <HealthcareLayout>
      <main className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Practice Protocols</h1>
              <p className="text-gray-600 mt-1">Manage and customize recovery protocols for your practice</p>
            </div>
            <button 
              onClick={() => router.push('/practice/protocols/builder')}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-4 py-2.5 text-base rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Protocol
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Protocols</h2>
            <p className="text-gray-600">Your practice protocols will appear here.</p>
          </div>
        </div>
      </main>
    </HealthcareLayout>
  );
}