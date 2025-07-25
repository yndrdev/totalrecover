"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Plus,
  Filter,
  Search,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Timer,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CalendarDays,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const scheduleStats = [
  {
    label: "Today's Tasks",
    value: "24",
    change: "+3",
    changeLabel: "from yesterday",
    icon: CalendarDays,
    color: "text-primary",
  },
  {
    label: "Overdue",
    value: "4",
    change: "-2",
    changeLabel: "from last week",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    label: "Completed",
    value: "18",
    change: "+6",
    changeLabel: "this week",
    icon: CheckCircle,
    color: "text-construction-green",
  },
  {
    label: "Team Hours",
    value: "156",
    change: "+12",
    changeLabel: "this week",
    icon: Clock,
    color: "text-safety-orange",
  },
];

const todaysTasks = [
  {
    id: 1,
    title: "Site inspection - Downtown Complex",
    project: "Downtown Office Complex",
    time: "09:00 AM",
    duration: "2 hours",
    assignee: "Sarah Johnson",
    team: ["John Doe", "Mike Smith"],
    location: "Downtown Site A",
    priority: "high",
    status: "pending",
    type: "inspection",
    notes: "Weekly safety and progress inspection",
  },
  {
    id: 2,
    title: "Material delivery coordination",
    project: "Residential Tower A",
    time: "11:30 AM",
    duration: "1 hour",
    assignee: "Mike Chen",
    team: ["Lisa Wang", "Robert Taylor"],
    location: "North District",
    priority: "medium",
    status: "in-progress",
    type: "delivery",
    notes: "Steel beam delivery and placement",
  },
  {
    id: 3,
    title: "Foundation pouring",
    project: "Shopping Center Renovation",
    time: "02:00 PM",
    duration: "4 hours",
    assignee: "Lisa Rodriguez",
    team: ["Tom Wilson", "Alex Brown", "Maria Garcia"],
    location: "West Side",
    priority: "high",
    status: "pending",
    type: "construction",
    notes: "East wing foundation concrete pour",
  },
  {
    id: 4,
    title: "Weekly team meeting",
    project: "All Projects",
    time: "04:00 PM",
    duration: "1 hour",
    assignee: "All Team",
    team: ["All"],
    location: "Main Office",
    priority: "low",
    status: "pending",
    type: "meeting",
    notes: "Weekly progress review and planning",
  },
  {
    id: 5,
    title: "Equipment maintenance",
    project: "Highway Bridge Construction",
    time: "06:00 AM",
    duration: "2 hours",
    assignee: "David Kim",
    team: ["Steve Jackson"],
    location: "Equipment Yard",
    priority: "medium",
    status: "completed",
    type: "maintenance",
    notes: "Crane and heavy machinery maintenance",
  },
];

const weeklySchedule = [
  {
    date: "Mon, Dec 2",
    tasks: [
      { id: 1, title: "Site setup - Tower A", time: "08:00", status: "completed", priority: "high" },
      { id: 2, title: "Permit review", time: "14:00", status: "completed", priority: "medium" },
    ],
  },
  {
    date: "Tue, Dec 3",
    tasks: [
      { id: 3, title: "Foundation inspection", time: "09:00", status: "in-progress", priority: "high" },
      { id: 4, title: "Material delivery", time: "11:30", status: "pending", priority: "medium" },
      { id: 5, title: "Team meeting", time: "16:00", status: "pending", priority: "low" },
    ],
  },
  {
    date: "Wed, Dec 4",
    tasks: [
      { id: 6, title: "Concrete pouring", time: "06:00", status: "pending", priority: "high" },
      { id: 7, title: "Safety training", time: "13:00", status: "pending", priority: "medium" },
    ],
  },
  {
    date: "Thu, Dec 5",
    tasks: [
      { id: 8, title: "Electrical work", time: "08:00", status: "pending", priority: "high" },
      { id: 9, title: "Quality inspection", time: "15:00", status: "pending", priority: "medium" },
    ],
  },
  {
    date: "Fri, Dec 6",
    tasks: [
      { id: 10, title: "Week wrap-up", time: "09:00", status: "pending", priority: "low" },
      { id: 11, title: "Next week planning", time: "14:00", status: "pending", priority: "medium" },
    ],
  },
];

const upcomingMilestones = [
  {
    id: 1,
    title: "Foundation Completion",
    project: "Downtown Office Complex",
    date: "Dec 15, 2024",
    daysLeft: 13,
    progress: 85,
    status: "on-track",
    importance: "critical",
  },
  {
    id: 2,
    title: "Site Preparation Done",
    project: "Residential Tower A",
    date: "Dec 20, 2024",
    daysLeft: 18,
    progress: 45,
    status: "at-risk",
    importance: "high",
  },
  {
    id: 3,
    title: "Electrical Phase Complete",
    project: "Shopping Center Renovation",
    date: "Jan 10, 2025",
    daysLeft: 39,
    progress: 20,
    status: "on-track",
    importance: "medium",
  },
];

export default function SchedulePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("today");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-construction-green" />;
      case "in-progress":
        return <Timer className="h-4 w-4 text-warning-yellow" />;
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "inspection":
        return "bg-primary text-primary-foreground";
      case "construction":
        return "bg-construction-green text-construction-green-foreground";
      case "delivery":
        return "bg-safety-orange text-safety-orange-foreground";
      case "meeting":
        return "bg-warning-yellow text-warning-yellow-foreground";
      case "maintenance":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const filteredTasks = todaysTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || task.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-display font-bold text-foreground mb-2">
            Schedule & Timeline
          </h1>
          <p className="text-body-large text-muted-foreground">
            Manage tasks, deadlines, and project timelines
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="lg">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </Button>
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Task
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
        {scheduleStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
          >
            <Card variant="construction">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="construction-outline" size="default">
                      <Filter className="h-4 w-4 mr-2" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                      All Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedFilter("pending")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter("in-progress")}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>
                      Completed
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

            {/* Today's Tasks */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    variant="construction" 
                    className="group cursor-pointer hover:shadow-md transition-all"
                    onClick={() => router.push(`/dashboard/schedule/tasks/${task.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {task.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.project}
                          </p>
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <div className={`px-2 py-1 rounded-md text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </div>
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Time and Duration */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {task.time}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Timer className="h-4 w-4 mr-1" />
                            {task.duration}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(task.status)}
                            <span className="text-sm font-medium capitalize">{task.status.replace('-', ' ')}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{task.location}</span>
                        </div>

                        {/* Team */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Assignee</span>
                            <span className="text-sm font-medium">{task.assignee}</span>
                          </div>
                          {task.team.length > 0 && task.team[0] !== "All" && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Team</span>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{task.team.length} members</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {task.notes && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground">{task.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="construction">
                <CardContent className="p-0">
                  {filteredTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`p-6 hover:bg-accent/50 transition-colors cursor-pointer ${
                        index !== filteredTasks.length - 1 ? "border-b border-border" : ""
                      }`}
                      onClick={() => router.push(`/dashboard/schedule/tasks/${task.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                              {task.title}
                            </h3>
                            <div className={`px-2 py-1 rounded-md text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                              {task.type}
                            </div>
                            <Badge variant={getPriorityColor(task.priority)} size="sm">
                              {task.priority}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(task.status)}
                              <span className="text-sm font-medium capitalize">{task.status.replace('-', ' ')}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{task.project}</p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Time</div>
                              <div className="text-sm font-medium">{task.time}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Duration</div>
                              <div className="text-sm font-medium">{task.duration}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Location</div>
                              <div className="text-sm font-medium">{task.location}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Assignee</div>
                              <div className="text-sm font-medium">{task.assignee}</div>
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
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

          <TabsContent value="week" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {weeklySchedule.map((day) => (
                <Card key={day.date} variant="construction">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{day.date}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {day.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{task.time}</span>
                            {getStatusIcon(task.status)}
                          </div>
                          <h4 className="text-sm font-medium text-foreground mb-1">
                            {task.title}
                          </h4>
                          <Badge variant={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card variant="construction">
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Calendar Integration
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Full calendar view with drag-and-drop scheduling will be available here.
                  </p>
                  <Button variant="construction-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Calendar Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <div className="space-y-6">
              {upcomingMilestones.map((milestone) => (
                <Card key={milestone.id} variant="construction">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                          <Badge 
                            variant={milestone.status === "on-track" ? "status-active" : "status-overdue"} 
                            size="sm"
                          >
                            {milestone.status.replace('-', ' ')}
                          </Badge>
                          <Badge 
                            variant={milestone.importance === "critical" ? "destructive" : "outline"} 
                            size="sm"
                          >
                            {milestone.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{milestone.date}</p>
                        <p className="text-xs text-muted-foreground">{milestone.daysLeft} days left</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            milestone.status === "on-track" ? "bg-construction-green" : "bg-warning-yellow"
                          )}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}