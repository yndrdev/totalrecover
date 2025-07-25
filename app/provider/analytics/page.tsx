"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  totalPatients: number;
  activePatients: number;
  completedTasks: number;
  averageRecoveryTime: number;
  patientSatisfaction: number;
  taskCompletionRate: number;
  monthlyTrends: {
    month: string;
    patients: number;
    satisfaction: number;
  }[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("30");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setCurrentUser(userProfile);

      // Fetch real analytics data from Supabase database
      const tenantId = userProfile?.tenant_id;

      // Get total patients count
      const { count: totalPatients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('role', 'patient');

      // Get active patients count (those with recent activity)
      const { count: activePatients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('role', 'patient')
        .gte('last_seen_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get completed tasks count
      const { count: completedTasks } = await supabase
        .from('patient_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'completed');

      // Calculate task completion rate
      const { count: totalTasks } = await supabase
        .from('patient_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const taskCompletionRate = (totalTasks || 0) > 0 ? Math.round((completedTasks || 0) / (totalTasks || 1) * 100) : 0;

      // Build analytics data object
      const analyticsData: AnalyticsData = {
        totalPatients: totalPatients || 0,
        activePatients: activePatients || 0,
        completedTasks: completedTasks || 0,
        averageRecoveryTime: 0, // TODO: Calculate from actual recovery data
        patientSatisfaction: 0, // TODO: Calculate from actual feedback
        taskCompletionRate,
        monthlyTrends: [] // TODO: Calculate monthly trends from actual data
      };

      setAnalyticsData(analyticsData);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push("/provider/dashboard")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Track your practice performance and patient outcomes</p>
              {currentUser && (
                <p className="text-sm text-gray-500 mt-1">
                  Analytics for: {currentUser.first_name} {currentUser.last_name} ({currentUser.role})
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="default">
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalPatients}
                  </div>
                  <div className="text-sm text-gray-600">Total Patients</div>
                </div>
                <Users className="h-8 w-8 text-[#2563eb]" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData.activePatients}
                  </div>
                  <div className="text-sm text-gray-600">Active Patients</div>
                </div>
                <Activity className="h-8 w-8 text-[#059669]" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData.patientSatisfaction}
                  </div>
                  <div className="text-sm text-gray-600">Patient Satisfaction</div>
                </div>
                <CheckCircle className="h-8 w-8 text-[#7c3aed]" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+0.2 from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData.taskCompletionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Task Completion</div>
                </div>
                <BarChart3 className="h-8 w-8 text-[#ea580c]" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">-3% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Patient Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pre-Surgery Patients</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-sm font-medium">23</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Early Recovery (0-30 days)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm font-medium">34</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Late Recovery (30+ days)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium">32</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Recovery</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <span className="text-sm font-medium">67</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-green-800">Task Completion Rate</div>
                    <div className="text-xs text-green-600">Last 7 days</div>
                  </div>
                  <Badge variant="default">92%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-800">Average Response Time</div>
                    <div className="text-xs text-blue-600">Patient messages</div>
                  </div>
                  <Badge variant="default">2.3 hrs</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-purple-800">Protocol Adherence</div>
                    <div className="text-xs text-purple-600">All active patients</div>
                  </div>
                  <Badge variant="secondary">89%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-orange-800">Average Recovery Time</div>
                    <div className="text-xs text-orange-600">Completed cases</div>
                  </div>
                  <Badge variant="outline">{analyticsData.averageRecoveryTime} days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-800">
                    Patient Engagement Opportunity
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    15 patients have not completed their daily check-ins in the last 3 days. Consider reaching out to improve engagement.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-800">
                    Excellent Recovery Outcomes
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Your patients are recovering 15% faster than the national average. Keep up the excellent work!
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-orange-800">
                    Protocol Optimization
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    Consider reviewing protocols for knee replacement patients. Task completion rates are lower than other procedures.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}