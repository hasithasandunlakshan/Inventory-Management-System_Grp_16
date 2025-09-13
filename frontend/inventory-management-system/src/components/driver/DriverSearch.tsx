'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DriverSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export default function DriverSearch({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search drivers by license, class, contact..." 
}: DriverSearchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
