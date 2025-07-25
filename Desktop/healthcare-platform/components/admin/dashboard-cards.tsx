"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/design-system/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/design-system/Button";
import { Progress } from "@/components/ui/progress";
import { colors } from '@/lib/design-system/constants';
import { 
  Users, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Video,
  Dumbbell,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: any;
  variant?: "default" | "success" | "warning" | "destructive";
  onClick?: () => void;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: "patient" | "provider" | "system" | "alert";
  icon: any;
}

export interface DashboardData {
  totalPatients: number;
  activeProviders: number;
  systemAlerts: number;
  completedTasks: number;
  recentActivity: ActivityItem[];
  monthlyMetrics: {
    revenue: number;
    patientGrowth: number;
    taskCompletion: number;
  };
}

export function DashboardCards({ data }: { data: DashboardData }) {
  {/* <thinking>
  Visual Design: Modern dashboard cards with new design system colors
  Healthcare Context: Displaying key metrics for healthcare platform administration
  UX Design: Card-based layout with clear visual hierarchy and interactive elements
  </thinking> */}
  
  const MetricCard = ({ title, value, change, icon: Icon, variant = "default", onClick }: MetricCardProps) => {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-md"
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <Icon className={`h-4 w-4 ${
            variant === 'default' ? 'text-blue-500' :
            variant === 'success' ? 'text-green-600' :
            variant === 'warning' ? 'text-yellow-600' :
            'text-red-600'
          }`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              {change.type === "increase" ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs ${
                change.type === "increase" ? "text-green-600" : "text-red-600"
              }`}>
                {change.value}% from {change.period}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ActivityCard = () => (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Button variant="secondary" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.recentActivity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${
                item.type === "patient" ? "bg-blue-100 text-blue-600" :
                item.type === "provider" ? "bg-green-100 text-green-600" :
                item.type === "alert" ? "bg-red-100 text-red-600" :
                "bg-gray-100 text-gray-600"
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-600">{item.subtitle}</p>
              </div>
              <span className="text-xs text-gray-600">{item.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const SystemStatusCard = () => (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Database</span>
          </div>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">API Services</span>
          </div>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-900">AI Processing</span>
          </div>
          <Badge variant="outline" className="text-xs">Slow</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Email Service</span>
          </div>
          <Badge variant="destructive" className="text-xs">Down</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const TaskCompletionCard = () => (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Task Completion</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Today</span>
            <span className="text-sm font-medium text-gray-900">85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">This Week</span>
            <span className="text-sm font-medium text-gray-900">78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">This Month</span>
            <span className="text-sm font-medium text-gray-900">92%</span>
          </div>
          <Progress value={92} className="h-2" />
        </div>
        <div className="pt-2 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Average completion time</span>
            <span className="text-xs font-medium text-gray-900">4.2 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value={data.totalPatients}
          icon={Users}
          change={{ value: 12, type: "increase", period: "last month" }}
          onClick={() => window.location.href = "/admin/patients"}
        />
        <MetricCard
          title="Active Providers"
          value={data.activeProviders}
          icon={UserCheck}
          change={{ value: 3, type: "increase", period: "last month" }}
          variant="success"
          onClick={() => window.location.href = "/admin/providers"}
        />
        <MetricCard
          title="System Alerts"
          value={data.systemAlerts}
          icon={AlertTriangle}
          change={{ value: 25, type: "decrease", period: "last week" }}
          variant="warning"
          onClick={() => window.location.href = "/admin/system/monitoring"}
        />
        <MetricCard
          title="Tasks Completed"
          value={`${data.completedTasks}/day`}
          icon={CheckCircle}
          change={{ value: 8, type: "increase", period: "yesterday" }}
          variant="success"
        />
      </div>

      {/* Revenue & Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Monthly Revenue"
          value={`$${data.monthlyMetrics.revenue.toLocaleString()}`}
          icon={DollarSign}
          change={{ value: 15, type: "increase", period: "last month" }}
          variant="success"
        />
        <MetricCard
          title="Patient Growth"
          value={`+${data.monthlyMetrics.patientGrowth}%`}
          icon={TrendingUp}
          change={{ value: 5, type: "increase", period: "last quarter" }}
          variant="success"
        />
        <MetricCard
          title="Task Completion Rate"
          value={`${data.monthlyMetrics.taskCompletion}%`}
          icon={BarChart3}
          change={{ value: 2, type: "increase", period: "last month" }}
          variant="success"
        />
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityCard />
        <SystemStatusCard />
        <TaskCompletionCard />
      </div>
    </div>
  );
}

// Export individual components for external use
export const SystemStatus = () => {
  const SystemStatusCard = () => (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Database</span>
          </div>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">API Services</span>
          </div>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-900">AI Processing</span>
          </div>
          <Badge variant="outline" className="text-xs">Slow</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Email Service</span>
          </div>
          <Badge variant="destructive" className="text-xs">Down</Badge>
        </div>
      </CardContent>
    </Card>
  );
  
  return <SystemStatusCard />;
};

export const TaskCompletion = ({ data }: { data: DashboardData }) => {
  const TaskCompletionCard = () => (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Task Completion</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Today</span>
            <span className="text-sm font-medium text-gray-900">85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">This Week</span>
            <span className="text-sm font-medium text-gray-900">78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">This Month</span>
            <span className="text-sm font-medium text-gray-900">92%</span>
          </div>
          <Progress value={92} className="h-2" />
        </div>
        <div className="pt-2 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Average completion time</span>
            <span className="text-xs font-medium text-gray-900">4.2 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return <TaskCompletionCard />;
};