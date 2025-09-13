'use client';

import { PurchaseOrderStats } from '@/components/PurchaseOrderStats';
import { AuthProvider } from '@/contexts/AuthContext';
import { useState } from 'react';

function PurchaseOrdersPageContent() {
  const [refreshTrigger] = useState(0);

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='bg-green-100 p-4 rounded'>
        <h1>DEBUG: Purchase Orders Page is Loading</h1>
        <p>This page should show the stats component below</p>
      </div>

      <PurchaseOrderStats refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <AuthProvider>
      <PurchaseOrdersPageContent />
    </AuthProvider>
  );
}
