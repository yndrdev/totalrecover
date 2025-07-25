"use client";

import { useState, useEffect } from "react";
import { HealthcareSidebar } from "./healthcare-sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { colors, spacing } from '@/lib/design-system/constants';
import { LogOut, Settings, User, ChevronDown } from "lucide-react";

interface HealthcareLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
}

export function HealthcareLayout({ children, userRole = "provider", userName = "User" }: HealthcareLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [actualUserRole, setActualUserRole] = useState(userRole);
  const [actualUserName, setActualUserName] = useState(userName);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Skip authentication for provider, practice, and saasadmin routes
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isProtectedRoute = !currentPath.startsWith('/provider') &&
                            !currentPath.startsWith('/practice') &&
                            !currentPath.startsWith('/saasadmin');

    // For non-protected routes, just use the provided userRole and userName
    if (!isProtectedRoute) {
      setActualUserRole(userRole);
      setActualUserName(userName);
      return;
    }

    // Get current user information only for protected routes
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && isProtectedRoute) {
        router.push("/");
        return;
      }

      // Get user profile if user exists
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, user_type")
          .eq("id", user.id)
          .single();

        if (profile) {
          setActualUserRole(profile.user_type || userRole);
          setActualUserName(profile.name || user.email?.split("@")[0] || userName);
        }
      }
    };

    getUser();

    // Set up auth state change listener only for protected routes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && isProtectedRoute) {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, userRole, userName]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");  // This already redirects to the root page
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  {/* <thinking>
  Visual Design: Modern healthcare layout with responsive sidebar
  Healthcare Context: Role-based layout adapting to user type
  UX Design: Clean separation between navigation and content areas
  </thinking> */}

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar
        userRole={actualUserRole}
      />
      
      {/* Main Content Area */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${
        sidebarCollapsed ? "ml-0" : "ml-0"
      }`}>
        {/* Top Bar with Profile Dropdown */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Builder</h1>
              <div className="h-6 w-px bg-gray-200"></div>
              <p className="text-sm text-gray-600">Create and customize recovery protocols</p>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006DB1' }}>
                  <span className="text-white font-medium text-sm">
                    {actualUserName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {actualUserName || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {actualUserRole}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{actualUserName || 'User'}</p>
                    <p className="text-xs text-gray-600 capitalize">{actualUserRole}</p>
                  </div>
                  
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        // Handle profile navigation
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        // Handle settings navigation
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </button>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}