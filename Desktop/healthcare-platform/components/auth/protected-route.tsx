"use client";

import { useUserContext } from "@/components/auth/user-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user || !profile) {
        router.push("/login");
        return;
      }

      // Check role requirements
      const userRole = profile.role.toLowerCase();
      
      // If specific role is required
      if (requiredRole && userRole !== requiredRole.toLowerCase()) {
        redirectToRoleDashboard(userRole);
        return;
      }

      // If allowed roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const isAllowed = allowedRoles.some(
          (role) => role.toLowerCase() === userRole
        );
        if (!isAllowed) {
          redirectToRoleDashboard(userRole);
          return;
        }
      }

      // Check if user is already on an appropriate route for their role
      const isOnValidRoute = checkValidRoute(userRole, pathname);
      if (!isOnValidRoute) {
        redirectToRoleDashboard(userRole);
      }
    }
  }, [user, profile, loading, allowedRoles, requiredRole, router, pathname]);

  const checkValidRoute = (role: string, currentPath: string): boolean => {
    switch (role) {
      case "patient":
        return currentPath.startsWith("/patient/") || currentPath === "/patient";
      case "practice_admin":
      case "clinic_admin":
      case "surgeon":
      case "nurse":
      case "physical_therapist":
      case "provider":
        return currentPath.startsWith("/provider/") || currentPath === "/provider";
      case "admin":
        return currentPath.startsWith("/admin/") || currentPath === "/admin";
      default:
        return false;
    }
  };

  const redirectToRoleDashboard = (role: string) => {
    switch (role) {
      case "patient":
        if (user?.id) {
          router.push(`/patient/${user.id}`);
        }
        break;
      case "practice_admin":
      case "clinic_admin":
      case "surgeon":
      case "nurse":
      case "physical_therapist":
      case "provider":
        router.push("/provider/patients");
        break;
      case "admin":
        router.push("/admin");
        break;
      default:
        router.push("/login");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !profile) {
    return null;
  }

  // Check role-based access
  if (requiredRole && profile.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return null;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => role.toLowerCase() === profile.role.toLowerCase())
  ) {
    return null;
  }

  return <>{children}</>;
}