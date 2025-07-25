'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SimpleLoginPage() {
  const router = useRouter();

  const quickAccess = (role: string, path: string) => {
    // Since BYPASS_AUTH is true, just redirect directly
    console.log(`[SimpleLogin] Quick access as ${role} to ${path}`);
    router.push(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: '#002238' }}>
          Quick Demo Access
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          Authentication is bypassed. Click any role to access the platform.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => quickAccess('provider', '/provider/patients')}
            className="w-full py-6 text-lg"
            style={{ backgroundColor: '#002238', color: 'white' }}
          >
            Access as Provider (Dr. Chen)
          </Button>

          <Button 
            onClick={() => quickAccess('patient', '/preop')}
            className="w-full py-6 text-lg"
            style={{ backgroundColor: '#006DB1', color: 'white' }}
          >
            Access as Pre-Op Patient (John Doe)
          </Button>

          <Button 
            onClick={() => quickAccess('patient', '/postop')}
            className="w-full py-6 text-lg"
            style={{ backgroundColor: '#006DB1', color: 'white' }}
          >
            Access as Post-Op Patient (Mary Johnson)
          </Button>

          <Button 
            onClick={() => quickAccess('practice', '/practice/protocols')}
            className="w-full py-6 text-lg"
            variant="outline"
          >
            Access as Practice Admin
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This is a demo environment with authentication disabled. 
            In production, users would need to sign in with credentials.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-center">
            <a 
              href="/test-auth" 
              className="text-sm text-blue-600 hover:underline"
            >
              Test Authentication System →
            </a>
          </div>
          <div className="text-center">
            <a 
              href="/auth/signin" 
              className="text-sm text-blue-600 hover:underline"
            >
              Use Regular Sign In →
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}