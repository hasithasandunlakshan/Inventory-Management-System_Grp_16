'use client';

import React from 'react';

interface SupplierDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SupplierDetailsPage({ params }: SupplierDetailsPageProps) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supplier Details</h1>
        <p className="text-gray-600">View details for supplier #{id}</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Supplier details will be implemented here.</p>
      </div>
    </div>
  );
}
