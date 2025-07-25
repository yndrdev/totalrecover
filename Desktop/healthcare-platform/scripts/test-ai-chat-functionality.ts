import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  responseTime?: number;
}

const testResults: TestResult[] = [];

// Test scenarios for different patient types
const TEST_SCENARIOS = {
  preOp: [
    {
      message: "What should I do to prepare for surgery?",
      expectedKeywords: ['prepare', 'surgery', 'before', 'pre-op']
    },
    {
      message: "I'm nervous about the procedure",
      expectedKeywords: ['understand', 'normal', 'support', 'help']
    },
    {
      message: "What can I eat before surgery?",
      expectedKeywords: ['diet', 'food', 'fasting', 'eat']
    },
    {
      message: "Show me today's tasks",
      expectedKeywords: ['task', 'today', 'complete']
    }
  ],
  postOp: [
    {
      message: "My pain level is 6 today",
      expectedKeywords: ['pain', 'medication', 'manage', 'care team']
    },
    {
      message: "When can I start walking?",
      expectedKeywords: ['walk', 'mobility', 'exercise', 'recovery']
    },
    {
      message: "I completed my exercises",
      expectedKeywords: ['great', 'good', 'progress', 'well done']
    },
    {
      message: "What medications should I take?",
      expectedKeywords: ['medication', 'prescribed', 'dose', 'schedule']
    }
  ]
};

async function testAIChat() {
  console.log('🚀 Starting AI Chat Functionality Tests\n');
  console.log('================================\n');

  // Check OpenAI API key
  if (!openaiApiKey) {
    console.warn('⚠️  WARNING: OpenAI API key not found. AI responses will use fallback mode.\n');
  } else {
    console.log('✅ OpenAI API key detected\n');
  }

  // Test 1: API Endpoint Availability
  console.log('📝 Test 1: API Endpoint Availability');
  try {
    const response = await fetch('http://localhost:3000/api/chat/protocol-ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test',
        patientId: 'test-id',
        conversationHistory: []
      })
    });

    if (response.status === 404) {
      testResults.push({
        test: 'API Endpoint Availability',
        status: 'FAIL',
        details: 'Endpoint not found (404)'
      });
    } else {
      testResults.push({
        test: 'API Endpoint Availability',
        status: 'PASS',
        details: `Status: ${response.status}`
      });
    }
  } catch (error) {
    testResults.push({
      test: 'API Endpoint Availability',
      status: 'FAIL',
      details: `Error: ${error}`
    });
  }

  // Test 2: Test with Demo Patients
  console.log('\n📝 Test 2: Testing with Demo Patients');
  
  // Find demo patients
  const { data: patients, error: patientsError } = await supabase
    .from('demo_patients')
    .select('*')
    .in('name', ['John Smith', 'Sarah Johnson']);

  if (patientsError || !patients || patients.length === 0) {
    console.log('❌ No demo patients found. Creating test patients...\n');
    
    // Create test patients
    const testPatients = [
      {
        name: 'John Smith',
        surgery_type: 'TKA',
        surgery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future (pre-op)
        recovery_day: -3
      },
      {
        name: 'Sarah Johnson',
        surgery_type: 'THA',
        surgery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (post-op)
        recovery_day: 5
      }
    ];

    for (const patient of testPatients) {
      const { error } = await supabase
        .from('demo_patients')
        .insert(patient);
      
      if (error) {
        console.error(`Failed to create ${patient.name}:`, error);
      } else {
        console.log(`✅ Created ${patient.name}`);
      }
    }
  }

  // Test 3: Pre-Op Patient Scenarios
  console.log('\n📝 Test 3: Pre-Op Patient (John Smith) Scenarios');
  const preOpPatient = patients?.find(p => p.name === 'John Smith');
  
  if (preOpPatient) {
    for (const scenario of TEST_SCENARIOS.preOp) {
      const startTime = Date.now();
      
      try {
        const response = await fetch('http://localhost:3000/api/chat/protocol-ai-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: scenario.message,
            patientId: preOpPatient.id,
            conversationHistory: []
          })
        });

        const responseTime = Date.now() - startTime;
        const data = await response.json();

        if (response.ok && data.response) {
          const hasKeywords = scenario.expectedKeywords.some(keyword => 
            data.response.toLowerCase().includes(keyword.toLowerCase())
          );

          testResults.push({
            test: `Pre-Op: "${scenario.message}"`,
            status: hasKeywords ? 'PASS' : 'FAIL',
            details: hasKeywords ? 'Response contains expected context' : 'Response lacks expected keywords',
            responseTime
          });

          console.log(`  ✅ "${scenario.message}"`);
          console.log(`     Response: ${data.response.substring(0, 100)}...`);
          console.log(`     Time: ${responseTime}ms\n`);
        } else {
          testResults.push({
            test: `Pre-Op: "${scenario.message}"`,
            status: 'FAIL',
            details: data.error || 'Unknown error'
          });
        }
      } catch (error) {
        testResults.push({
          test: `Pre-Op: "${scenario.message}"`,
          status: 'FAIL',
          details: `Error: ${error}`
        });
      }
    }
  }

  // Test 4: Post-Op Patient Scenarios
  console.log('\n📝 Test 4: Post-Op Patient (Sarah Johnson) Scenarios');
  const postOpPatient = patients?.find(p => p.name === 'Sarah Johnson');
  
  if (postOpPatient) {
    for (const scenario of TEST_SCENARIOS.postOp) {
      const startTime = Date.now();
      
      try {
        const response = await fetch('http://localhost:3000/api/chat/protocol-ai-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: scenario.message,
            patientId: postOpPatient.id,
            conversationHistory: []
          })
        });

        const responseTime = Date.now() - startTime;
        const data = await response.json();

        if (response.ok && data.response) {
          const hasKeywords = scenario.expectedKeywords.some(keyword => 
            data.response.toLowerCase().includes(keyword.toLowerCase())
          );

          testResults.push({
            test: `Post-Op: "${scenario.message}"`,
            status: hasKeywords ? 'PASS' : 'FAIL',
            details: hasKeywords ? 'Response contains expected context' : 'Response lacks expected keywords',
            responseTime
          });

          console.log(`  ✅ "${scenario.message}"`);
          console.log(`     Response: ${data.response.substring(0, 100)}...`);
          console.log(`     Time: ${responseTime}ms\n`);
        } else {
          testResults.push({
            test: `Post-Op: "${scenario.message}"`,
            status: 'FAIL',
            details: data.error || 'Unknown error'
          });
        }
      } catch (error) {
        testResults.push({
          test: `Post-Op: "${scenario.message}"`,
          status: 'FAIL',
          details: `Error: ${error}`
        });
      }
    }
  }

  // Test 5: Error Handling
  console.log('\n📝 Test 5: Error Handling');
  
  // Test with invalid patient ID
  try {
    const response = await fetch('http://localhost:3000/api/chat/protocol-ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test message',
        patientId: 'invalid-id',
        conversationHistory: []
      })
    });

    const data = await response.json();
    
    if (response.status === 404 && data.error) {
      testResults.push({
        test: 'Error Handling - Invalid Patient',
        status: 'PASS',
        details: 'Properly handles invalid patient ID'
      });
    } else {
      testResults.push({
        test: 'Error Handling - Invalid Patient',
        status: 'FAIL',
        details: 'Should return 404 for invalid patient'
      });
    }
  } catch (error) {
    testResults.push({
      test: 'Error Handling - Invalid Patient',
      status: 'FAIL',
      details: `Error: ${error}`
    });
  }

  // Test 6: Performance Testing
  console.log('\n📝 Test 6: Performance Testing');
  
  const performanceTests = [];
  for (let i = 0; i < 5; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:3000/api/chat/protocol-ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'How are you feeling today?',
          patientId: postOpPatient?.id || 'test-id',
          conversationHistory: []
        })
      });

      const responseTime = Date.now() - startTime;
      performanceTests.push(responseTime);
    } catch (error) {
      console.error('Performance test error:', error);
    }
  }

  if (performanceTests.length > 0) {
    const avgResponseTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    const maxResponseTime = Math.max(...performanceTests);
    
    testResults.push({
      test: 'Performance - Average Response Time',
      status: avgResponseTime < 3000 ? 'PASS' : 'FAIL',
      details: `${avgResponseTime.toFixed(0)}ms (Target: <3000ms)`,
      responseTime: avgResponseTime
    });

    testResults.push({
      test: 'Performance - Max Response Time',
      status: maxResponseTime < 5000 ? 'PASS' : 'FAIL',
      details: `${maxResponseTime}ms (Target: <5000ms)`,
      responseTime: maxResponseTime
    });
  }

  // Print Summary
  console.log('\n================================');
  console.log('TEST SUMMARY');
  console.log('================================\n');

  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / testResults.length) * 100).toFixed(1)}%\n`);

  // Detailed Results
  console.log('DETAILED RESULTS:');
  console.log('=================\n');

  testResults.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.responseTime) {
      console.log(`   Response Time: ${result.responseTime}ms`);
    }
    console.log('');
  });

  // Recommendations
  console.log('\nRECOMMENDATIONS:');
  console.log('================\n');

  if (!openaiApiKey) {
    console.log('⚠️  Set up OpenAI API key for full AI functionality');
  }

  if (failedTests > 0) {
    console.log('⚠️  Address failing tests before production deployment');
  }

  const slowTests = testResults.filter(r => r.responseTime && r.responseTime > 2000);
  if (slowTests.length > 0) {
    console.log('⚠️  Optimize slow responses for better user experience');
  }

  console.log('\n✅ Testing complete!\n');
}

// Run the tests
testAIChat().catch(console.error);