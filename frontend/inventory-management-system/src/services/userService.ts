import { authService } from '../lib/services/authService';

const USER_API_BASE_URL = 'http://localhost:8090/api/auth';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  accountStatus: string;
  emailVerified: boolean;
  createdAt: string;
  dateOfBirth: string | null;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  users: UserInfo[];
  totalUsers: number;
}

class UserService {
  private async getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getUsersWithUserRole(): Promise<UsersResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${USER_API_BASE_URL}/users`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Filter and search utilities
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
        user.accountStatus.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      // Date filters
      if (filters.dateFrom || filters.dateTo) {
        const userDate = new Date(user.createdAt);
        if (filters.dateFrom && userDate < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && userDate > new Date(filters.dateTo)) {
          return false;
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
  }

  // Get user statistics
  getUserStats(users: UserInfo[]) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.accountStatus === 'ACTIVE').length;
    const verifiedUsers = users.filter(u => u.emailVerified).length;

    // Get recent signups (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentSignups = users.filter(
      u => new Date(u.createdAt) > lastWeek
    ).length;

    // Get users by month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthSignups = users.filter(
      u => new Date(u.createdAt) > thisMonth
    ).length;

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentSignups,
      thisMonthSignups,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
    };
  }
}

export const userService = new UserService();
