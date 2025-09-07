"use client";


import { useRedirectByRole } from "@/hooks/useRedirectByRole";

export default function DashboardPage() {
  // This page redirects users to their role-specific dashboard
  useRedirectByRole();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting to your dashboard...</p>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}


