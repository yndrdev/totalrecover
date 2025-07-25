import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to verify admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError || profile.role !== "admin") {
    console.error("No admin profile found for user:", user.id);
    redirect("/login");
  }

  // Get patient count for admin oversight
  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .eq("tenant_id", profile.tenant_id);

  const patientCount = patients?.length || 0;

  // Get provider count
  const { data: providers } = await supabase
    .from("profiles")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .in("role", ["surgeon", "nurse", "physical_therapist"]);

  const providerCount = providers?.length || 0;

  // Get system alerts (placeholder)
  const systemAlerts = 3;

  // Get completed tasks (placeholder)
  const completedTasks = 1247;

  // Get recent activity (placeholder)
  const recentActivity = [
    {
      id: "1",
      title: "New patient enrolled",
      subtitle: "Sarah Johnson - TKA Recovery",
      time: "2 hours ago",
      type: "patient",
      icon: () => <div className="w-4 h-4 bg-blue-500 rounded-full" />
    },
    {
      id: "2", 
      title: "Provider updated protocol",
      subtitle: "Dr. Smith modified exercise plan",
      time: "4 hours ago",
      type: "provider",
      icon: () => <div className="w-4 h-4 bg-green-500 rounded-full" />
    },
    {
      id: "3",
      title: "System alert resolved",
      subtitle: "Database connection restored",
      time: "6 hours ago",
      type: "system",
      icon: () => <div className="w-4 h-4 bg-yellow-500 rounded-full" />
    },
    {
      id: "4",
      title: "High pain score reported",
      subtitle: "Patient requires immediate attention",
      time: "8 hours ago",
      type: "alert",
      icon: () => <div className="w-4 h-4 bg-red-500 rounded-full" />
    }
  ];

  // Monthly metrics (placeholder)
  const monthlyMetrics = {
    revenue: 125000,
    patientGrowth: 15,
    taskCompletion: 92
  };

  const dashboardData = {
    profile,
    patientCount,
    providerCount,
    systemAlerts,
    completedTasks,
    recentActivity,
    monthlyMetrics
  };

  return <AdminDashboard data={dashboardData} />;
}