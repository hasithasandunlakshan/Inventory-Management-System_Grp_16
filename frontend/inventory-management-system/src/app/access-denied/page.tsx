"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Insufficient Permissions</CardTitle>
            <CardDescription>
              Your current role ({user?.role || 'Unknown'}) doesn't have access to this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>If you believe this is an error, please contact your administrator.</p>
              <p className="mt-2">
                Current user: <span className="font-medium">{user?.fullName || user?.username}</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
              <Button variant="outline" onClick={logout} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
