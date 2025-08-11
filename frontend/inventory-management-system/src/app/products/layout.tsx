'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProductLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-full">
      {/* Header with Search and Add Product */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex-grow max-w-md mr-4">
          <Input 
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Link href="/products/add">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Add Product
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}