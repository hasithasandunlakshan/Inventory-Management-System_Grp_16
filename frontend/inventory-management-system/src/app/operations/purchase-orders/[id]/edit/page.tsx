'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const [id, setId] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      setId(params.id as string);
    }
  }, [params.id]);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Edit Purchase Order</h1>
        <p className='text-gray-600'>Edit purchase order #{id}</p>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <p className='text-gray-500'>
          Purchase order edit form will be implemented here.
        </p>
      </div>
    </div>
  );
}
