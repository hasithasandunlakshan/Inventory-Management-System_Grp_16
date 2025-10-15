'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
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
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    userData: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  canAccessSupplierService: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
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
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // Verify the token is still valid by making a test request
          try {
            const apiGatewayUrl =
              process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
              'http://localhost:8090';
            const response = await fetch(
              `${apiGatewayUrl}/api/secure/user/current`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.ok) {
              // Token is valid, update user data if response contains user info
              const currentUserData = await response.json();
              setUser(currentUserData);
              setIsAuthenticated(true);
            } else if (response.status === 401 || response.status === 403) {
              // Token is invalid or expired, clear it
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            } else {
              // Other error, assume token might still be valid but backend issue
              // For safety, clear authentication on persistent failures
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            // Network error - could be temporary, but clear auth for safety
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No auth data found, ensure clean state
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Clear everything on unexpected errors
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
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
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }, []);

  const signup = useCallback(async (userData: Record<string, unknown>) => {
    try {
      const response = await authService.signup(
        userData as unknown as Parameters<typeof authService.signup>[0]
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  const canAccessSupplierService = useCallback(() => {
    return authService.canAccessSupplierService();
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role || user?.role.includes(role) || false;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some(role => hasRole(role));
    },
    [hasRole]
  );

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      if (authService.isAuthenticated()) {
        const token = authService.getToken();

        if (token) {
          // Verify token with backend
          const apiGatewayUrl =
            process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8090';
          const response = await fetch(
            `${apiGatewayUrl}/api/secure/user/current`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

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
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
