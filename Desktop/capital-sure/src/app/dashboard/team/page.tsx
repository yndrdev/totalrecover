"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Activity,
  Grid3X3,
  List,
  Shield,
  Briefcase,
  HardHat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const teamStats = [
  {
    label: "Total Members",
    value: "84",
    change: "+8",
    changeLabel: "this month",
    icon: Users,
    color: "text-primary",
  },
  {
    label: "Active Projects",
    value: "12",
    change: "+2",
    changeLabel: "this quarter",
    icon: Briefcase,
    color: "text-construction-green",
  },
  {
    label: "Certifications",
    value: "156",
    change: "+24",
    changeLabel: "this year",
    icon: Award,
    color: "text-safety-orange",
  },
  {
    label: "Safety Score",
    value: "98%",
    change: "+2%",
    changeLabel: "this month",
    icon: Shield,
    color: "text-warning-yellow",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Project Manager",
    department: "Management",
    email: "sarah.johnson@capitalsure.com",
    phone: "+1 (555) 123-4567",
    location: "Downtown Office",
    avatar: "SJ",
    status: "active",
    experience: "8 years",
    certifications: ["PMP", "OSHA 30", "LEED AP"],
    currentProjects: ["Downtown Office Complex", "Shopping Center Renovation"],
    safetyScore: 100,
    rating: 4.9,
    lastActive: "2 hours ago",
    joinDate: "Jan 2019",
    skills: ["Project Management", "Risk Assessment", "Team Leadership"],
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Site Supervisor",
    department: "Operations",
    email: "mike.chen@capitalsure.com",
    phone: "+1 (555) 123-4568",
    location: "North District",
    avatar: "MC",
    status: "active",
    experience: "6 years",
    certifications: ["OSHA 30", "First Aid", "Crane Operator"],
    currentProjects: ["Residential Tower A", "Highway Bridge Construction"],
    safetyScore: 98,
    rating: 4.7,
    lastActive: "1 hour ago",
    joinDate: "Mar 2020",
    skills: ["Site Management", "Safety Protocols", "Quality Control"],
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    role: "Safety Coordinator",
    department: "Safety",
    email: "lisa.rodriguez@capitalsure.com",
    phone: "+1 (555) 123-4569",
    location: "West Side",
    avatar: "LR",
    status: "active",
    experience: "10 years",
    certifications: ["CSP", "OSHA 30", "CPR/AED"],
    currentProjects: ["All Projects"],
    safetyScore: 100,
    rating: 4.8,
    lastActive: "30 minutes ago",
    joinDate: "Aug 2018",
    skills: ["Safety Management", "Training", "Compliance"],
  },
  {
    id: 4,
    name: "David Kim",
    role: "Equipment Operator",
    department: "Operations",
    email: "david.kim@capitalsure.com",
    phone: "+1 (555) 123-4570",
    location: "East River",
    avatar: "DK",
    status: "on-leave",
    experience: "12 years",
    certifications: ["Heavy Equipment", "OSHA 10", "Welding"],
    currentProjects: ["Highway Bridge Construction"],
    safetyScore: 95,
    rating: 4.6,
    lastActive: "3 days ago",
    joinDate: "Nov 2016",
    skills: ["Heavy Equipment", "Welding", "Excavation"],
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "Quality Inspector",
    department: "Quality",
    email: "emma.wilson@capitalsure.com",
    phone: "+1 (555) 123-4571",
    location: "School District",
    avatar: "EW",
    status: "active",
    experience: "5 years",
    certifications: ["CQI", "OSHA 30", "Materials Testing"],
    currentProjects: ["School Gymnasium", "Medical Center Expansion"],
    safetyScore: 99,
    rating: 4.8,
    lastActive: "45 minutes ago",
    joinDate: "Feb 2021",
    skills: ["Quality Control", "Testing", "Documentation"],
  },
  {
    id: 6,
    name: "Robert Taylor",
    role: "Electrician",
    department: "Trades",
    email: "robert.taylor@capitalsure.com",
    phone: "+1 (555) 123-4572",
    location: "Medical District",
    avatar: "RT",
    status: "active",
    experience: "15 years",
    certifications: ["Journeyman Electrician", "OSHA 30", "Solar Installation"],
    currentProjects: ["Medical Center Expansion", "Downtown Office Complex"],
    safetyScore: 97,
    rating: 4.9,
    lastActive: "4 hours ago",
    joinDate: "Jun 2017",
    skills: ["Electrical Systems", "Solar", "Controls"],
  },
];

const recentActivity = [
  {
    id: 1,
    type: "join",
    title: "New team member joined",
    description: "Alex Thompson joined as Concrete Specialist",
    member: "Alex Thompson",
    time: "2 hours ago",
    icon: UserPlus,
    iconColor: "text-construction-green",
  },
  {
    id: 2,
    type: "certification",
    title: "Certification completed",
    description: "Mike Chen earned OSHA 30 certification",
    member: "Mike Chen",
    time: "1 day ago",
    icon: Award,
    iconColor: "text-safety-orange",
  },
  {
    id: 3,
    type: "safety",
    title: "Safety milestone achieved",
    description: "Team reached 30 days without incidents",
    member: "Safety Team",
    time: "2 days ago",
    icon: Shield,
    iconColor: "text-construction-green",
  },
  {
    id: 4,
    type: "assignment",
    title: "Project assignment",
    description: "Emma Wilson assigned to new quality inspection",
    member: "Emma Wilson",
    time: "3 days ago",
    icon: Briefcase,
    iconColor: "text-primary",
  },
];

const departments = [
  { name: "All", count: 84, color: "primary" },
  { name: "Management", count: 8, color: "construction-green" },
  { name: "Operations", count: 24, color: "safety-orange" },
  { name: "Safety", count: 6, color: "warning-yellow" },
  { name: "Quality", count: 12, color: "primary" },
  { name: "Trades", count: 34, color: "construction-green" },
];

export default function TeamPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "All" || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "on-leave":
        return "status-pending";
      case "inactive":
        return "status-overdue";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "on-leave":
        return <Clock className="h-4 w-4" />;
      case "inactive":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "Management":
        return <Briefcase className="h-4 w-4" />;
      case "Operations":
        return <HardHat className="h-4 w-4" />;
      case "Safety":
        return <Shield className="h-4 w-4" />;
      case "Quality":
        return <Star className="h-4 w-4" />;
      case "Trades":
        return <Activity className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-display font-bold text-foreground mb-2">
            Team Management
          </h1>
          <p className="text-body-large text-muted-foreground">
            Manage team members, roles, and communication
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="construction-outline" size="construction">
            <MessageSquare className="h-5 w-5 mr-2" />
            Team Chat
          </Button>
          <Button size="construction" variant="construction-primary">
            <Plus className="h-5 w-5 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        {teamStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
          >
            <Card variant="construction" className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="text-construction-green font-medium mr-1">
                      {stat.change}
                    </span>
                    {stat.changeLabel}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="members">Team Members</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="construction-outline" size="default">
                          <Filter className="h-4 w-4 mr-2" />
                          Department
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {departments.map((dept) => (
                          <DropdownMenuItem 
                            key={dept.name}
                            onClick={() => setSelectedDepartment(dept.name)}
                          >
                            {dept.name} ({dept.count})
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="construction-outline" size="default">
                          <Filter className="h-4 w-4 mr-2" />
                          Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedStatus("all")}>
                          All Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedStatus("active")}>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("on-leave")}>
                          On Leave
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("inactive")}>
                          Inactive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "construction-primary" : "construction-outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "construction-primary" : "construction-outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Team Members */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => (
                      <Card 
                        key={member.id} 
                        variant="construction" 
                        className="group cursor-pointer hover:shadow-md transition-all h-full"
                        onClick={() => router.push(`/dashboard/team/members/${member.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                                <span className="text-sm font-medium">{member.avatar}</span>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {member.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-3">
                            <Badge variant={getStatusColor(member.status)} size="sm">
                              {getStatusIcon(member.status)}
                              <span className="ml-1 capitalize">{member.status.replace('-', ' ')}</span>
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {getDepartmentIcon(member.department)}
                              <span className="ml-1">{member.department}</span>
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Contact */}
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{member.phone}</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{member.location}</span>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-sm font-medium text-foreground">{member.experience}</div>
                                <div className="text-xs text-muted-foreground">Experience</div>
                              </div>
                              <div>
                                <div className="flex items-center justify-center">
                                  <Star className="h-3 w-3 text-warning-yellow mr-1" />
                                  <span className="text-sm font-medium text-foreground">{member.rating}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Rating</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{member.safetyScore}%</div>
                                <div className="text-xs text-muted-foreground">Safety</div>
                              </div>
                            </div>

                            {/* Current Projects */}
                            <div>
                              <div className="text-xs text-muted-foreground mb-2">Current Projects</div>
                              <div className="space-y-1">
                                {member.currentProjects.slice(0, 2).map((project) => (
                                  <div key={project} className="text-xs text-foreground truncate">
                                    • {project}
                                  </div>
                                ))}
                                {member.currentProjects.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{member.currentProjects.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Last Active */}
                            <div className="pt-3 border-t border-border">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Last active</span>
                                <span className="text-foreground">{member.lastActive}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card variant="construction">
                    <CardContent className="p-0">
                      {filteredMembers.map((member, index) => (
                        <div
                          key={member.id}
                          className={`p-6 hover:bg-accent/50 transition-colors cursor-pointer ${
                            index !== filteredMembers.length - 1 ? "border-b border-border" : ""
                          }`}
                          onClick={() => router.push(`/dashboard/team/members/${member.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                                <span className="text-sm font-medium">{member.avatar}</span>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                                    {member.name}
                                  </h3>
                                  <Badge variant={getStatusColor(member.status)} size="sm">
                                    {getStatusIcon(member.status)}
                                    <span className="ml-1 capitalize">{member.status.replace('-', ' ')}</span>
                                  </Badge>
                                  <Badge variant="outline" size="sm">
                                    {member.department}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Role</div>
                                    <div className="font-medium">{member.role}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Experience</div>
                                    <div className="font-medium">{member.experience}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Rating</div>
                                    <div className="flex items-center">
                                      <Star className="h-3 w-3 text-warning-yellow mr-1" />
                                      <span className="font-medium">{member.rating}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Safety Score</div>
                                    <div className="font-medium">{member.safetyScore}%</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="departments" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {departments.filter(dept => dept.name !== "All").map((department) => (
                    <Card key={department.name} variant="construction" className="group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-105 transition-transform">
                            {getDepartmentIcon(department.name)}
                          </div>
                          <span className="text-2xl font-bold text-foreground">
                            {department.count}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {department.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Active team members
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card variant="construction">
                  <CardHeader>
                    <CardTitle>Team Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Performance Analytics
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Detailed performance metrics and analytics will be available here.
                      </p>
                      <Button variant="construction-primary">
                        <Activity className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="construction">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card variant="construction">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="construction-outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Member
                </Button>
                <Button variant="construction-outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Team Message
                </Button>
                <Button variant="construction-outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="construction-outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Manage Certifications
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}