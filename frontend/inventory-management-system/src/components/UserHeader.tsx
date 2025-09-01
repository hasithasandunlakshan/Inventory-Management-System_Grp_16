'use client';

import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface UserHeaderProps {
  onLoginClick?: () => void;
}

export function UserHeader({ onLoginClick }: UserHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-white shadow-sm rounded-lg mb-6">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Welcome, {user.fullName || user.username}!</h2>
          <p className="text-sm text-gray-600">
            Role: {user.role} | Email: {user.email}
          </p>
        </div>
        <Button 
          onClick={logout}
          variant="outline"
          size="sm"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
      <div>
        <h2 className="text-lg font-semibold text-yellow-800">Authentication Required</h2>
        <p className="text-sm text-yellow-700">
          Please login to access supplier management features
        </p>
      </div>
      <Button 
        onClick={onLoginClick}
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        Login
      </Button>
    </div>
  );
}
