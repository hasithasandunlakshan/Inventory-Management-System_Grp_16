'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/services/authService';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  createdAt?: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  canAccessSupplierService: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const token = authService.getToken();
          
          if (!token) {
            console.log('No token found, clearing auth state');
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // Verify the token is still valid by making a test request
          try {
            const response = await fetch('http://localhost:8090/api/secure/user/current', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              // Token is valid, update user data if response contains user info
              const currentUserData = await response.json();
              setUser(currentUserData);
              setIsAuthenticated(true);
              console.log('✅ Authentication verified successfully');
            } else if (response.status === 401 || response.status === 403) {
              // Token is invalid or expired, clear it
              console.log('❌ Token validation failed (401/403), clearing authentication');
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
              
              // Show a user-friendly message
              console.log('🔐 Please log in to continue');
            } else {
              // Other error, assume token might still be valid but backend issue
              console.warn('⚠️ Token validation request failed with status:', response.status);
              // For safety, clear authentication on persistent failures
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            // Network error - could be temporary, but clear auth for safety
            console.error('❌ Token validation failed due to network error:', error);
            console.log('🧹 Clearing authentication due to validation failure');
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No auth data found, ensure clean state
          console.log('ℹ️ No authentication found, starting with clean state');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        // Clear everything on unexpected errors
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting login process...');
      const response = await authService.login({ username, password });
      
      console.log('🔐 AuthContext: Login response received:', {
        success: response.success,
        hasUser: !!response.user,
        hasToken: !!response.token,
        userRole: response.user?.role
      });
      
      if (response.success && response.user && response.token) {
        console.log('🔐 AuthContext: Setting user data:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        console.log('🔐 AuthContext: Login failed:', response.error);
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('🔐 AuthContext: Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await authService.signup(userData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Redirect to login page
    window.location.href = '/login';
  };

  const canAccessSupplierService = () => {
    return authService.canAccessSupplierService();
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role || user?.role.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        const token = authService.getToken();
        
        if (token) {
          // Verify token with backend
          const response = await fetch('http://localhost:8090/api/secure/user/current', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const currentUserData = await response.json();
            setUser(currentUserData);
            setIsAuthenticated(true);
          } else {
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    canAccessSupplierService,
    hasRole,
    hasAnyRole,
    refreshAuth,
  }), [user, isAuthenticated, isLoading, login, signup, logout, canAccessSupplierService, hasRole, hasAnyRole, refreshAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
