'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, UserInfo } from '../lib/services/authService';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  canAccessSupplierService: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
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
              setUser(currentUserData || userData);
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
      const response = await authService.login({ username, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
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
  };

  const canAccessSupplierService = () => {
    return authService.canAccessSupplierService();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    canAccessSupplierService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
