'use client';

import { Suspense } from 'react';
import ManusStyleChatInterface from '@/components/chat/ManusStyleChatInterface';
import { useUserContext } from '@/components/auth/user-provider';

export default function ManusChatPage() {
  const { user } = useUserContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
            <p className="text-gray-600 font-medium">Loading Manus-style chat interface...</p>
          </div>
        </div>
      }>
        <ManusStyleChatInterface 
          patientId={user?.id}
          mode="patient"
        />
      </Suspense>
    </div>
  );
}