// Admin service for role management
import { authService } from './services/authService';

const API_BASE_URL = 'http://localhost:8090/api';

export interface UserWithRoles {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  accountStatus: string;
  createdAt: string;
}

export interface RoleAssignmentRequest {
  userId: number;
  roleName: string;
}

class AdminService {
  // Get all users with their roles
  async getAllUsersWithRoles(): Promise<UserWithRoles[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  // Get all available roles
  async getAllAvailableRoles(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/admin/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    return response.json();
  }

  // Assign role to user
  async assignRoleToUser(request: RoleAssignmentRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/assign-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to assign role');
    }

    return response.json();
  }

  // Remove role from user
  async removeRoleFromUser(request: RoleAssignmentRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/remove-role`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove role');
    }

    return response.json();
  }
}

export const adminService = new AdminService();
