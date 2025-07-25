"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataService } from '@/lib/services/dataService';
import { 
  Calendar,
  MessageCircle, 
  Activity, 
  Users,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Play,
  Award,
  Heart
} from 'lucide-react';

interface PatientDashboardInterfaceProps {
  user: any;
  profile: any;
  patient: any;
}

export default function PatientDashboardInterface({ user, profile, patient }: PatientDashboardInterfaceProps) {
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [careTeam, setCareTeam] = useState<any>({});
  
  const router = useRouter();

  useEffect(() => {
    loadPatientData();
  }, [patient.id]);

  const loadPatientData = async () => {
    try {
      // Get detailed patient information
      const patientData = await DataService.getPatientDetails(patient.id);
      setPatientDetails(patientData);

      // Extract care team information
      setCareTeam({
        surgeon: patientData.surgeon,
        nurse: patientData.nurse,
        pt: patientData.pt
      });

      // Get today's tasks based on current recovery day
      const tasks = await DataService.getPatientTasks(
        patient.id, 
        null, 
        patientData.current_recovery_day
      );
      setTodaysTasks(tasks || []);

      // Get patient metrics
      const patientMetrics = await DataService.getPatientMetrics(patient.id);
      setMetrics(patientMetrics);

      // Get recent conversations
      const conversations = patientData.conversations || [];
      const sortedConversations = conversations
        .sort((a: any, b: any) => 
          new Date(b.last_message_at || b.created_at).getTime() - 
          new Date(a.last_message_at || a.created_at).getTime()
        )
        .slice(0, 3);
      setRecentConversations(sortedConversations);

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTask = async (task: any) => {
    try {
      if (task.task_type === 'form') {
        router.push(`/patient/forms/${task.form_id}`);
      } else if (task.task_type === 'exercise') {
        router.push(`/patient/exercises/${task.exercise_id}`);
      } else if (task.task_type === 'chat' || task.task_type === 'checkin') {
        router.push('/chat');
      } else {
        // Mark as started
        await DataService.updateTaskStatus(task.id, 'in_progress');
        loadPatientData(); // Refresh data
      }
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const completeTask = async (task: any) => {
    try {
      await DataService.updateTaskStatus(task.id, 'completed', {
        completed_by: 'patient',
        completion_time: new Date().toISOString()
      });
      loadPatientData(); // Refresh data
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const recoveryPhase = DataService.getRecoveryPhase(patientDetails?.current_recovery_day || 0);
  const surgeryTypeName = DataService.getSurgeryTypeName(patientDetails?.surgery_type || '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile.first_name || 'Patient'}!
        </h1>
        <p className="text-gray-600">
          Day {patientDetails?.current_recovery_day || 0} of your {surgeryTypeName} recovery journey
        </p>
        <p className="text-sm text-gray-500">
          Current Phase: {recoveryPhase}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recovery Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recovery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Recovery Progress</span>
                    <span>{metrics.completionRate}%</span>
                  </div>
                  <Progress 
                    value={metrics.completionRate} 
                    className="h-4"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.completedTasks} of {metrics.totalTasks} tasks completed
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary-light/10 rounded-lg border border-primary-light/30">
                    <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">
                      {patientDetails?.current_recovery_day || 0}
                    </div>
                    <div className="text-sm text-primary-navy">Recovery Day</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-light/10 rounded-lg border border-secondary-light/30">
                    <Activity className="h-6 w-6 text-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary">
                      {metrics.exercisesCompleted}
                    </div>
                    <div className="text-sm text-secondary-dark">Exercises Done</div>
                  </div>
                  <div className="text-center p-4 bg-accent-purple/10 rounded-lg border border-accent-purple/30">
                    <FileText className="h-6 w-6 text-accent-purple mx-auto mb-2" />
                    <div className="text-2xl font-bold text-accent-purple">
                      {metrics.formsCompleted}
                    </div>
                    <div className="text-sm text-accent-purple">Check-ins Complete</div>
                  </div>
                </div>

                {/* Surgery Information */}
                <div className="p-4 bg-primary-light/5 rounded-lg border border-primary-light/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Surgery Type:</span>
                      <div className="text-gray-900">{surgeryTypeName}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Surgery Date:</span>
                      <div className="text-gray-900">
                        {patientDetails?.surgery_date 
                          ? DataService.formatDate(patientDetails.surgery_date)
                          : 'Not scheduled'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Recovery Protocol:</span>
                      <div className="text-gray-900">
                        {patientDetails?.recovery_protocols?.name || 'Standard Protocol'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expected Duration:</span>
                      <div className="text-gray-900">12-16 weeks</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today&apos;s Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysTasks.length > 0 ? (
                <div className="space-y-4">
                  {todaysTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                        task.status === 'completed' 
                          ? 'bg-secondary-light/10 border-secondary' 
                          : task.status === 'in_progress'
                          ? 'bg-primary-light/10 border-primary'
                          : 'bg-white border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' 
                              ? 'bg-secondary' 
                              : task.status === 'in_progress'
                              ? 'bg-primary'
                              : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-600">{task.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              {task.task_type === 'form' && (
                                <Badge variant="outline" className="text-xs">
                                  📋 Form
                                </Badge>
                              )}
                              {task.task_type === 'exercise' && (
                                <Badge variant="outline" className="text-xs">
                                  🏃‍♂️ Exercise
                                </Badge>
                              )}
                              {(task.task_type === 'chat' || task.task_type === 'checkin') && (
                                <Badge variant="outline" className="text-xs">
                                  💬 Check-in
                                </Badge>
                              )}
                              {task.estimated_duration && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimated_duration} min
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {task.status === 'completed' ? (
                            <div className="flex items-center text-secondary font-medium">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </div>
                          ) : task.status === 'in_progress' ? (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => completeTask(task)}
                              >
                                Mark Complete
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => startTask(task)}
                              >
                                Continue
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => startTask(task)}
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 text-secondary" />
                  <div className="text-lg font-medium text-secondary">All tasks completed for today!</div>
                  <div className="text-sm text-gray-600">Great job on your recovery progress.</div>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/chat')}
                  >
                    Start Daily Check-in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => router.push('/chat')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Daily Check-in
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/patient/exercises')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Exercise Library
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/patient/progress')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/patient/forms')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Complete Forms
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Care Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Care Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careTeam.surgeon && (
                  <div className="flex items-center space-x-3 p-3 bg-primary-light/10 rounded-lg border border-primary-light/30">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {careTeam.surgeon.first_name?.[0] || 'S'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Dr. {careTeam.surgeon.first_name} {careTeam.surgeon.last_name}
                      </div>
                      <div className="text-sm text-gray-600">Surgeon</div>
                    </div>
                  </div>
                )}
                
                {careTeam.nurse && (
                  <div className="flex items-center space-x-3 p-3 bg-secondary-light/10 rounded-lg border border-secondary-light/30">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {careTeam.nurse.first_name?.[0] || 'N'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {careTeam.nurse.first_name} {careTeam.nurse.last_name}
                      </div>
                      <div className="text-sm text-gray-600">Primary Nurse</div>
                    </div>
                  </div>
                )}
                
                {careTeam.pt && (
                  <div className="flex items-center space-x-3 p-3 bg-accent-purple/10 rounded-lg border border-accent-purple/30">
                    <div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {careTeam.pt.first_name?.[0] || 'P'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {careTeam.pt.first_name} {careTeam.pt.last_name}
                      </div>
                      <div className="text-sm text-gray-600">Physical Therapist</div>
                    </div>
                  </div>
                )}

                {!careTeam.surgeon && !careTeam.nurse && !careTeam.pt && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <div className="text-sm">Your care team will be assigned soon</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentConversations.length > 0 ? (
                  recentConversations.map(conversation => (
                    <div 
                      key={conversation.id} 
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push('/chat')}
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {conversation.title || 'Recovery Chat'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {DataService.formatDate(conversation.last_message_at || conversation.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <div className="text-sm">No recent conversations</div>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => router.push('/chat')}
                    >
                      Start Chat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-gradient-to-r from-primary-light/10 to-primary/10 rounded-lg border border-primary-light/30">
                <div className="text-lg font-medium text-primary-navy mb-2">
                  &quot;Every step forward is progress!&quot;
                </div>
                <div className="text-sm text-primary">
                  You&apos;re {metrics.completionRate}% through your recovery tasks. Keep going!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}