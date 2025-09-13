'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  inventoryService,
  type InventoryRow,
} from '@/lib/services/inventoryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function statusFor(row: InventoryRow) {
  if (row.availableStock <= 0)
    return { label: 'Out of Stock', variant: 'destructive' } as const;
  if (row.availableStock <= row.minThreshold)
    return { label: 'Low Stock', variant: 'secondary' } as const;
  return { label: 'OK', variant: 'default' } as const;
}

export default function InventoryListPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryRow | null>(null);
  const [delta, setDelta] = useState<string>('0');
  const [threshold, setThreshold] = useState<string>('');

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.listAll();
      setRows(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const computed = useMemo(
    () => rows.map(r => ({ ...r, status: statusFor(r) })),
    [rows]
  );

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>Inventory</h1>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Table</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className='text-sm text-muted-foreground'>Loading...</div>
          )}
          {error && <div className='text-sm text-red-600'>{error}</div>}
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 text-left'>
                <tr>
                  <th className='px-4 py-2'>Product ID</th>
                  <th className='px-4 py-2'>Stock</th>
                  <th className='px-4 py-2'>Reserved</th>
                  <th className='px-4 py-2'>Available</th>
                  <th className='px-4 py-2'>Threshold</th>
                  <th className='px-4 py-2'>Status</th>
                  <th className='px-4 py-2 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {computed.map(r => (
                  <tr key={r.inventoryId} className='border-t'>
                    <td className='px-4 py-2 whitespace-nowrap'>
                      {r.productId}
                    </td>
                    <td className='px-4 py-2'>{r.stock}</td>
                    <td className='px-4 py-2'>{r.reserved}</td>
                    <td className='px-4 py-2'>{r.availableStock}</td>
                    <td className='px-4 py-2'>{r.minThreshold}</td>
                    <td className='px-4 py-2'>
                      <Badge
                        variant={
                          r.status.variant as
                            | 'default'
                            | 'destructive'
                            | 'outline'
                            | 'secondary'
                        }
                      >
                        {r.status.label}
                      </Badge>
                    </td>
                    <td className='px-4 py-2 text-right'>
                      <Dialog
                        open={
                          dialogOpen && editing?.inventoryId === r.inventoryId
                        }
                        onOpenChange={o => {
                          if (!o) {
                            setDialogOpen(false);
                            setEditing(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              setEditing(r);
                              setDelta('0');
                              setDialogOpen(true);
                            }}
                          >
                            Update Stock
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Update Stock (Product {editing?.productId})
                            </DialogTitle>
                          </DialogHeader>
                          <div className='space-y-3 text-sm'>
                            <div className='grid grid-cols-2 gap-3'>
                              <div className='text-muted-foreground'>
                                Current Stock
                              </div>
                              <div className='text-right font-medium'>
                                {editing?.stock}
                              </div>
                              <div className='text-muted-foreground'>
                                Reserved
                              </div>
                              <div className='text-right font-medium'>
                                {editing?.reserved}
                              </div>
                              <div className='text-muted-foreground'>
                                Available
                              </div>
                              <div className='text-right font-medium'>
                                {editing?.availableStock}
                              </div>
                            </div>
                            <div className='pt-2'>
                              <label className='block text-sm mb-1'>
                                Change by (delta)
                              </label>
                              <input
                                className='w-full border rounded-md px-3 py-2 text-sm'
                                type='number'
                                value={delta}
                                onChange={e => setDelta(e.target.value)}
                              />
                            </div>
                            <div className='pt-2'>
                              <label className='block text-sm mb-1'>
                                Min Threshold
                              </label>
                              <input
                                className='w-full border rounded-md px-3 py-2 text-sm'
                                type='number'
                                value={threshold}
                                placeholder={String(
                                  editing?.minThreshold ?? ''
                                )}
                                onChange={e => setThreshold(e.target.value)}
                              />
                            </div>
                            <div className='flex justify-end gap-2 pt-2'>
                              <Button
                                variant='outline'
                                onClick={() => {
                                  setDialogOpen(false);
                                  setEditing(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  if (!editing) return;
                                  const d = Number(delta);
                                  if (Number.isNaN(d) || !Number.isFinite(d))
                                    return;
                                  try {
                                    const updated =
                                      await inventoryService.adjust(
                                        editing.productId,
                                        d
                                      );
                                    setRows(prev =>
                                      prev.map(x =>
                                        x.inventoryId === updated.inventoryId
                                          ? updated
                                          : x
                                      )
                                    );
                                    const t =
                                      threshold.trim() === ''
                                        ? NaN
                                        : Number(threshold);
                                    if (
                                      !Number.isNaN(t) &&
                                      Number.isFinite(t)
                                    ) {
                                      const after =
                                        await inventoryService.updateThreshold(
                                          editing.productId,
                                          t
                                        );
                                      setRows(prev =>
                                        prev.map(x =>
                                          x.inventoryId === after.inventoryId
                                            ? after
                                            : x
                                        )
                                      );
                                    }
                                    setDialogOpen(false);
                                    setEditing(null);
                                  } catch (e: unknown) {
                                    setError(
                                      e instanceof Error
                                        ? e.message
                                        : 'Failed to update'
                                    );
                                  }
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
                {computed.length === 0 && !loading && (
                  <tr>
                    <td
                      className='px-4 py-6 text-center text-muted-foreground'
                      colSpan={6}
                    >
                      No inventory found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// remove duplicate default export
