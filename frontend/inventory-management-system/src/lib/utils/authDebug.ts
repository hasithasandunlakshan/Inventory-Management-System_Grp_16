/**
 * Authentication debugging utilities
 */

export const authDebug = {
  /**
   * Check authentication status and token validity
   */
  checkAuthStatus() {
    const token = localStorage.getItem('inventory_auth_token');
    const user = localStorage.getItem('inventory_user_info');

    console.group('🔐 Authentication Status');

    if (!token) {
      console.log('❌ No token found');
      console.groupEnd();
      return {
        hasToken: false,
        isValid: false,
        user: null,
        tokenInfo: null,
      };
    }

    console.log('✅ Token found:', token.substring(0, 20) + '...');

    try {
      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;

      console.log('📄 Token payload:', payload);
      console.log(
        '⏰ Token expires at:',
        new Date(payload.exp * 1000).toLocaleString()
      );
      console.log('🕐 Current time:', new Date().toLocaleString());
      console.log('🔍 Is expired:', isExpired);

      if (user) {
        try {
          const userData = JSON.parse(user);
          console.log('👤 User data:', userData);
        } catch (e) {
          console.log('❌ Invalid user data in localStorage');
        }
      }

      console.groupEnd();

      return {
        hasToken: true,
        isValid: !isExpired,
        user: user ? JSON.parse(user) : null,
        tokenInfo: payload,
      };
    } catch (error) {
      console.log('❌ Invalid token format:', error);
      console.groupEnd();
      return {
        hasToken: true,
        isValid: false,
        user: null,
        tokenInfo: null,
      };
    }
  },

  /**
   * Test API endpoint with current authentication
   */
  async testApiEndpoint(endpoint: string = '/api/secure/user/current') {
    const token = localStorage.getItem('inventory_auth_token');
    const baseUrl = 'http://localhost:8090';

    console.group(`🌐 Testing API Endpoint: ${endpoint}`);

    if (!token) {
      console.log('❌ No token available for testing');
      console.groupEnd();
      return { success: false, error: 'No token' };
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log(
        '📋 Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Response data:', data);
        console.groupEnd();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        console.groupEnd();
        return { success: false, error: `${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.log('❌ Network error:', error);
      console.groupEnd();
      return { success: false, error: `Network error: ${error}` };
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem('inventory_auth_token');
    localStorage.removeItem('inventory_user_info');
    console.log('🧹 Authentication data cleared');
  },

  /**
   * Log all relevant information for debugging
   */
  debugAll() {
    console.log('🔍 Full Authentication Debug Report');
    console.log('=====================================');

    const authStatus = this.checkAuthStatus();

    if (authStatus.hasToken && authStatus.isValid) {
      this.testApiEndpoint('/api/secure/user/current');
    }

    return authStatus;
  },
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}
