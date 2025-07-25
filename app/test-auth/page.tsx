'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [email, setEmail] = useState('dr.chen@demo.tjv.com');
  const [password, setPassword] = useState('DemoPass123!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TestAuth] ${message}`);
  };

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    setLogs([]);
    
    addLog('Starting authentication test...');
    const startTime = Date.now();
    
    try {
      addLog('Creating Supabase client...');
      const supabase = createClient();
      addLog('Client created successfully');
      
      addLog(`Attempting login for: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const duration = Date.now() - startTime;
      addLog(`Auth response received after ${duration}ms`);
      
      if (error) {
        addLog(`Authentication failed: ${error.message}`);
        setResult({
          success: false,
          duration,
          error: error.message,
          errorCode: error.code,
          errorStatus: error.status
        });
      } else {
        addLog('Authentication successful!');
        setResult({
          success: true,
          duration,
          userId: data?.user?.id,
          email: data?.user?.email,
          session: data?.session ? 'Session created' : 'No session'
        });
        
        if (data?.session) {
          addLog('Signing out to clean up...');
          await supabase.auth.signOut();
          addLog('Signed out successfully');
        }
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      addLog(`Exception caught: ${err.message}`);
      setResult({
        success: false,
        duration,
        error: err.message || 'Unknown error',
        details: err.toString()
      });
    } finally {
      setLoading(false);
      addLog('Test completed');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Direct Authentication Test</h1>
      <p>This page tests authentication directly without middleware interference.</p>
      
      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div>
          <label>
            Email:<br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>
        </div>
        
        <div>
          <label>
            Password:<br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>
        </div>
        
        <button
          onClick={testAuth}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#ccc' : '#006DB1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>
      
      {logs.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <h3>Logs:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', fontFamily: 'monospace' }}>
            {logs.join('\n')}
          </pre>
        </div>
      )}
      
      {result && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: result.success ? '#e6f7e6' : '#ffe6e6', 
          borderRadius: '4px',
          border: `1px solid ${result.success ? '#4caf50' : '#f44336'}`
        }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h4>Available Demo Accounts:</h4>
        <ul style={{ marginTop: '0.5rem' }}>
          <li><strong>Provider:</strong> dr.chen@demo.tjv.com / DemoPass123!</li>
          <li><strong>Nurse:</strong> jane.smith@demo.tjv.com / DemoPass123!</li>
          <li><strong>Patient:</strong> john.doe@demo.com / DemoPass123!</li>
        </ul>
        <p style={{ marginTop: '1rem', fontSize: '14px', color: '#666' }}>
          <strong>Environment:</strong><br />
          BYPASS_AUTH: {process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' ? 'ENABLED' : 'DISABLED'}<br />
          Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}<br />
          Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
        </p>
      </div>
    </div>
  );
}