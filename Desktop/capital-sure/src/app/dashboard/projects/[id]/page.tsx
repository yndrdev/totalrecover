"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Camera,
  FileText,
  MoreVertical,
  Phone,
  Mail,
  Building2,
  Shield,
  TrendingUp,
  Wrench,
  HardHat,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Demo project data
const projectData = {
  id: "1",
  name: "Downtown Office Complex",
  description: "Modern 15-story office building with underground parking and retail space",
  status: "active",
  priority: "high",
  progress: 68,
  location: "123 Main St, Downtown District",
  client: {
    name: "Apex Development Group",
    contact: "Sarah Mitchell",
    email: "sarah.mitchell@apexdev.com",
    phone: "(555) 234-5678",
  },
  manager: {
    name: "John Davidson",
    role: "Senior Project Manager",
    email: "john.davidson@capitalsure.com",
    phone: "(555) 123-4567",
  },
  budget: {
    allocated: 85000000,
    spent: 57800000,
    remaining: 27200000,
    contingency: 4250000,
  },
  timeline: {
    startDate: "2024-01-15",
    endDate: "2025-12-15",
    currentPhase: "Structural Work",
    daysRemaining: 340,
  },
  team: {
    total: 186,
    onSite: 142,
    contractors: 12,
    subcontractors: 32,
  },
  milestones: [
    { id: 1, name: "Foundation Complete", date: "2024-03-15", status: "completed", payment: 12750000 },
    { id: 2, name: "Structural Frame (Floors 1-5)", date: "2024-06-30", status: "completed", payment: 17000000 },
    { id: 3, name: "Structural Frame (Floors 6-10)", date: "2024-09-30", status: "completed", payment: 17000000 },
    { id: 4, name: "Structural Frame (Floors 11-15)", date: "2024-12-31", status: "in_progress", payment: 17000000 },
    { id: 5, name: "Building Envelope", date: "2025-04-30", status: "pending", payment: 8500000 },
    { id: 6, name: "Interior Fit-out", date: "2025-09-30", status: "pending", payment: 12750000 },
  ],
  recentActivity: [
    { id: 1, type: "progress", title: "Floor 12 concrete pour completed", user: "Mike Chen", time: "2 hours ago" },
    { id: 2, type: "document", title: "Updated structural drawings uploaded", user: "Lisa Park", time: "5 hours ago" },
    { id: 3, type: "safety", title: "Weekly safety inspection passed", user: "Tom Wilson", time: "1 day ago" },
    { id: 4, type: "payment", title: "Progress payment #8 approved", user: "Sarah Mitchell", time: "2 days ago" },
  ],
  documents: [
    { id: 1, name: "Contract Agreement.pdf", type: "contract", size: "2.4 MB", date: "2024-01-10" },
    { id: 2, name: "Architectural Plans v3.dwg", type: "drawing", size: "45.2 MB", date: "2024-11-15" },
    { id: 3, name: "Safety Compliance Report.pdf", type: "report", size: "1.1 MB", date: "2024-12-08" },
    { id: 4, name: "Progress Photos Week 48.zip", type: "photos", size: "156.3 MB", date: "2024-12-10" },
  ],
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "progress":
        return CheckCircle;
      case "document":
        return FileText;
      case "safety":
        return Shield;
      case "payment":
        return DollarSign;
      default:
        return FileText;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {projectData.name}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {projectData.description}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="default" className="px-3 py-1">
                    {projectData.status === "active" ? "In Progress" : projectData.status}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {projectData.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {projectData.timeline.daysRemaining} days remaining
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => router.push(`/dashboard/projects/${projectData.id}/reports/new`)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Progress
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  View Contract
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${projectData.id}/reports`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Reports
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">{projectData.progress}%</div>
            <Progress value={projectData.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {projectData.timeline.currentPhase}
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Utilized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">
              ${(projectData.budget.spent / 1000000).toFixed(1)}M
            </div>
            <Progress 
              value={(projectData.budget.spent / projectData.budget.allocated) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              of ${(projectData.budget.allocated / 1000000).toFixed(1)}M total
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">{projectData.team.total}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {projectData.team.onSite} on-site
              </Badge>
              <Badge variant="outline" className="text-xs">
                {projectData.team.contractors} contractors
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Safety Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">98.5%</div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">0 incidents this month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Details */}
              <Card className="lg:col-span-2 h-full">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Client Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.client.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.client.contact}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.client.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Project Manager</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HardHat className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.manager.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.manager.role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.manager.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{projectData.manager.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Budget Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Budget</span>
                        <span className="font-medium">${(projectData.budget.allocated / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Spent to Date</span>
                        <span className="font-medium text-blue-600">${(projectData.budget.spent / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Remaining</span>
                        <span className="font-medium text-green-600">${(projectData.budget.remaining / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Contingency</span>
                        <span className="font-medium">${(projectData.budget.contingency / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from the project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectData.recentActivity.map((activity) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.user} • {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>Track progress against key deliverables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          milestone.status === "completed" ? "bg-green-100" : 
                          milestone.status === "in_progress" ? "bg-blue-100" : "bg-gray-100"
                        )}>
                          {milestone.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : milestone.status === "in_progress" ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Calendar className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{milestone.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={getStatusColor(milestone.status)}
                        >
                          {milestone.status.replace("_", " ")}
                        </Badge>
                        <p className="text-sm font-medium mt-2">
                          ${(milestone.payment / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Manage project team members and contractors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Team management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Documents</CardTitle>
                    <CardDescription>Contracts, plans, and reports</CardDescription>
                  </div>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projectData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} • {new Date(doc.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}