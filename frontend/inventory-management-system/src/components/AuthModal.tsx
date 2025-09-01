'use client';

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const handleLoginSuccess = () => {
    onClose();
  };

  const handleSignupSuccess = () => {
    setMode('login');
  };

  const handleSwitchToSignup = () => {
    setMode('signup');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {mode === 'login' ? (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={handleSwitchToSignup}
            />
          ) : (
            <SignupForm
              onSignupSuccess={handleSignupSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
