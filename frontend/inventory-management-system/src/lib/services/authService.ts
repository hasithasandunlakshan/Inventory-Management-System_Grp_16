// Authentication service for JWT token management
const API_BASE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  'http://localhost:8080';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

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

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserInfo;
  message?: string;
  error?: string;
}

class AuthService {
  private tokenKey = 'inventory_auth_token';
  private userKey = 'inventory_user_info';

  // Login user and store token
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token) {
        // Store token and user info in localStorage
        localStorage.setItem(this.tokenKey, data.token);
        if (data.user) {
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
        }

        // Set HTTP-only cookie for middleware
        document.cookie = `inventory_auth_token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Sign up new user
  async signup(
    userData: SignupRequest
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const message = await response.text();
        return { success: true, message };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return {
        success: false,
        error: `Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user info
  getUser(): UserInfo | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  // Check if token is expired (basic check - you might want more sophisticated validation)
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true; // If we can't parse, consider it expired
    }
  }

  // Get authorization header for API calls
  getAuthHeader(): { Authorization: string } | Record<string, never> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    // Clear cookie
    document.cookie = 'inventory_auth_token=; path=/; max-age=0';
  }

  // Get user role for access control
  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole ? userRole.includes(role) : false;
  }

  // Check if user can access supplier services (Store Keeper or Manager)
  canAccessSupplierService(): boolean {
    return this.hasRole('Store Keeper') || this.hasRole('MANAGER');
  }
}

export const authService = new AuthService();
