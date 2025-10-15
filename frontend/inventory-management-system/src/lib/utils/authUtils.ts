import { authService } from '../services/authService';

/**
 * Create authenticated fetch request options for file uploads
 */
export const createAuthenticatedFileUploadOptions = (
  method: string = 'POST',
  formData: FormData,
  additionalHeaders?: HeadersInit
): RequestInit => {
  const headers = {
    ...authService.getAuthHeader(),
    ...additionalHeaders,
  };

  return {
    method,
    headers,
    body: formData,
  };
};

export function createAuthenticatedRequestOptions(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: unknown
): RequestInit {
  // Only access localStorage in browser environment
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('inventory_auth_token')
      : null;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  return options;
}
