'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReceivePurchaseOrderPage() {
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
        <h1 className='text-3xl font-bold'>Receive Purchase Order</h1>
        <p className='text-gray-600'>Receive items for purchase order #{id}</p>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <p className='text-gray-500'>
          Purchase order receiving form will be implemented here.
        </p>
      </div>
    </div>
  );
}
