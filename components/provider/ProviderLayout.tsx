"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from "@/components/auth/user-provider";
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  ClipboardList, 
  MessageSquare, 
  Plus, 
  BarChart3,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface ProviderLayoutProps {
  children: React.ReactNode;
  currentUser?: any;
  title?: string;
  subtitle?: string;
}

export default function ProviderLayout({ 
  children, 
  currentUser, 
  title = "Provider Dashboard",
  subtitle = "Manage your patients and protocols"
}: ProviderLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { signOut } = useUserContext();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/provider/dashboard", icon: Home },
    { name: "All Patients", href: "/provider/patients", icon: Users },
    { name: "Protocol Builder", href: "/provider/protocols/builder", icon: FileText },
    { name: "Content Builder", href: "/builder", icon: Plus },
    { name: "Chat Monitor", href: "/provider/chat-monitor", icon: MessageSquare },
    { name: "Audit Logs", href: "/provider/audit-logs", icon: ClipboardList },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {mounted && (
        <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Provider Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start mb-2"
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">TJV Recovery</h1>
          <p className="text-sm text-gray-600 mt-1">Provider Portal</p>
        </div>
        
        <nav className="p-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start mb-2"
              onClick={() => router.push(item.href)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </Button>
          ))}
        </nav>

        {currentUser && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{currentUser.first_name} {currentUser.last_name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">{title}</h1>
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}