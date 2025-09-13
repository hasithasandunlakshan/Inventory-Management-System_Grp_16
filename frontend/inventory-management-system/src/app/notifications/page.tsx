'use client';

import { useEffect, useState } from 'react';
import {
  stockAlertService,
  type StockAlert,
} from '@/lib/services/stockAlertService';

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await stockAlertService.listHistory();
      setAlerts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>Notifications</h1>
      {loading && (
        <div className='text-sm text-muted-foreground'>Loading...</div>
      )}
      {error && <div className='text-sm text-red-600'>{error}</div>}

      <div className='bg-white rounded-md border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-left'>
            <tr>
              <th className='px-4 py-2'>Time</th>
              <th className='px-4 py-2'>Type</th>
              <th className='px-4 py-2'>Product</th>
              <th className='px-4 py-2'>Message</th>
              <th className='px-4 py-2'>Status</th>
              <th className='px-4 py-2'></th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.alertId} className='border-t'>
                <td className='px-4 py-2 whitespace-nowrap'>
                  {new Date(a.createdAt).toLocaleString()}
                </td>
                <td className='px-4 py-2'>{a.alertType}</td>
                <td className='px-4 py-2'>{a.productId}</td>
                <td className='px-4 py-2'>{a.message}</td>
                <td className='px-4 py-2'>
                  {a.isResolved ? 'Resolved' : 'Active'}
                </td>
                <td className='px-4 py-2 text-right'>
                  {!a.isResolved && (
                    <button
                      className='text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200'
                      onClick={async () => {
                        try {
                          await stockAlertService.resolve(a.alertId);
                          setAlerts(prev =>
                            prev.map(x =>
                              x.alertId === a.alertId
                                ? { ...x, isResolved: true }
                                : x
                            )
                          );
                        } catch {}
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {alerts.length === 0 && !loading && (
              <tr>
                <td
                  className='px-4 py-6 text-center text-muted-foreground'
                  colSpan={6}
                >
                  No notifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
