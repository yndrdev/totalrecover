'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuthFlowTestPage() {
  const supabase = createClient();
  const [results, setResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message?: string;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check Supabase connection
    await testSupabaseConnection();
    
    // Test 2: Create test provider
    await testCreateProvider();
    
    // Test 3: Create test patient
    await testCreatePatient();
    
    // Test 4: Test login
    await testLogin();

    setIsRunning(false);
  };

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message?: string) => {
    setResults(prev => [...prev, { test, status, message }]);
  };

  const testSupabaseConnection = async () => {
    addResult('Supabase Connection', 'pending');
    try {
      const { data, error } = await supabase.from('profiles').select('count');
      if (error) throw error;
      addResult('Supabase Connection', 'success', 'Connected successfully');
    } catch (error) {
      addResult('Supabase Connection', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testCreateProvider = async () => {
    addResult('Create Test Provider', 'pending');
    try {
      const email = `test-surgeon-${Date.now()}@test.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'test123!',
        options: {
          data: {
            role: 'provider',
            first_name: 'Test',
            last_name: 'Surgeon',
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            provider_role: 'Surgeon'
          }
        }
      });
      
      if (error) throw error;
      
      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create provider record
      if (data.user) {
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            profile_id: data.user.id,
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            department: 'Surgeon',
            is_active: true
          });
        
        if (providerError) {
          throw new Error(`Provider creation failed: ${providerError.message}`);
        }
      }
      
      addResult('Create Test Provider', 'success', `Created: ${email}`);
    } catch (error) {
      addResult('Create Test Provider', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testCreatePatient = async () => {
    addResult('Create Test Patient', 'pending');
    try {
      const email = `test-patient-${Date.now()}@test.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'test123!',
        options: {
          data: {
            role: 'patient',
            first_name: 'Test',
            last_name: 'Patient',
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef'
          }
        }
      });
      
      if (error) throw error;
      
      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create patient record
      if (data.user) {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            profile_id: data.user.id,
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            mrn: `MRN${Date.now()}`,
            surgery_date: new Date().toISOString(),
            surgery_type: 'TKA',
            phone_number: '5551234567',
            status: 'active'
          });
        
        if (patientError) {
          throw new Error(`Patient creation failed: ${patientError.message}`);
        }
      }
      
      addResult('Create Test Patient', 'success', `Created: ${email}`);
    } catch (error) {
      addResult('Create Test Patient', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testLogin = async () => {
    addResult('Test Login', 'pending');
    try {
      // Try to login with our test accounts
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'surgeon@tjv.com',
        password: 'demo123!'
      });
      
      if (error) throw error;
      
      // Sign out immediately
      await supabase.auth.signOut();
      
      addResult('Test Login', 'success', 'Login successful');
    } catch (error) {
      addResult('Test Login', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow Test</CardTitle>
          <CardDescription>
            Test the authentication and user creation flows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-6">
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result, index) => (
                <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
                  <div className="flex items-center gap-2">
                    {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {result.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                    {result.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
                    <AlertDescription>
                      <strong>{result.test}:</strong> {result.message || 'Processing...'}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Before running tests:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Run the SQL fix script in Supabase SQL Editor:
                <code className="block mt-1 p-2 bg-gray-100 rounded text-xs">
                  supabase/migrations/fix-user-creation-providers.sql
                </code>
              </li>
              <li>Make sure your Supabase project is running</li>
              <li>Check the Supabase logs for any errors</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold mb-2">Test Accounts (after running SQL):</h3>
            <ul className="space-y-1 text-sm">
              <li>• Surgeon: surgeon@tjv.com / demo123!</li>
              <li>• Nurse: nurse@tjv.com / demo123!</li>
              <li>• Physical Therapist: pt@tjv.com / demo123!</li>
              <li>• Patient: patient@tjv.com / demo123!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}