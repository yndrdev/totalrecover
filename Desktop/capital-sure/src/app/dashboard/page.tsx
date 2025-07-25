"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Construction,
  FileText,
  HardHat,
  Shield,
  Timer,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/construction/kpi-card";
import { ProjectStatusCard } from "@/components/construction/project-status-card";
import { WeatherWidget } from "@/components/construction/weather-widget";

// Construction-focused KPI data - Ordered by importance
const kpiData = [
  {
    title: "Active Projects",
    value: 12,
    change: 8.2,
    changeType: "increase" as const,
    icon: Construction,
    trend: "up" as const,
    variant: "default" as const,
  },
  {
    title: "Total Budget",
    value: "$2.4M",
    change: 12.5,
    changeType: "increase" as const,
    icon: DollarSign,
    trend: "up" as const,
    variant: "budget" as const,
  },
  {
    title: "On-Time Delivery",
    value: "87%",
    change: -3.2,
    changeType: "decrease" as const,
    icon: Timer,
    trend: "down" as const,
    variant: "schedule" as const,
  },
  {
    title: "Safety Score",
    value: "98.5%",
    change: 2.1,
    changeType: "increase" as const,
    icon: Shield,
    trend: "up" as const,
    variant: "safety" as const,
  },
];

// Sample weather data
const weatherData = {
  condition: "sunny" as const,
  temperature: 72,
  humidity: 45,
  windSpeed: 8,
  uvIndex: 6,
  workSuitability: "ideal" as const,
  alerts: [],
};

// Enhanced project data
const activeProjects = [
  {
    id: "1",
    name: "Downtown Office Complex",
    location: "123 Main St, Downtown",
    status: "active" as const,
    progress: 68,
    budget: { allocated: 850000, spent: 580000 },
    timeline: {
      startDate: "2024-01-15",
      endDate: "2025-12-15",
      daysRemaining: 45,
    },
    team: { size: 24, manager: "Sarah Johnson" },
    priority: "high" as const,
  },
  {
    id: "2",
    name: "Residential Tower A",
    location: "456 Oak Ave, North District",
    status: "planning" as const,
    progress: 15,
    budget: { allocated: 1200000, spent: 180000 },
    timeline: {
      startDate: "2024-03-01",
      endDate: "2026-03-20",
      daysRemaining: 120,
    },
    team: { size: 18, manager: "Mike Chen" },
    priority: "medium" as const,
  },
  {
    id: "3",
    name: "Shopping Center Renovation",
    location: "789 West Side Blvd",
    status: "delayed" as const,
    progress: 45,
    budget: { allocated: 650000, spent: 720000 },
    timeline: {
      startDate: "2024-02-01",
      endDate: "2026-01-30",
      daysRemaining: -15,
    },
    team: { size: 16, manager: "Lisa Rodriguez" },
    priority: "critical" as const,
  },
];

const recentActivity = [
  {
    id: 1,
    type: "progress",
    title: "Foundation completed for Tower A",
    description: "Milestone reached ahead of schedule",
    time: "2 hours ago",
    icon: CheckCircle,
    iconColor: "text-success",
  },
  {
    id: 2,
    type: "alert",
    title: "Weather delay for Downtown Complex",
    description: "High winds expected, outdoor work postponed",
    time: "4 hours ago",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  {
    id: 3,
    type: "update",
    title: "New team member added",
    description: "John Smith joined as Site Supervisor",
    time: "6 hours ago",
    icon: Users,
    iconColor: "text-primary",
  },
  {
    id: 4,
    type: "document",
    title: "Safety report submitted",
    description: "Weekly safety inspection completed",
    time: "8 hours ago",
    icon: Shield,
    iconColor: "text-success",
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: "Site inspection - Downtown Complex",
    dueTime: "10:00 AM",
    priority: "high",
    assignee: "Sarah Johnson",
  },
  {
    id: 2,
    title: "Material delivery coordination",
    dueTime: "2:00 PM",
    priority: "medium",
    assignee: "Mike Chen",
  },
  {
    id: 3,
    title: "Weekly team meeting",
    dueTime: "4:00 PM",
    priority: "low",
    assignee: "All Team",
  },
];


export default function DashboardPage() {
  const router = useRouter();
  
  return (
    <div className="container-fluid py-8">
      {/* Page header with weather */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <h1 className="text-display font-bold text-foreground mb-2">
              Construction Dashboard
            </h1>
            <p className="text-body-large text-muted-foreground">
              Welcome back, John. Here&apos;s what&apos;s happening with your
              projects today.
            </p>
          </motion.div>
          
          {/* Weather Widget in Header */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-auto"
          >
            <WeatherWidget
              weather={weatherData}
              location="Downtown Construction Zone"
              variant="horizontal"
              className="h-full"
            />
          </motion.div>
        </div>
      </div>

      {/* KPI Overview - Construction Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        {/* Main KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 grid-equal-height">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              changeType={kpi.changeType}
              icon={kpi.icon}
              trend={kpi.trend}
              variant={kpi.variant}
              className="animate-in"
              style={
                { animationDelay: `${(index + 2) * 100}ms` } as React.CSSProperties
              }
            />
          ))}
        </div>
      </motion.div>

      {/* Today's Tasks - Horizontal Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <Card className="touch-target-large">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-primary" />
                Today&apos;s Tasks
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/schedule">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grid-equal-height">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors touch-target"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate mb-2">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground ml-3">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="whitespace-nowrap">{task.dueTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Projects - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline font-semibold">Active Projects</h2>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-equal-height">
            {activeProjects.map((project, index) => (
              <div key={project.id} className="h-full">
                <ProjectStatusCard
                  project={project}
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  className="animate-in h-full"
                  style={
                    {
                      animationDelay: `${(index + 6) * 100}ms`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </motion.div>


      {/* Recent Activity - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8"
      >
          <Card className="touch-target-large">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-equal-height">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors touch-target"
                  >
                    <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                      <activity.icon
                        className={`h-4 w-4 ${activity.iconColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
