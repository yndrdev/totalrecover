'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

interface MigrationStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export default function MigrationPage() {
  const supabase = createClient();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<MigrationStep[]>([]);

  const updateStep = (name: string, status: MigrationStep['status'], message?: string) => {
    setSteps(prev => {
      const existing = prev.find(s => s.name === name);
      if (existing) {
        return prev.map(s => s.name === name ? { ...s, status, message } : s);
      }
      return [...prev, { name, status, message }];
    });
  };

  const runMigration = async () => {
    setIsRunning(true);
    setSteps([]);

    try {
      // Step 1: Create test users
      updateStep('Create Test Users', 'running');
      const testUsers = [
        {
          email: 'surgeon@tjv.com',
          password: 'demo123!',
          metadata: {
            role: 'provider',
            first_name: 'Dr. Sarah',
            last_name: 'Johnson',
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            provider_role: 'Surgeon'
          }
        },
        {
          email: 'nurse@tjv.com',
          password: 'demo123!',
          metadata: {
            role: 'provider',
            first_name: 'Nancy',
            last_name: 'Williams',
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            provider_role: 'Nurse'
          }
        },
        {
          email: 'pt@tjv.com',
          password: 'demo123!',
          metadata: {
            role: 'provider',
            first_name: 'Mike',
            last_name: 'Thompson',
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            provider_role: 'Physical Therapist'
          }
        },
        {
          email: 'patient@tjv.com',
          password: 'demo123!',
          metadata: {
            role: 'patient',
            first_name: 'John',
            last_name: 'Smith',
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef'
          }
        }
      ];

      let createdCount = 0;
      let existingCount = 0;

      for (const user of testUsers) {
        try {
          // First check if user exists
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            existingCount++;
            continue;
          }

          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: user.metadata
            }
          });

          if (authError) {
            if (authError.message.includes('already been registered')) {
              existingCount++;
              continue;
            }
            throw authError;
          }

          if (authData.user) {
            // Wait for trigger to create profile
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create provider record if it's a provider
            if (user.metadata.role === 'provider') {
              const { error: providerError } = await supabase
                .from('providers')
                .insert({
                  profile_id: authData.user.id,
                  tenant_id: user.metadata.tenant_id,
                  department: user.metadata.provider_role || 'General',
                  is_active: true
                });

              if (providerError && !providerError.message.includes('duplicate')) {
                console.error('Provider creation error:', providerError);
              }
            } else {
              // Create patient record
              const { error: patientError } = await supabase
                .from('patients')
                .insert({
                  profile_id: authData.user.id,
                  tenant_id: user.metadata.tenant_id,
                  mrn: 'MRN123456',
                  surgery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  surgery_type: 'TKA',
                  phone_number: '5551234567',
                  status: 'active'
                });

              if (patientError && !patientError.message.includes('duplicate')) {
                console.error('Patient creation error:', patientError);
              }
            }

            createdCount++;
          }
        } catch (error) {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }

      updateStep('Create Test Users', 'success', 
        `Created ${createdCount} users, ${existingCount} already existed`);

      // Step 2: Check database tables
      updateStep('Verify Database Schema', 'running');
      
      const tables = ['profiles', 'providers', 'patients', 'recovery_protocols', 'tasks', 'messages'];
      const tableResults = [];
      
      for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (!error) {
          tableResults.push(`✅ ${table}`);
        } else {
          tableResults.push(`❌ ${table}: ${error.message}`);
        }
      }
      
      updateStep('Verify Database Schema', 'success', tableResults.join(', '));

      // Step 3: Create sample protocol
      updateStep('Create Sample Protocol', 'running');
      
      const { data: protocol, error: protocolError } = await supabase
        .from('recovery_protocols')
        .insert({
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
          name: 'TJV Recovery Protocol',
          description: 'Standard recovery protocol for Total Joint Ventures',
          surgery_type: 'TKA',
          is_active: true
        })
        .select()
        .single();

      if (protocolError) {
        if (protocolError.message.includes('duplicate')) {
          updateStep('Create Sample Protocol', 'success', 'Protocol already exists');
        } else {
          updateStep('Create Sample Protocol', 'error', protocolError.message);
        }
      } else {
        updateStep('Create Sample Protocol', 'success', 'Created TJV Recovery Protocol');
      }

      // Final success message
      setTimeout(() => {
        setSteps(prev => [...prev, {
          name: 'Migration Complete',
          status: 'success',
          message: 'You can now test the authentication flows!'
        }]);
      }, 500);

    } catch (error) {
      console.error('Migration error:', error);
      updateStep('Migration Failed', 'error', 
        error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Migration Tool
          </CardTitle>
          <CardDescription>
            Apply database migrations and create test users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button 
              onClick={runMigration} 
              disabled={isRunning}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Migration...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Run Migration
                </>
              )}
            </Button>
          </div>

          {steps.length > 0 && (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <Alert key={index} variant={step.status === 'error' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-2">
                    {step.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                    {step.status === 'error' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                    {step.status === 'running' && <Loader2 className="h-5 w-5 animate-spin mt-0.5" />}
                    {step.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5" />}
                    <div className="flex-1">
                      <AlertDescription>
                        <strong>{step.name}</strong>
                        {step.message && <div className="text-sm mt-1">{step.message}</div>}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Accounts</h3>
              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Surgeon:</span>
                  <span>surgeon@tjv.com / demo123!</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Nurse:</span>
                  <span>nurse@tjv.com / demo123!</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Physical Therapist:</span>
                  <span>pt@tjv.com / demo123!</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Patient:</span>
                  <span>patient@tjv.com / demo123!</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Next Steps</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Test provider signup at <code className="bg-gray-200 px-1 rounded">/auth/signup</code></li>
                <li>Test patient access at <code className="bg-gray-200 px-1 rounded">/auth/patient-access</code></li>
                <li>Login with test accounts at <code className="bg-gray-200 px-1 rounded">/auth/login</code></li>
                <li>Use the auth flow test at <code className="bg-gray-200 px-1 rounded">/test/auth-flow</code></li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}