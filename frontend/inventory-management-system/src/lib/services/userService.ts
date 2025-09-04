import { createAuthenticatedRequestOptions } from '../utils/authUtils';

const API_BASE_URL = 'http://localhost:8090/api/secure'; // Through API Gateway
const ADMIN_API_BASE_URL = 'http://localhost:8090/api/admin'; // Admin endpoints through API Gateway

export interface UserInfo {
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

export const userService = {
  /**
   * Get user details by ID - tries secure endpoint first, then admin endpoint
   */
  async getUserById(userId: number): Promise<UserInfo> {
    try {
      // First try the secure endpoint (for own user access)
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, createAuthenticatedRequestOptions());
      
      if (response.ok) {
        return response.json();
      }
      
      // If secure endpoint fails with 403, try admin endpoint
      if (response.status === 403) {
        console.log(`Secure endpoint returned 403 for user ${userId}, trying admin endpoint...`);
        try {
          const adminResponse = await fetch(`${ADMIN_API_BASE_URL}/user/${userId}`, createAuthenticatedRequestOptions());
          
          if (adminResponse.ok) {
            return adminResponse.json();
          }
          
          if (adminResponse.status === 403) {
            throw new Error('Access denied - insufficient permissions to view user details');
          }
          
          throw new Error(`Admin endpoint failed: ${adminResponse.status}`);
        } catch (adminError) {
          console.error('Admin endpoint also failed:', adminError);
          throw new Error('Failed to fetch user details - access denied');
        }
      }
      
      if (response.status === 404) {
        throw new Error('User not found');
      }
      
      throw new Error(`Failed to fetch user details: ${response.status}`);
      
    } catch (error) {
      console.error('Failed to fetch user details:', error);
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
      } catch (tokenError) {
        console.error('Invalid token format:', tokenError);
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_user_info');
        throw new Error('Invalid authentication token - please login again');
      }

      const response = await fetch(`${API_BASE_URL}/user/current`, createAuthenticatedRequestOptions());
      
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_user_info');
        throw new Error('Authentication failed - please login again');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch current user details: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch current user details:', error);
      // Re-throw authentication errors as-is
      if (error instanceof Error && 
          (error.message.includes('login') || 
           error.message.includes('Authentication') || 
           error.message.includes('token'))) {
        throw error;
      }
      throw new Error('Failed to fetch current user details - backend not available');
    }
  }
};
