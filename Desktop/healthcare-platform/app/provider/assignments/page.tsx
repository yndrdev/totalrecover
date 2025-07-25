"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProviderAssignmentManager from '@/components/provider/ProviderAssignmentManager';
import { 
  Users, 
  Shield, 
  Activity,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface AssignmentStats {
  total_patients: number;
  primary_assignments: number;
  secondary_assignments: number;
  on_call_assignments: number;
  recent_assignments: number;
}

export default function ProviderAssignmentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string>('');
  const [providerId, setProviderId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('my-assignments');
  const [stats, setStats] = useState<AssignmentStats>({
    total_patients: 0,
    primary_assignments: 0,
    secondary_assignments: 0,
    on_call_assignments: 0,
    recent_assignments: 0
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Get provider profile
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select(`
          *,
          user:users!user_id(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (providerError || !provider) {
        console.error('Not a provider:', providerError);
        router.push('/');
        return;
      }

      setProviderId(provider.id);
      setTenantId(provider.tenant_id);

      // Load assignment statistics
      await loadStats(provider.id);
    } catch (error) {
      console.error('Error in auth check:', error);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (providerId: string) => {
    try {
      // Get assignment counts
      const { data: assignments } = await supabase
        .from('provider_patient_assignments')
        .select('*')
        .eq('provider_id', providerId)
        .eq('status', 'active');

      if (assignments) {
        const stats: AssignmentStats = {
          total_patients: assignments.length,
          primary_assignments: assignments.filter(a => a.assignment_type === 'primary').length,
          secondary_assignments: assignments.filter(a => a.assignment_type === 'secondary').length,
          on_call_assignments: assignments.filter(a => a.assignment_type === 'on_call').length,
          recent_assignments: assignments.filter(a => {
            const assignedDate = new Date(a.assigned_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return assignedDate > weekAgo;
          }).length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Assignments</h1>
        <p className="text-gray-600">Manage your patient assignments and care responsibilities</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_patients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Primary</p>
                <p className="text-2xl font-bold text-blue-600">{stats.primary_assignments}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Secondary</p>
                <p className="text-2xl font-bold text-green-600">{stats.secondary_assignments}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Call</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.on_call_assignments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recent_assignments}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="my-assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="all-assignments">All Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="my-assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Patient Assignments</CardTitle>
              <CardDescription>
                View and manage patients assigned to your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderAssignmentManager
                tenantId={tenantId}
                mode="provider"
                providerId={providerId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Provider Assignments</CardTitle>
              <CardDescription>
                View all provider-patient assignments in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderAssignmentManager
                tenantId={tenantId}
                mode="full"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-700">View Patient Activity</h3>
            <p className="text-sm text-gray-500 mt-1">
              Monitor recent patient interactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-700">Schedule Review</h3>
            <p className="text-sm text-gray-500 mt-1">
              Check upcoming appointments
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-700">Coverage Requests</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage on-call assignments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}