/**
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 * Authentication utilities for consistent token handling across services
 */

import { authService } from '../services/authService';

/**
 * Get standard authentication headers for API requests
 * Uses the centralized auth service to ensure consistency
 */
export const getAuthHeaders = (): HeadersInit => {
  return {
    ...authService.getAuthHeader(),
    'Content-Type': 'application/json'
  };
};

/**
 * Get authentication headers without content-type (for file uploads)
 */
export const getAuthHeadersWithoutContentType = (): HeadersInit => {
  return authService.getAuthHeader();
};

/**
 * Create authenticated fetch request options
 */
export const createAuthenticatedRequestOptions = (
  method: string = 'GET',
  body?: any,
  additionalHeaders?: HeadersInit
): RequestInit => {
  const headers = {
    ...getAuthHeaders(),
    ...additionalHeaders
  };

  const options: RequestInit = {
    method,
    headers
  };

  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return options;
};

/**
 * Create authenticated fetch request options for file uploads
 */
export const createAuthenticatedFileUploadOptions = (
  method: string = 'POST',
  formData: FormData,
  additionalHeaders?: HeadersInit
): RequestInit => {
  const headers = {
    ...getAuthHeadersWithoutContentType(),
    ...additionalHeaders
  };

  return {
    method,
    headers,
    body: formData
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

/**
 * Get current user role
 */
export const getCurrentUserRole = (): string | null => {
  return authService.getUserRole();
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const userRole = getCurrentUserRole();
  return userRole === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: string[]): boolean => {
  const userRole = getCurrentUserRole();
  return userRole ? roles.includes(userRole) : false;
};
=======
=======
>>>>>>> Stashed changes
 * Creates request options with authentication headers
 */
export function createAuthenticatedRequestOptions(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): RequestInit {
  const token = localStorage.getItem('inventory_auth_token');
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  return options;
}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
