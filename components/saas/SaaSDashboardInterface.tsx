"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataService } from '@/lib/services/dataService';
import { 
  Building2, 
  Users, 
  MessageCircle, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Settings,
  ChevronRight
} from 'lucide-react';

interface SaaSDashboardInterfaceProps {
  user: any;
  profile: any;
}

export default function SaaSDashboardInterface({ user, profile }: SaaSDashboardInterfaceProps) {
  const [practices, setPractices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  const [showAddPractice, setShowAddPractice] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load practices with clinic and patient counts
      const practicesData = await DataService.getAllPractices();
      setPractices(practicesData);

      // Load platform metrics
      const platformMetrics = await DataService.getPlatformMetrics();
      setMetrics(platformMetrics);

      // Generate recent activity (in real implementation, this would come from an activity log)
      setRecentActivity([
        {
          id: 1,
          description: 'New practice "Orthopedic Excellence" onboarded',
          timestamp: '2 hours ago',
          type: 'practice_created'
        },
        {
          id: 2,
          description: '45 new patients registered across all practices',
          timestamp: '4 hours ago',
          type: 'patients_registered'
        },
        {
          id: 3,
          description: 'System maintenance completed successfully',
          timestamp: '1 day ago',
          type: 'system_update'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPractices = practices.filter(practice =>
    practice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.subdomain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewPracticeDetails = (practice: any) => {
    setSelectedPractice(practice);
  };

  const managePractice = (practiceId: string) => {
    // Navigate to practice management page
    window.open(`/practice/${practiceId}/admin`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TJV Recovery Platform</h1>
        <p className="text-gray-600">SaaS Administration Dashboard</p>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600">{metrics.totalPractices}</div>
                <div className="text-sm text-gray-600">Active Practices</div>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-green-600">{metrics.totalPatients}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-purple-600">{metrics.activeConversations}</div>
                <div className="text-sm text-gray-600">Active Conversations</div>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-orange-600">{metrics.completedTasks}</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Management */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Practice Management</CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search practices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setShowAddPractice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Practice
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-700">Practice</th>
                  <th className="text-left p-4 font-medium text-gray-700">Clinics</th>
                  <th className="text-left p-4 font-medium text-gray-700">Patients</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Subscription</th>
                  <th className="text-left p-4 font-medium text-gray-700">Last Active</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPractices.map(practice => (
                  <tr key={practice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{practice.name}</div>
                        <div className="text-sm text-gray-600">
                          {practice.subdomain || 'No subdomain'}.tjvrecovery.com
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900">{practice.clinics?.length || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900">{practice.patients?.length || 0}</span>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={practice.is_active ? "default" : "secondary"}
                        className={practice.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {practice.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {practice.subscription_tier || 'Basic'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {DataService.formatDate(practice.updated_at || practice.created_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewPracticeDetails(practice)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => managePractice(practice.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPractices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div className="text-lg font-medium">No practices found</div>
                <div className="text-sm">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first practice'}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row - Activity and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Database Performance</div>
                  <div className="text-xs text-gray-600">Query response time</div>
                </div>
                <div className="text-green-600 font-medium">Excellent</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">API Response Time</div>
                  <div className="text-xs text-gray-600">Average endpoint latency</div>
                </div>
                <div className="text-green-600 font-medium">125ms avg</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Active Users</div>
                  <div className="text-xs text-gray-600">Currently online</div>
                </div>
                <div className="text-blue-600 font-medium">1,247</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">System Uptime</div>
                  <div className="text-xs text-gray-600">Last 30 days</div>
                </div>
                <div className="text-green-600 font-medium">99.9%</div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button variant="outline" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Detailed Monitoring
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Details Modal */}
      {selectedPractice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Practice Details: {selectedPractice.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPractice(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Practice Name</label>
                    <div className="text-gray-900">{selectedPractice.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subdomain</label>
                    <div className="text-gray-900">{selectedPractice.subdomain || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div>
                      <Badge variant={selectedPractice.is_active ? "default" : "secondary"}>
                        {selectedPractice.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subscription</label>
                    <div className="text-gray-900">{selectedPractice.subscription_tier || 'Basic'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <div className="text-gray-900">
                      {DataService.formatDate(selectedPractice.created_at)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <div className="text-gray-900">
                      {DataService.formatDate(selectedPractice.updated_at || selectedPractice.created_at)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedPractice.clinics?.length || 0}
                    </div>
                    <div className="text-sm text-blue-700">Clinics</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedPractice.patients?.length || 0}
                    </div>
                    <div className="text-sm text-green-700">Patients</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedPractice.profiles?.length || 0}
                    </div>
                    <div className="text-sm text-purple-700">Users</div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    className="flex-1"
                    onClick={() => managePractice(selectedPractice.id)}
                  >
                    Open Practice Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPractice(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Practice Modal */}
      {showAddPractice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practice Name
                  </label>
                  <Input placeholder="Enter practice name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain
                  </label>
                  <Input placeholder="Enter subdomain (e.g., orthopedic-center)" />
                </div>
                <div className="flex space-x-3">
                  <Button className="flex-1">Create Practice</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPractice(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}