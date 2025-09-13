'use client';

import React from 'react';

interface ReceivePurchaseOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReceivePurchaseOrderPage({ params }: ReceivePurchaseOrderPageProps) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receive Purchase Order</h1>
        <p className="text-gray-600">Receive items for purchase order #{id}</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Purchase order receiving form will be implemented here.</p>
      </div>
    </div>
  );
}
