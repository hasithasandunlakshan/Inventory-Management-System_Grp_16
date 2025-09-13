'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/services/authService';

export default function AuthDebugComponent() {
  const [authInfo, setAuthInfo] = useState<any>(null);

  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    setAuthInfo({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      user: user,
      isAuthenticated,
      userRole,
      localStorageToken: !!localStorage.getItem('inventory_auth_token'),
      localStorageUser: !!localStorage.getItem('inventory_user_info'),
    });
  }, []);

  return (
    <div className='bg-yellow-100 p-4 rounded mb-4 border border-yellow-300'>
      <h3 className='font-bold text-yellow-800 mb-2'>
        🔐 Authentication Debug Info
      </h3>
      <pre className='text-xs text-yellow-700 overflow-auto'>
        {JSON.stringify(authInfo, null, 2)}
      </pre>
    </div>
  );
}
