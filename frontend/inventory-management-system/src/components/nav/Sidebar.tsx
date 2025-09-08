'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { getNavItemsForRole } from '@/lib/rbac/navItems';
import { Menu, ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type SidebarProps = Readonly<{
  title?: string;
}>;

export default function Sidebar({ title = 'IMS' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await login(loginData.username, loginData.password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  // Get navigation items based on user role
  const navItems = user?.role ? getNavItemsForRole(user.role) : [];

  const filteredNavItems = navItems;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {filteredNavItems.map((item) => {
            const { href, label, icon: Icon, children } = item;
            const itemIsActive = isActive(item);
            const isExpanded = expandedItems.has(label);

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {children.map((child: any) => {
                        const childIsActive = isActive(child);
                        return (
                          <Link key={child.href} href={child.href!} className="block">
                            <div
                              className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                childIsActive && 'bg-accent text-accent-foreground'
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              <span>{child.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            return (
              <Link key={href} href={href!} className="block">
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                    itemIsActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* User Info and Logout */}
        {user && (
          <div className="border-t p-4">
            <Link href="/profile" className="block mb-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.role}
                  </p>
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {open && (
        <dialog open className="fixed inset-0 z-50 md:hidden bg-transparent">
          <button className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close menu overlay" />
          <div
            ref={panelRef}
            className="absolute inset-y-0 left-0 w-72 translate-x-0 transform bg-background p-2 shadow-xl transition-transform"
          >
            <div className="h-14 border-b px-3 flex items-center text-base font-semibold tracking-tight">
              {title}
            </div>
            <nav className="mt-2 space-y-1">
              {filteredNavItems.map((item) => {
                const { href, label, icon: Icon, children } = item;
                const itemIsActive = isActive(item);
                const isExpanded = expandedItems.has(label);

                if (children) {
                  return (
                    <div key={label} className="space-y-1">
                      <button
                        onClick={() => toggleExpanded(label)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                          itemIsActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-4 space-y-1">
                          {children.map((child: any) => {
                            const childIsActive = isActive(child);
                            return (
                              <Link key={child.href} href={child.href!} className="block" onClick={() => setOpen(false)}>
                                <div
                                  className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                    childIsActive && 'bg-accent text-accent-foreground'
                                  )}
                                >
                                  <child.icon className="h-4 w-4" />
                                  <span>{child.label}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link key={href} href={href!} className="block" onClick={() => setOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        itemIsActive && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile User Info and Logout */}
            {user && (
              <div className="border-t p-4 mt-4">
                <Link href="/profile" className="block mb-3" onClick={() => setOpen(false)}>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.role}
                      </p>
                    </div>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
