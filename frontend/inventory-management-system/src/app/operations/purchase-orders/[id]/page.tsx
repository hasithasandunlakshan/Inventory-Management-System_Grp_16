'use client';

import React from 'react';

interface PurchaseOrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PurchaseOrderDetailsPage({
  params,
}: PurchaseOrderDetailsPageProps) {
  const { id } = await params;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Purchase Order Details</h1>
        <p className='text-gray-600'>View details for purchase order #{id}</p>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <p className='text-gray-500'>
          Purchase order details will be implemented here.
        </p>
      </div>
    </div>
  );
}
