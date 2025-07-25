"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Activity,
  UserPlus,
  Database,
  Shield,
  BarChart,
  LogOut,
  ChevronDown,
  BookOpen,
  ClipboardList
} from "lucide-react";

interface HealthcareSidebarProps {
  userRole: string;
  onLogout?: () => void;
}

export function HealthcareSidebar({
  userRole,
  onLogout
}: HealthcareSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const signOut = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
      router.push("/");
    }
  };

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/patients", label: "Patients", icon: Users },
    { href: "/admin/providers", label: "Providers", icon: UserPlus },
    { href: "/admin/protocols", label: "Protocols", icon: FileText },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart },
    { href: "/admin/system", label: "System", icon: Database },
    { href: "/admin/security", label: "Security", icon: Shield },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const providerNavItems = [
    {
      href: "/provider/patients",
      label: "Patients",
      icon: Users
    },
    { href: "/provider/messages", label: "Messages", icon: MessageSquare },
    {
      href: "/provider/protocols",
      label: "Protocols",
      icon: ClipboardList,
      hasDropdown: true,
      subItems: [
        { href: "/provider/protocols", label: "View Protocols" },
        { href: "/provider/protocols/builder", label: "Protocol Builder" }
      ]
    },
    {
      href: "/provider/content",
      label: "Content Library",
      icon: BookOpen,
      hasDropdown: true,
      subItems: [
        { href: "/provider/content/forms", label: "Forms" },
        { href: "/provider/content/videos", label: "Videos" },
        { href: "/provider/content/exercises", label: "Exercises" }
      ]
    },
  ];

  const patientNavItems = [
    { href: "/patient/dashboard", label: "Dashboard", icon: Home },
    { href: "/patient/schedule", label: "Schedule", icon: Calendar },
    { href: "/patient/exercises", label: "Exercises", icon: Activity },
    { href: "/patient/resources", label: "Resources", icon: FileText },
    { href: "/patient/progress", label: "Progress", icon: BarChart },
    { href: "/patient/settings", label: "Settings", icon: Settings },
  ];

  const practiceNavItems = [
    {
      href: "/practice/patients",
      label: "Patients",
      icon: Users,
      hasDropdown: true,
      subItems: [
        { href: "/practice/patients", label: "All Patients" },
        { href: "/practice/patients/new", label: "Add New Patient" }
      ]
    },
    { href: "/practice/messages", label: "Messages", icon: MessageSquare },
    {
      href: "/practice/protocols",
      label: "Protocols",
      icon: ClipboardList,
      hasDropdown: true,
      subItems: [
        { href: "/practice/protocols", label: "View Protocols" },
        { href: "/practice/protocols/builder", label: "Protocol Builder" }
      ]
    },
    {
      href: "/practice/content",
      label: "Content Library",
      icon: BookOpen,
      hasDropdown: true,
      subItems: [
        { href: "/practice/content/forms", label: "Forms" },
        { href: "/practice/content/videos", label: "Videos" },
        { href: "/practice/content/exercises", label: "Exercises" }
      ]
    },
  ];

  const saasAdminNavItems = [
    { href: "/provider/patients", label: "Patients", icon: Users },
    { href: "/provider/messages", label: "Messages", icon: MessageSquare },
    { href: "/saasadmin/admin-settings", label: "Admin Settings", icon: Settings },
    { href: "/saasadmin/protocol-builder", label: "Protocol Builder", icon: FileText },
  ];

  const navigationItems =
    userRole === "admin" ? adminNavItems :
    userRole === "patient" ? patientNavItems :
    userRole === "practice" ? practiceNavItems :
    userRole === "saasadmin" ? saasAdminNavItems :
    providerNavItems;

  // Professional Navigation Item Component
  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const active = pathname === item.href || (item.subItems && item.subItems.some((sub: any) => pathname === sub.href));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    return (
      <li>
        {item.hasDropdown ? (
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                active
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
            {dropdownOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                {item.subItems?.map((subItem: any) => (
                  <li key={subItem.href}>
                    <a
                      href={subItem.href}
                      className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                        pathname === subItem.href
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {subItem.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <a
            href={item.href}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              active
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </a>
        )}
      </li>
    );
  };

  return (
    <div className="bg-white border-r border-gray-200 h-screen flex flex-col w-64">
      {/* Minimal Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Healthcare Platform</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={signOut}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}