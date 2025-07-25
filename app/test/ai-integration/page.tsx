'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIIntegrationTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testScenarios = [
    {
      name: 'Basic Health Check',
      type: 'health',
      description: 'Test if OpenAI is configured correctly'
    },
    {
      name: 'Simple Conversation',
      type: 'basic',
      description: 'Test basic conversational response'
    },
    {
      name: 'Medical Context',
      type: 'medical',
      description: 'Test medical advice with patient context'
    },
    {
      name: 'Task Completion',
      type: 'task',
      description: 'Test task-related responses'
    }
  ];

  const runTest = async (testType: string) => {
    setLoading(true);
    try {
      const endpoint = testType === 'health' ? '/api/chat/test-ai' : '/api/chat/test-ai';
      const method = testType === 'health' ? 'GET' : 'POST';
      const body = testType === 'health' ? undefined : JSON.stringify({ testType });

      const response = await fetch(endpoint, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body
      });

      const data = await response.json();
      
      setResults(prev => [...prev, {
        testType,
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      }]);
    } catch (error: any) {
      setResults(prev => [...prev, {
        testType,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runFullTest = async () => {
    setLoading(true);
    setResults([]);
    
    // Test full AI response flow
    try {
      const response = await fetch('/api/chat/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "I'm feeling good today and completed my exercises!",
          context: {
            recoveryDay: 10,
            surgeryType: 'Total Knee Replacement',
            lastPainLevel: 3,
            recentProgress: 'Steady improvement'
          },
          patientId: 'test-patient-123',
          conversationId: 'test-conversation-123',
          recoveryDay: 10,
          patientTasks: [
            {
              id: 'task-1',
              title: 'Knee Flexion Exercise',
              status: 'pending',
              type: 'exercise'
            }
          ]
        })
      });

      const data = await response.json();
      
      setResults(prev => [...prev, {
        testType: 'full-integration',
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      }]);
    } catch (error: any) {
      setResults(prev => [...prev, {
        testType: 'full-integration',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OpenAI Integration Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testScenarios.map((scenario) => (
              <div key={scenario.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </div>
                <Button
                  onClick={() => runTest(scenario.type)}
                  disabled={loading}
                  size="sm"
                >
                  Run Test
                </Button>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div>
                <h3 className="font-semibold">Full Integration Test</h3>
                <p className="text-sm text-gray-600">Test complete AI response flow with patient context</p>
              </div>
              <Button
                onClick={runFullTest}
                disabled={loading}
                variant="primary"
              >
                Run Full Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test Results</CardTitle>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">
                      Test: {result.testType}
                    </h4>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  {result.data?.response && (
                    <div className="mb-2">
                      <strong>AI Response:</strong>
                      <p className="mt-1 p-2 bg-white rounded border">{result.data.response}</p>
                    </div>
                  )}
                  
                  {result.data?.usage && (
                    <div className="mb-2 text-sm text-gray-600">
                      <strong>Token Usage:</strong> {result.data.usage.total_tokens} 
                      (Prompt: {result.data.usage.prompt_tokens}, Completion: {result.data.usage.completion_tokens})
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="mb-2">
                      <strong>Error:</strong>
                      <p className="mt-1 text-red-600">{result.error}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      View Full Response
                    </summary>
                    <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-center">Running test...</p>
          </div>
        </div>
      )}
    </div>
  );
}