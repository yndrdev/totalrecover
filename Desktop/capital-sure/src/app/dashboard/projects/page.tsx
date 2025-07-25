"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: 1,
    name: "Downtown Office Complex",
    description: "Modern 15-story office building with underground parking",
    status: "In Progress",
    progress: 68,
    startDate: "Jan 15, 2025",
    endDate: "Dec 15, 2025",
    budget: 850000,
    spent: 578000,
    location: "Downtown District",
    manager: "Sarah Johnson",
    team: 24,
    priority: "high",
    statusColor: "status-active",
    category: "Commercial",
    lastUpdate: "2 hours ago",
  },
  {
    id: 2,
    name: "Residential Tower A",
    description: "Luxury residential complex with amenities",
    status: "Planning",
    progress: 15,
    startDate: "Mar 1, 2025",
    endDate: "Mar 20, 2026",
    budget: 1200000,
    spent: 180000,
    location: "North District",
    manager: "Mike Chen",
    team: 12,
    priority: "medium",
    statusColor: "project-planning",
    category: "Residential",
    lastUpdate: "1 day ago",
  },
  {
    id: 3,
    name: "Shopping Center Renovation",
    description: "Complete renovation of existing shopping center",
    status: "In Progress",
    progress: 45,
    startDate: "Nov 10, 2024",
    endDate: "Jan 30, 2026",
    budget: 650000,
    spent: 292500,
    location: "West Side",
    manager: "Lisa Rodriguez",
    team: 18,
    priority: "medium",
    statusColor: "status-active",
    category: "Retail",
    lastUpdate: "4 hours ago",
  },
  {
    id: 4,
    name: "Highway Bridge Construction",
    description: "New bridge spanning the river with bike lanes",
    status: "Planning",
    progress: 8,
    startDate: "May 1, 2025",
    endDate: "Oct 15, 2026",
    budget: 2100000,
    spent: 168000,
    location: "East River",
    manager: "David Kim",
    team: 35,
    priority: "high",
    statusColor: "project-planning",
    category: "Infrastructure",
    lastUpdate: "6 hours ago",
  },
  {
    id: 5,
    name: "School Gymnasium",
    description: "New gymnasium for local high school",
    status: "In Progress",
    progress: 82,
    startDate: "Aug 1, 2024",
    endDate: "Jan 15, 2025",
    budget: 480000,
    spent: 393600,
    location: "School District",
    manager: "Emma Wilson",
    team: 16,
    priority: "low",
    statusColor: "status-active",
    category: "Educational",
    lastUpdate: "1 hour ago",
  },
  {
    id: 6,
    name: "Medical Center Expansion",
    description: "Adding new wing to existing medical facility",
    status: "Completed",
    progress: 100,
    startDate: "Feb 1, 2024",
    endDate: "Nov 30, 2024",
    budget: 920000,
    spent: 898000,
    location: "Medical District",
    manager: "Robert Taylor",
    team: 28,
    priority: "high",
    statusColor: "project-completed",
    category: "Healthcare",
    lastUpdate: "2 weeks ago",
  },
];

const projectStats = [
  {
    label: "Total Projects",
    value: "12",
    change: "+2",
    changeLabel: "This month",
    icon: Grid3X3,
    color: "text-primary",
  },
  {
    label: "Active Projects",
    value: "8",
    change: "+1",
    changeLabel: "This week",
    icon: TrendingUp,
    color: "text-success",
  },
  {
    label: "Total Budget",
    value: "$6.2M",
    change: "+$1.2M",
    changeLabel: "This quarter",
    icon: DollarSign,
    color: "text-warning",
  },
  {
    label: "Team Members",
    value: "133",
    change: "+8",
    changeLabel: "This month",
    icon: Users,
    color: "text-info",
  },
];

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      project.status.toLowerCase().replace(" ", "-") === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "In Progress":
        return <TrendingUp className="h-4 w-4" />;
      case "Planning":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-display font-bold text-foreground mb-2">
            Project Management
          </h1>
          <p className="text-body-large text-muted-foreground">
            Manage and monitor all your construction projects
          </p>
        </div>
        <Button size="lg" className="mt-4 sm:mt-0">
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        {projectStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            className=""
          >
            <Card>
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
                    <span className="text-success font-medium mr-1">
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

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                All Projects
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSelectedFilter("in-progress")}
              >
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("planning")}>
                Planning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Projects Grid/List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className=""
              >
                <Card className="group border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
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
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant="outline" size="sm">
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {project.category}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Budget */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Budget
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">
                            {formatCurrency(project.spent)} /{" "}
                            {formatCurrency(project.budget)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((project.spent / project.budget) * 100)}
                            % spent
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {project.startDate} - {project.endDate}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{project.team} team members</span>
                          </div>
                          <span className="text-xs">
                            Updated {project.lastUpdate}
                          </span>
                        </div>
                      </div>

                      {/* Manager */}
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Project Manager
                          </span>
                          <span className="text-sm font-medium">
                            {project.manager}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card variant="construction">
            <CardContent className="p-0">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={cn(
                    "p-6 hover:bg-accent/50 transition-colors",
                    index !== filteredProjects.length - 1 &&
                      "border-b border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <Badge variant="outline" size="sm">
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {project.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="">
                          <div className="text-xs text-muted-foreground mb-1">
                            Progress
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={project.progress}
                              className="h-2 flex-1"
                            />
                            <span className="text-sm font-medium">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="">
                          <div className="text-xs text-muted-foreground mb-1">
                            Budget
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(project.budget)}
                          </div>
                        </div>
                        <div className="">
                          <div className="text-xs text-muted-foreground mb-1">
                            Team
                          </div>
                          <div className="text-sm font-medium">
                            {project.team} members
                          </div>
                        </div>
                        <div className="">
                          <div className="text-xs text-muted-foreground mb-1">
                            Manager
                          </div>
                          <div className="text-sm font-medium">
                            {project.manager}
                          </div>
                        </div>
                        <div className="">
                          <div className="text-xs text-muted-foreground mb-1">
                            Contract Type
                          </div>
                          <div className="text-sm font-medium">
                            {project.contractType}
                          </div>
                        </div>
                        <div className="">
                          <div className="text-xs text-muted-foreground mb-1">
                            Client
                          </div>
                          <div className="text-sm font-medium">
                            {project.client}
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No projects found
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search criteria or create a new project.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </motion.div>
      )}
    </div>
  );
}
