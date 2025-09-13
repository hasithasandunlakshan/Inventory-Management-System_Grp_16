'use client';

import React from 'react';

interface EditPurchaseOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPurchaseOrderPage({ params }: EditPurchaseOrderPageProps) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Purchase Order</h1>
        <p className="text-gray-600">Edit purchase order #{id}</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Purchase order edit form will be implemented here.</p>
      </div>
    </div>
  );
}
