"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/design-system/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/design-system/Card";
import { StatusBadge, RecoveryDayBadge, OnlineStatus } from "@/components/ui/design-system/StatusIndicator";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { colors } from '@/lib/design-system/constants';
import {
  Users,
  Calendar,
  Bell,
  Plus,
  Settings,
  Download,
  Search,
  Activity,
  TrendingUp,
  UserCheck,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  User,
  MessageSquare,
} from "lucide-react";
import { HealthcareSummaryCards } from "./healthcare-summary-cards";
import { SidebarNavigation } from "./sidebar-navigation";
import { DashboardCards } from "./dashboard-cards";

interface AdminDashboardProps {
  initialData: {
    profile: any;
    totalPatients: number;
    activeProviders: number;
    completedTasks: number;
    systemAlerts: number;
    recentActivity: any[];
    monthlyMetrics: {
      patientGrowth: number;
      taskCompletion: number;
      providerActivity: number;
      revenue: number;
    };
  };
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    activeSessions: 0,
    currentChats: 0,
    pendingTasks: 0,
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const supabase = createClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("admin_updates")
      .on("broadcast", { event: "stats_update" }, ({ payload }) => {
        setRealtimeStats(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Patient Alert",
      message: "John Doe missed 3 consecutive exercises",
      time: "5 minutes ago",
      priority: "high",
    },
    {
      id: 2,
      type: "info",
      title: "New Provider",
      message: "Dr. Sarah Johnson has joined the platform",
      time: "1 hour ago",
      priority: "medium",
    },
    {
      id: 3,
      type: "success",
      title: "Milestone Reached",
      message: "100 patients completed recovery program",
      time: "2 hours ago",
      priority: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* <thinking>
      Visual Design: Professional admin dashboard with new design system
      Healthcare Context: Admin oversight for recovery platform
      UX Design: Clean layout with quick actions and metrics
      </thinking> */}
      {/* Sidebar */}
      <SidebarNavigation
        userRole={data.profile.role}
        userName={data.profile.full_name}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {data.profile.full_name}
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                <OnlineStatus status="online" />
                <span className="text-sm text-gray-700">System Online</span>
                <div className="ml-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-700">
                    {realtimeStats.activeSessions} Active Sessions
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Button variant="primary" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Patient
              </Button>
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })} Performance
              </p>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-6 overflow-y-auto h-[calc(100vh-140px)]">
          {/* Summary Cards */}
          <HealthcareSummaryCards data={data} />

          {/* Dashboard Cards - This includes all the metric cards, activity, system status, and task completion */}
          <div className="mt-8">
            <DashboardCards data={data} />
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="secondary"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = "/admin/patients"}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Add Patient</span>
              </Button>
              <Button
                variant="secondary"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = "/admin/providers"}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">Add Provider</span>
              </Button>
              <Button
                variant="secondary"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = "/builder"}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Protocol Builder</span>
              </Button>
              <Button
                variant="secondary"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = "/admin/analytics"}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium">View Analytics</span>
              </Button>
            </div>
          </div>
        </main>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-6 top-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notification.priority === "high" ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        notification.type === "alert"
                          ? "bg-red-100"
                          : notification.type === "info"
                          ? "bg-blue-100"
                          : "bg-green-100"
                      }`}
                    >
                      {notification.type === "alert" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : notification.type === "info" ? (
                        <Bell className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <Button variant="secondary" className="w-full" size="sm">
                View All Notifications
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}