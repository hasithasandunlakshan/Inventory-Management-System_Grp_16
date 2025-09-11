'use client';

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {

  const handleLoginSuccess = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Welcome Back</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
