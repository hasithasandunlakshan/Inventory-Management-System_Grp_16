/**
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
export const getAuthHeadersOnly = (): HeadersInit => {
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
 * Check if user has required role
 */
export const hasRole = (requiredRole: string): boolean => {
  const user = authService.getUser();
  if (!user || !user.role) return false;
  
  // Handle multiple roles if needed
  const userRoles = user.role.split(',').map(r => r.trim());
  return userRoles.includes(requiredRole);
};

/**
 * Check if user can access supplier services
 */
export const canAccessSupplierService = (): boolean => {
  return hasRole('Store Keeper') || hasRole('MANAGER');
};

/**
 * Check if user can access product services
 */
export const canAccessProductService = (): boolean => {
  return hasRole('MANAGER');
};

/**
 * Check if user can access order services  
 */
export const canAccessOrderService = (): boolean => {
  return hasRole('Store Keeper') || hasRole('MANAGER');
};
