import { createAuthenticatedRequestOptions } from '../utils/auth/authUtils';

const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
const API_BASE_URL = `${USER_SERVICE_URL}/api/secure`; // Direct to User Service
const ADMIN_API_BASE_URL = `${USER_SERVICE_URL}/api/admin`; // Admin endpoints direct to User Service

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string | null;
  accountStatus?: string;
  emailVerified?: boolean;
  createdAt?: string;
  dateOfBirth?: string | null;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  users: UserInfo[];
  totalUsers: number;
}

export const userService = {
  /**
   * Get user details by ID - tries secure endpoint first, then admin endpoint
   */
  async getUserById(userId: number): Promise<UserInfo> {
    try {
      // First try the secure endpoint (for own user access)
      const response = await fetch(
        `${API_BASE_URL}/user/${userId}`,
        createAuthenticatedRequestOptions()
      );

      if (response.ok) {
        return response.json();
      }

      // If secure endpoint fails with 403, try admin endpoint
      if (response.status === 403) {
        try {
          const adminResponse = await fetch(
            `${ADMIN_API_BASE_URL}/user/${userId}`,
            createAuthenticatedRequestOptions()
          );

          if (adminResponse.ok) {
            return adminResponse.json();
          }

          if (adminResponse.status === 403) {
            throw new Error(
              'Access denied - insufficient permissions to view user details'
            );
          }

          throw new Error(`Admin endpoint failed: ${adminResponse.status}`);
        } catch {
          throw new Error('Failed to fetch user details - access denied');
        }
      }

      if (response.status === 404) {
        throw new Error('User not found');
      }

      throw new Error(`Failed to fetch user details: ${response.status}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('access denied')) {
        throw error; // Re-throw access denied errors as-is
      }
      throw new Error('Failed to fetch user details - backend not available');
    }
  },

  /**
   * Get current authenticated user's details
   */
  async getCurrentUser(): Promise<UserInfo> {
    try {
      // First check if we have a token
      const token = localStorage.getItem('inventory_auth_token');
      if (!token) {
        throw new Error('No authentication token found - please login');
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp < currentTime) {
          // Token expired, clear storage and throw error
          localStorage.removeItem('inventory_auth_token');
          localStorage.removeItem('inventory_user_info');
          throw new Error('Authentication token expired - please login again');
        }
      } catch {
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_user_info');
        throw new Error('Invalid authentication token - please login again');
      }

      const response = await fetch(
        `${API_BASE_URL}/user/current`,
        createAuthenticatedRequestOptions()
      );

      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_user_info');
        throw new Error('Authentication failed - please login again');
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch current user details: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      // Re-throw authentication errors as-is
      if (
        error instanceof Error &&
        (error.message.includes('login') ||
          error.message.includes('Authentication') ||
          error.message.includes('token'))
      ) {
        throw error;
      }
      throw new Error(
        'Failed to fetch current user details - backend not available'
      );
    }
  },

  /**
   * Search for users by query string (username, email, or full name)
   */
  async searchUsers(query: string): Promise<UserInfo[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`,
        createAuthenticatedRequestOptions()
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'Access denied - insufficient permissions to search users'
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }

      const users = await response.json();
      return users;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Access denied') ||
          error.message.includes('permissions'))
      ) {
        throw error;
      }
      throw new Error('Failed to search users - backend not available');
    }
  },

  /**
   * Get all users (for admin/manager use)
   */
  async getAllUsers(): Promise<UserInfo[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users`,
        createAuthenticatedRequestOptions()
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'Access denied - insufficient permissions to view all users'
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch all users: ${response.status}`);
      }

      const users = await response.json();
      return users;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Access denied') ||
          error.message.includes('permissions'))
      ) {
        throw error;
      }
      throw new Error('Failed to fetch all users - backend not available');
    }
  },

  /**
   * Get users with "USER" role (for customer management)
   */
  async getUsersWithUserRole(): Promise<UsersResponse> {
    try {
      const USER_AUTH_BASE_URL = `${USER_SERVICE_URL}/api/auth`;
      const token = localStorage.getItem('inventory_auth_token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${USER_AUTH_BASE_URL}/users`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Filter users client-side
   */
  filterUsers(
    users: UserInfo[],
    filters: {
      status?: string;
      searchTerm?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): UserInfo[] {
    return users.filter(user => {
      // Status filter
      if (
        filters.status &&
        filters.status !== 'all' &&
        user.accountStatus?.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      // Date filters
      if (filters.dateFrom || filters.dateTo) {
        if (user.createdAt) {
          const userDate = new Date(user.createdAt);
          if (filters.dateFrom && userDate < new Date(filters.dateFrom)) {
            return false;
          }
          if (filters.dateTo && userDate > new Date(filters.dateTo)) {
            return false;
          }
        }
      }

      // Search term (search in username, email, full name, phone)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesUsername = user.username
          .toLowerCase()
          .includes(searchLower);
        const matchesEmail = user.email.toLowerCase().includes(searchLower);
        const matchesName = user.fullName?.toLowerCase().includes(searchLower);
        const matchesPhone = user.phoneNumber
          ?.toLowerCase()
          .includes(searchLower);

        if (
          !matchesUsername &&
          !matchesEmail &&
          !matchesName &&
          !matchesPhone
        ) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Get user statistics
   */
  getUserStats(users: UserInfo[]) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.accountStatus === 'ACTIVE').length;
    const verifiedUsers = users.filter(u => u.emailVerified).length;

    // Get recent signups (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentSignups = users.filter(u => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt) > lastWeek;
    }).length;

    // Get users by month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthSignups = users.filter(u => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt) > thisMonth;
    }).length;

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentSignups,
      thisMonthSignups,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
    };
  },
};
