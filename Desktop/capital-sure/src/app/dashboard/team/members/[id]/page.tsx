"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  HardHat,
  Briefcase,
  Activity,
  FileText,
  Camera,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Demo team member data
const memberData = {
  id: "1",
  name: "Sarah Johnson",
  role: "Senior Project Manager",
  department: "Project Management",
  email: "sarah.johnson@capitalsure.com",
  phone: "(555) 234-5678",
  location: "Downtown Office",
  avatar: "/avatars/sarah.jpg",
  employeeId: "PM-2019-001",
  startDate: "2019-03-15",
  status: "active",
  bio: "Experienced project manager with 12+ years in commercial construction. Specializes in high-rise office buildings and mixed-use developments.",
  
  stats: {
    projectsManaged: 24,
    totalBudget: 185000000,
    onTimeDelivery: 92,
    safetyScore: 98.5,
    teamSize: 45,
    yearsExperience: 12,
  },

  skills: [
    "Project Planning",
    "Budget Management",
    "Team Leadership",
    "Risk Assessment",
    "Stakeholder Communication",
    "Safety Compliance",
    "Contract Negotiation",
    "Quality Control",
  ],

  certifications: [
    { name: "PMP - Project Management Professional", issuer: "PMI", date: "2020-06-15" },
    { name: "OSHA 30-Hour Construction", issuer: "OSHA", date: "2023-01-20" },
    { name: "LEED AP BD+C", issuer: "USGBC", date: "2021-09-10" },
    { name: "Construction Risk Management", issuer: "AGC", date: "2022-11-05" },
  ],

  currentProjects: [
    {
      id: "1",
      name: "Downtown Office Complex",
      role: "Project Manager",
      status: "active",
      progress: 68,
      team: 24,
      budget: 85000000,
    },
    {
      id: "2",
      name: "Riverside Plaza Renovation",
      role: "Senior Advisor",
      status: "planning",
      progress: 15,
      team: 8,
      budget: 12000000,
    },
  ],

  performance: {
    overall: 4.8,
    categories: [
      { name: "Leadership", score: 4.9 },
      { name: "Communication", score: 4.8 },
      { name: "Technical Skills", score: 4.7 },
      { name: "Problem Solving", score: 4.9 },
      { name: "Time Management", score: 4.6 },
    ],
  },

  recentActivity: [
    {
      id: "1",
      type: "achievement",
      title: "Completed Downtown Office Complex - Phase 2",
      date: "2024-12-10",
      icon: CheckCircle,
    },
    {
      id: "2",
      type: "certification",
      title: "Renewed OSHA 30-Hour Certification",
      date: "2024-12-01",
      icon: Award,
    },
    {
      id: "3",
      type: "milestone",
      title: "5 Years with CapitalSure",
      date: "2024-03-15",
      icon: Star,
    },
  ],

  timeTracking: {
    thisWeek: 42,
    lastWeek: 38,
    thisMonth: 168,
    overtime: 8,
    vacation: 5,
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function TeamMemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "on-leave":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
          Back to Team
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={memberData.avatar} />
              <AvatarFallback className="text-xl">
                {memberData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {memberData.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {memberData.role} • {memberData.department}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(memberData.status)}
                >
                  {memberData.status}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Employee ID: {memberData.employeeId}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(memberData.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  View Resume
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Activity className="h-4 w-4 mr-2" />
                  Performance Review
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Clock className="h-4 w-4 mr-2" />
                  Time Off Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 grid-equal-height"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects Managed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{memberData.stats.projectsManaged}</div>
            <p className="text-xs text-muted-foreground">
              {memberData.currentProjects.length} active projects
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget Managed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              ${(memberData.stats.totalBudget / 1000000).toFixed(0)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-Time Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{memberData.stats.onTimeDelivery}%</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +5% from last year
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
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-2xl font-bold">{memberData.stats.safetyScore}%</span>
            </div>
            <p className="text-xs text-green-600">Excellent rating</p>
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
          <TabsList className="grid grid-cols-5 w-full lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="timeoff">Time & Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <Card className="lg:col-span-2 h-full">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{memberData.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{memberData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{memberData.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{memberData.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Experience</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Years of Experience</span>
                          <span className="font-medium">{memberData.stats.yearsExperience} years</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Team Size</span>
                          <span className="font-medium">{memberData.stats.teamSize} members</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time with Company</span>
                          <span className="font-medium">
                            {Math.floor((new Date().getTime() - new Date(memberData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {memberData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest achievements and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberData.recentActivity.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
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

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Projects</CardTitle>
                <CardDescription>Projects currently managed by {memberData.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberData.currentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.role} • {project.team} team members
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium mb-1">{project.progress}% Complete</div>
                        <Progress value={project.progress} className="h-2 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Overall rating: {memberData.performance.overall}/5.0</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberData.performance.categories.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.score}/5.0</span>
                      </div>
                      <Progress value={category.score * 20} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certifications & Licenses</CardTitle>
                <CardDescription>Professional qualifications and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start justify-between p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Issued by {cert.issuer} • {new Date(cert.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeoff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time & Attendance</CardTitle>
                <CardDescription>Hours worked and time off tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Hours Worked</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Week</span>
                        <span className="font-medium">{memberData.timeTracking.thisWeek}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Week</span>
                        <span className="font-medium">{memberData.timeTracking.lastWeek}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Month</span>
                        <span className="font-medium">{memberData.timeTracking.thisMonth}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overtime This Month</span>
                        <span className="font-medium text-orange-600">{memberData.timeTracking.overtime}h</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Time Off Balance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vacation Days Remaining</span>
                        <span className="font-medium">{memberData.timeTracking.vacation} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}