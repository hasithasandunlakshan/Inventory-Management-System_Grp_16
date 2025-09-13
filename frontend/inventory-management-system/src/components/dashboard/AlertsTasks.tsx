'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  stockAlertService,
  type StockAlert,
} from '@/lib/services/stockAlertService';

export default function AlertsTasks() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await stockAlertService.listUnresolved();
      setAlerts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  async function resolveAlert(alertId: number) {
    try {
      await stockAlertService.resolve(alertId);
      setAlerts(prev => prev.filter(a => a.alertId !== alertId));
    } catch {
      // no-op for now; could show toast
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(t);
  }, []);

  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Alerts & Tasks</CardTitle>
        <CardDescription>What needs your attention</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className='text-sm text-muted-foreground'>Loading alerts...</div>
        )}
        {error && <div className='text-sm text-red-600'>{error}</div>}
        {!loading && alerts.length === 0 && !error && (
          <div className='text-sm text-muted-foreground'>No active alerts</div>
        )}
        <div className='space-y-3 text-sm'>
          {alerts.map(a => (
            <div key={a.alertId} className='flex items-start justify-between'>
              <div>
                <div className='font-medium'>
                  {a.alertType === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                </div>
                <div className='text-muted-foreground'>{a.message}</div>
                <div className='text-xs text-muted-foreground'>
                  Product ID: {a.productId} ·{' '}
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => resolveAlert(a.alertId)}
              >
                Resolve
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
