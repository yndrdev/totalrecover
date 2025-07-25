"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  LayoutDashboard,
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  HardHat,
  FileText,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderOpen,
    current: false,
    children: [
      { name: "All Projects", href: "/dashboard/projects" },
      { name: "Active Projects", href: "/dashboard/projects/active" },
      { name: "Planning", href: "/dashboard/projects/planning" },
      { name: "Completed", href: "/dashboard/projects/completed" },
    ],
  },
  {
    name: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
    current: false,
    children: [
      { name: "Project Timeline", href: "/dashboard/schedule" },
      { name: "Task Management", href: "/dashboard/schedule/tasks" },
      { name: "Resource Planning", href: "/dashboard/schedule/resources" },
    ],
  },
  {
    name: "Financials",
    href: "/dashboard/financials",
    icon: DollarSign,
    current: false,
    children: [
      { name: "Budget Overview", href: "/dashboard/financials" },
      { name: "Cost Tracking", href: "/dashboard/financials/costs" },
      { name: "Payments", href: "/dashboard/financials/payments" },
      { name: "Reports", href: "/dashboard/financials/reports" },
    ],
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: Users,
    current: false,
    children: [
      { name: "Team Overview", href: "/dashboard/team" },
      { name: "Workers", href: "/dashboard/team/workers" },
      { name: "Contractors", href: "/dashboard/team/contractors" },
      { name: "Time Tracking", href: "/dashboard/team/time" },
    ],
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Safety",
    href: "/dashboard/safety",
    icon: HardHat,
    current: false,
    children: [
      { name: "Safety Dashboard", href: "/dashboard/safety" },
      { name: "Incidents", href: "/dashboard/safety/incidents" },
      { name: "Inspections", href: "/dashboard/safety/inspections" },
      { name: "Training", href: "/dashboard/safety/training" },
    ],
  },
];

const quickActions = [
  {
    name: "Create Project",
    icon: FolderOpen,
    href: "/dashboard/projects/new",
    color: "bg-primary",
  },
  {
    name: "Add Task",
    icon: Clock,
    href: "/dashboard/schedule/tasks/new",
    color: "bg-construction-green",
  },
  {
    name: "Site Report",
    icon: FileText,
    href: "/dashboard/reports/new",
    color: "bg-safety-orange",
  },
  {
    name: "Check-in",
    icon: MapPin,
    href: "/dashboard/team/checkin",
    color: "bg-warning-yellow",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const sidebarVariants = {
    open: {
      width: sidebarCollapsed ? "64px" : "280px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      width: "0px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate="open"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-border lg:z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">CapitalSure</span>
                <Badge variant="project-active" size="sm">Pro</Badge>
              </div>
            </Link>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.name);

            return (
              <div key={item.name}>
                <div
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleSection(item.name);
                    }
                  }}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", sidebarCollapsed ? "mr-0" : "mr-3")} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded ? "rotate-180" : ""
                          )}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Submenu */}
                {hasChildren && !sidebarCollapsed && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                              pathname === child.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div className="border-t border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary transition-all"
                >
                  <div className={cn("p-2 rounded-lg mb-2", action.color)}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-center group-hover:text-accent-foreground">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User profile */}
        <div className="border-t border-border p-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  John Constructor
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Project Manager
                </p>
              </div>
              <Button variant="ghost" size="icon-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="w-full">
              <Users className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main content */}
      <div className={cn("flex-1 lg:pl-80", sidebarCollapsed && "lg:pl-16")}>
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects, tasks, or team members..."
                  className="pl-10 w-64 lg:w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
              
              <div className="hidden sm:flex items-center space-x-2">
                <Badge variant="status-active" size="sm">Online</Badge>
                <span className="text-sm text-muted-foreground">Main Office</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}