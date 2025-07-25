"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/design-system/Button";
import { Badge } from "@/components/ui/badge";
import { colors } from '@/lib/design-system/constants';
import {
  Home,
  Users,
  UserCheck,
  Settings,
  BarChart3,
  FileText,
  Video,
  Dumbbell,
  Calendar,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Building,
  Plus,
  MessageSquare
} from "lucide-react";

interface SidebarNavigationProps {
  userRole: string;
  userName: string;
  onLogout: () => void;
}

interface NavItem {
  title: string;
  icon: any;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: NavItem[];
}

export function SidebarNavigation({ userRole, userName, onLogout }: SidebarNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const adminNavItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/admin",
    },
    {
      title: "Patients",
      icon: Users,
      href: "/admin/patients",
      badge: "24",
      badgeVariant: "secondary"
    },
    {
      title: "Providers",
      icon: UserCheck,
      href: "/admin/providers",
      badge: "12",
      badgeVariant: "secondary"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
    },
    {
      title: "Content",
      icon: FileText,
      href: "/admin/content",
      children: [
        {
          title: "Forms",
          icon: FileText,
          href: "/admin/content/forms",
        },
        {
          title: "Exercises",
          icon: Dumbbell,
          href: "/admin/content/exercises",
        },
        {
          title: "Videos",
          icon: Video,
          href: "/admin/content/videos",
        },
      ]
    },
    {
      title: "Builder",
      icon: Plus,
      href: "/builder",
      badge: "New",
      badgeVariant: "default"
    },
    {
      title: "System",
      icon: Settings,
      href: "/admin/system",
      children: [
        {
          title: "Settings",
          icon: Settings,
          href: "/admin/system/settings",
        },
        {
          title: "Security",
          icon: Shield,
          href: "/admin/system/security",
        },
        {
          title: "Monitoring",
          icon: Activity,
          href: "/admin/system/monitoring",
        },
      ]
    },
  ];

  const providerNavItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/provider",
    },
    {
      title: "Patients",
      icon: Users,
      href: "/provider/patients",
      badge: "8",
      badgeVariant: "secondary"
    },
    {
      title: "Chat Monitor",
      icon: MessageSquare,
      href: "/provider/chat-monitor",
    },
    {
      title: "Schedule",
      icon: Calendar,
      href: "/provider/schedule",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/provider/analytics",
    },
    {
      title: "Content",
      icon: FileText,
      href: "/provider/content",
      children: [
        {
          title: "Exercises",
          icon: Dumbbell,
          href: "/provider/content/exercises",
        },
        {
          title: "Forms",
          icon: FileText,
          href: "/provider/content/forms",
        },
        {
          title: "Videos",
          icon: Video,
          href: "/provider/content/videos",
        },
      ]
    },
    {
      title: "Builder",
      icon: Plus,
      href: "/builder",
    },
  ];

  const navItems = userRole === "admin" ? adminNavItems : providerNavItems;

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/provider") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);

    return (
      <div className="space-y-1">
        {/* <thinking>
        Visual Design: Navigation items with active states
        Healthcare Context: Professional healthcare navigation
        UX Design: Clear hierarchy and interactive states
        </thinking> */}
        <button
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left ${
            level > 0 ? "pl-8" : ""
          } ${
            active 
              ? `bg-blue-50 text-${colors.primary.blue} border-r-2 border-${colors.primary.blue}` 
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => {
            if (hasChildren) {
              setExpanded(!expanded);
            } else {
              window.location.href = item.href;
            }
          }}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <Badge variant={item.badgeVariant || "secondary"} className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
              )}
            </>
          )}
        </button>
        
        {hasChildren && expanded && !collapsed && (
          <div className="space-y-1">
            {item.children?.map((child, index) => (
              <NavItem key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
      collapsed ? "w-16" : "w-64"
    }`}>
      {/* <thinking>
      Visual Design: Professional header with branding
      Healthcare Context: TJV Recovery platform identity
      UX Design: Collapsible sidebar for space efficiency
      </thinking> */}
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-r from-${colors.primary.blue} to-${colors.primary.blueDark} rounded-lg flex items-center justify-center`}>
                <Building className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">TJV Recovery</span>
                <span className="text-xs text-gray-600 capitalize">{userRole}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </nav>

      {/* <thinking>
      Visual Design: Alert section for important notifications
      Healthcare Context: Critical patient alerts need attention
      UX Design: Prominent placement for urgent information
      </thinking> */}
      {/* Alerts Section */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">3 Alerts</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              2 patients require attention
            </p>
          </div>
        </div>
      )}

      {/* <thinking>
      Visual Design: User profile section with logout
      Healthcare Context: Clear user identity for accountability
      UX Design: Easy access to logout for security
      </thinking> */}
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 bg-gradient-to-r from-${colors.primary.blueLight} to-${colors.primary.blue} rounded-full flex items-center justify-center`}>
            <span className="text-sm font-bold text-white">
              {userName?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-600 capitalize">{userRole}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-600 h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}