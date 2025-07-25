"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataService } from '@/lib/services/dataService';
import OptimizedQueries from '@/lib/performance/optimizedQueries';
import realtimeManager, { realtimeSubscriptions } from '@/lib/realtime/RealtimeManager';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  RefreshCw,
  Database,
  Zap,
  Users,
  Building,
  MessageCircle,
  Activity,
  AlertTriangle,
  FileText,
  Settings,
  TestTube
} from 'lucide-react';

interface HierarchyTestInterfaceProps {
  user: any;
  profile: any;
}

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  details?: any;
  duration?: number;
}

export default function HierarchyTestInterface({ user, profile }: HierarchyTestInterfaceProps) {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [connectionStatus, setConnectionStatus] = useState<any>({});
  const [cacheStats, setCacheStats] = useState<any>({});

  useEffect(() => {
    // Monitor real-time connection status
    const unsubscribe = realtimeManager.onConnectionChange((status) => {
      setConnectionStatus(status);
    });

    // Update cache stats periodically
    const interval = setInterval(() => {
      setCacheStats(OptimizedQueries.getCacheStats());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateTestResult = (testName: string, update: Partial<TestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { ...prev[testName], ...update }
    }));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    setCurrentTest(testName);
    
    updateTestResult(testName, { 
      status: 'running', 
      result: undefined, 
      details: undefined 
    });

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, {
        status: 'success',
        result: 'Test passed successfully',
        details: result,
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, {
        status: 'error',
        result: error instanceof Error ? error.message : 'Test failed',
        details: error,
        duration
      });
    } finally {
      setCurrentTest(null);
    }
  };

  // Test Suite Definitions
  const testSuites = {
    dataService: {
      name: 'Data Service Layer',
      icon: Database,
      tests: {
        'basic_crud': {
          name: 'Basic CRUD Operations',
          description: 'Test create, read, update, delete operations',
          test: async () => {
            // Test basic tenant operations
            const tenants = await DataService.getAllPractices();
            if (!Array.isArray(tenants)) throw new Error('Failed to fetch practices');

            // Test metrics
            const metrics = await DataService.getTenantMetrics(profile.tenant_id);
            if (typeof metrics !== 'object') throw new Error('Failed to fetch metrics');

            return { 
              practicesCount: tenants.length, 
              metricsKeys: Object.keys(metrics) 
            };
          }
        },
        'patient_operations': {
          name: 'Patient Management',
          description: 'Test patient data operations and relationships',
          test: async () => {
            const patients = await DataService.getPatientsWithDetails(profile.tenant_id);
            if (!Array.isArray(patients)) throw new Error('Failed to fetch patients');

            // Test patient details if patients exist
            if (patients.length > 0) {
              const patientDetails = await DataService.getPatientDetails(patients[0].id);
              if (!patientDetails) throw new Error('Failed to fetch patient details');
            }

            return { 
              patientsCount: patients.length,
              hasDetails: patients.length > 0
            };
          }
        },
        'conversation_operations': {
          name: 'Conversation Management',
          description: 'Test chat and messaging functionality',
          test: async () => {
            const conversations = await DataService.getActiveConversations(profile.tenant_id);
            if (!Array.isArray(conversations)) throw new Error('Failed to fetch conversations');

            // Test message operations if conversations exist
            if (conversations.length > 0) {
              const messages = await DataService.getConversationMessages(conversations[0].id);
              if (!Array.isArray(messages)) throw new Error('Failed to fetch messages');
            }

            return { 
              conversationsCount: conversations.length,
              hasMessages: conversations.length > 0
            };
          }
        }
      }
    },
    
    optimization: {
      name: 'Performance Optimization',
      icon: Zap,
      tests: {
        'cached_queries': {
          name: 'Query Caching',
          description: 'Test cached query performance and invalidation',
          test: async () => {
            const startTime = Date.now();
            
            // First query (should cache)
            await OptimizedQueries.getOptimizedPatientList(profile.tenant_id);
            const firstQueryTime = Date.now() - startTime;

            // Second query (should use cache)
            const cacheStartTime = Date.now();
            await OptimizedQueries.getOptimizedPatientList(profile.tenant_id);
            const cacheQueryTime = Date.now() - cacheStartTime;

            // Cache should be significantly faster
            const speedImprovement = firstQueryTime / Math.max(cacheQueryTime, 1);

            return {
              firstQueryTime,
              cacheQueryTime,
              speedImprovement: Math.round(speedImprovement * 100) / 100,
              cacheSize: OptimizedQueries.getCacheStats().size
            };
          }
        },
        'batch_operations': {
          name: 'Batch Operations',
          description: 'Test efficient batch data operations',
          test: async () => {
            // Test prefetch
            const startTime = Date.now();
            await OptimizedQueries.prefetchCommonData(profile.tenant_id);
            const prefetchTime = Date.now() - startTime;

            // Test metrics optimization
            const metricsStartTime = Date.now();
            await OptimizedQueries.getOptimizedMetrics(profile.tenant_id);
            const metricsTime = Date.now() - metricsStartTime;

            return {
              prefetchTime,
              metricsTime,
              cacheStats: OptimizedQueries.getCacheStats()
            };
          }
        }
      }
    },

    realtime: {
      name: 'Real-time System',
      icon: Activity,
      tests: {
        'connection_management': {
          name: 'Connection Management',
          description: 'Test real-time connection handling and reconnection',
          test: async () => {
            const connectionStatus = realtimeManager.getConnectionStatus();
            
            // Test force reconnect
            await realtimeManager.forceReconnect();
            
            // Wait a moment for reconnection
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newConnectionStatus = realtimeManager.getConnectionStatus();

            return {
              initialStatus: connectionStatus,
              afterReconnect: newConnectionStatus,
              reconnectWorking: newConnectionStatus.state !== 'error'
            };
          }
        },
        'subscription_setup': {
          name: 'Subscription Management',
          description: 'Test real-time subscription setup and cleanup',
          test: async () => {
            const testCallbacks = {
              onPatientChange: () => {},
              onTaskUpdate: () => {},
              onNewAlert: () => {}
            };

            // Setup subscription
            await realtimeSubscriptions.setupPatientMonitoring(
              profile.tenant_id, 
              testCallbacks
            );

            const statusAfterSetup = realtimeManager.getConnectionStatus();

            // Cleanup
            realtimeManager.unsubscribe(`patient-monitoring-${profile.tenant_id}`);

            return {
              subscriptionSetup: statusAfterSetup.channelCount > 0,
              channelsActive: statusAfterSetup.channelCount
            };
          }
        }
      }
    },

    hierarchy: {
      name: 'Page Hierarchy',
      icon: Building,
      tests: {
        'saas_dashboard': {
          name: 'SaaS Dashboard Access',
          description: 'Test SaaS admin dashboard functionality',
          test: async () => {
            // Test platform metrics
            const platformMetrics = await DataService.getPlatformMetrics();
            const practices = await DataService.getAllPractices();

            return {
              platformMetrics,
              practicesCount: practices.length,
              metricsComplete: Object.keys(platformMetrics).length >= 4
            };
          }
        },
        'practice_admin': {
          name: 'Practice Admin Dashboard',
          description: 'Test practice-level management functionality',
          test: async () => {
            const practiceData = await DataService.getPracticeWithClinics(profile.tenant_id);
            const providers = await DataService.getProviders(profile.tenant_id);
            const protocols = await DataService.getRecoveryProtocols(profile.tenant_id);

            return {
              practiceLoaded: !!practiceData,
              clinicsCount: practiceData?.clinics?.length || 0,
              providersCount: providers.length,
              protocolsCount: protocols.length
            };
          }
        },
        'clinic_dashboard': {
          name: 'Clinic Dashboard',
          description: 'Test clinic-level patient and provider management',
          test: async () => {
            const patients = await DataService.getPatientsWithDetails(profile.tenant_id);
            const conversations = await DataService.getActiveConversations(profile.tenant_id);
            const alerts = await DataService.getAlerts(profile.tenant_id);

            return {
              patientsLoaded: Array.isArray(patients),
              patientsCount: patients.length,
              conversationsCount: conversations.length,
              alertsCount: alerts.length
            };
          }
        },
        'patient_dashboard': {
          name: 'Patient Dashboard',
          description: 'Test patient recovery dashboard functionality',
          test: async () => {
            const patients = await DataService.getPatientsWithDetails(profile.tenant_id);
            
            if (patients.length === 0) {
              return { 
                note: 'No patients available for testing',
                patientsCount: 0 
              };
            }

            const patient = patients[0];
            const metrics = await DataService.getPatientMetrics(patient.id);
            const tasks = await DataService.getPatientTasks(patient.id);

            return {
              patientLoaded: !!patient,
              metricsLoaded: !!metrics,
              tasksCount: tasks.length,
              recoveryDay: patient.current_recovery_day
            };
          }
        }
      }
    },

    integration: {
      name: 'End-to-End Integration',
      icon: TestTube,
      tests: {
        'data_flow': {
          name: 'Complete Data Flow',
          description: 'Test data flow across all hierarchy levels',
          test: async () => {
            // Test complete data pipeline
            const practices = await DataService.getAllPractices();
            let testPractice = practices.find(p => p.id === profile.tenant_id);
            
            if (!testPractice && practices.length > 0) {
              testPractice = practices[0];
            }

            if (!testPractice) {
              throw new Error('No practice available for testing');
            }

            const practiceData = await DataService.getPracticeWithClinics(testPractice.id);
            const patients = await DataService.getPatientsWithDetails(testPractice.id);
            const conversations = await DataService.getActiveConversations(testPractice.id);
            const metrics = await DataService.getTenantMetrics(testPractice.id);

            return {
              practiceId: testPractice.id,
              practiceName: testPractice.name,
              clinicsCount: practiceData.clinics?.length || 0,
              patientsCount: patients.length,
              conversationsCount: conversations.length,
              metrics,
              dataFlowComplete: true
            };
          }
        },
        'realtime_integration': {
          name: 'Real-time Data Integration',
          description: 'Test real-time updates with data service',
          test: async () => {
            // Setup real-time monitoring
            let messageReceived = false;
            let alertReceived = false;

            const callbacks = {
              onPatientChange: () => { messageReceived = true; },
              onTaskUpdate: () => { messageReceived = true; },
              onNewAlert: () => { alertReceived = true; }
            };

            await realtimeSubscriptions.setupPatientMonitoring(
              profile.tenant_id,
              callbacks
            );

            // Test cache invalidation on data change
            const initialCacheSize = OptimizedQueries.getCacheStats().size;
            OptimizedQueries.invalidateCache('patients', null);
            const afterInvalidation = OptimizedQueries.getCacheStats().size;

            // Cleanup
            realtimeManager.unsubscribe(`patient-monitoring-${profile.tenant_id}`);

            return {
              subscriptionActive: true,
              cacheInvalidationWorks: afterInvalidation < initialCacheSize,
              initialCacheSize,
              afterInvalidation,
              realtimeSetup: realtimeManager.getConnectionStatus()
            };
          }
        },
        'performance_validation': {
          name: 'Performance Validation',
          description: 'Validate system performance under load',
          test: async () => {
            const performanceTests = [];

            // Test 1: Multiple concurrent queries
            const startTime = Date.now();
            const concurrentPromises = [
              DataService.getTenantMetrics(profile.tenant_id),
              DataService.getPatientsWithDetails(profile.tenant_id),
              DataService.getActiveConversations(profile.tenant_id),
              DataService.getProviders(profile.tenant_id)
            ];

            await Promise.all(concurrentPromises);
            const concurrentTime = Date.now() - startTime;

            // Test 2: Cache performance
            const cacheStartTime = Date.now();
            await OptimizedQueries.getOptimizedMetrics(profile.tenant_id);
            const firstQuery = Date.now() - cacheStartTime;

            const cacheStartTime2 = Date.now();
            await OptimizedQueries.getOptimizedMetrics(profile.tenant_id);
            const cachedQuery = Date.now() - cacheStartTime2;

            return {
              concurrentQueriesTime: concurrentTime,
              firstQueryTime: firstQuery,
              cachedQueryTime: cachedQuery,
              cacheSpeedImprovement: Math.round((firstQuery / Math.max(cachedQuery, 1)) * 100) / 100,
              performanceGood: concurrentTime < 5000 && cachedQuery < 100
            };
          }
        }
      }
    }
  };

  const runAllTests = async () => {
    setOverallStatus('running');
    
    for (const [suiteName, suite] of Object.entries(testSuites)) {
      for (const [testName, testConfig] of Object.entries(suite.tests)) {
        const fullTestName = `${suiteName}_${testName}`;
        await runTest(fullTestName, testConfig.test);
      }
    }
    
    setOverallStatus('completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Page Hierarchy & Data Integration Test Suite</h1>
        <p className="text-gray-600">Comprehensive testing of the complete healthcare platform</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-blue-600">
                  {connectionStatus.state || 'unknown'}
                </div>
                <div className="text-sm text-gray-600">Real-time Status</div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-green-600">
                  {cacheStats.size || 0}
                </div>
                <div className="text-sm text-gray-600">Cache Entries</div>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(testResults).length}
                </div>
                <div className="text-sm text-gray-600">Tests Run</div>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(testResults).filter(t => t.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Tests Passed</div>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Test Control Panel</CardTitle>
            <div className="flex space-x-3">
              <Button
                onClick={runAllTests}
                disabled={overallStatus === 'running'}
                className="flex items-center gap-2"
              >
                {overallStatus === 'running' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run All Tests
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  OptimizedQueries.clearCache();
                  realtimeManager.cleanup();
                  setTestResults({});
                }}
              >
                Reset System
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">User Role:</span> {profile.role}
            </div>
            <div>
              <span className="font-medium">Tenant ID:</span> {profile.tenant_id}
            </div>
            <div>
              <span className="font-medium">Connection:</span> {connectionStatus.state || 'Unknown'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs defaultValue="dataService" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(testSuites).map(([key, suite]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <suite.icon className="h-4 w-4" />
              <span className="hidden md:inline">{suite.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(testSuites).map(([suiteKey, suite]) => (
          <TabsContent key={suiteKey} value={suiteKey}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <suite.icon className="h-5 w-5" />
                  {suite.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(suite.tests).map(([testKey, testConfig]) => {
                    const fullTestName = `${suiteKey}_${testKey}`;
                    const result = testResults[fullTestName];
                    
                    return (
                      <div
                        key={testKey}
                        className={`p-4 rounded-lg border transition-colors ${
                          getStatusColor(result?.status || 'pending')
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result?.status || 'pending')}
                            <div>
                              <div className="font-medium">{testConfig.name}</div>
                              <div className="text-sm text-gray-600">{testConfig.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {result?.duration && (
                              <Badge variant="outline">
                                {result.duration}ms
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runTest(fullTestName, testConfig.test)}
                              disabled={currentTest === fullTestName}
                            >
                              {currentTest === fullTestName ? 'Running...' : 'Run Test'}
                            </Button>
                          </div>
                        </div>
                        
                        {result?.result && (
                          <div className={`text-sm mt-2 ${
                            result.status === 'success' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.result}
                          </div>
                        )}
                        
                        {result?.details && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer">
                              View Details
                            </summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}