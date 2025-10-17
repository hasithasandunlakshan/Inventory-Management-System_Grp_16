'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  inventoryService,
  type InventoryRow,
} from '@/lib/services/inventoryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, RefreshCw, Edit, Search, Filter } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter rows based on search
  const filteredRows = computed.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return row.productId.toString().includes(query);
  });

  return (
    <div className='space-y-6'>
      {/* Header Card with Search and Refresh */}
      <Card
        className='shadow-lg border-0'
        style={{
          background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
        }}
      >
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Package className='h-8 w-8 text-white' />
                <div>
                  <h1 className='text-2xl font-bold text-white'>
                    Inventory Management
                  </h1>
                  <p className='text-sm text-white/80'>
                    Monitor and manage stock levels
                  </p>
                </div>
              </div>
              <Button
                onClick={load}
                disabled={loading}
                className='bg-white text-blue-700 hover:bg-blue-50 shadow-md'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 pt-2 border-t border-white/20'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5' />
                <Input
                  type='text'
                  placeholder='Search by Product ID...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 h-11 bg-white/95 border-white/20 focus:bg-white placeholder:text-gray-400'
                />
              </div>
              <div className='flex items-center gap-2 text-white'>
                <Filter className='h-5 w-5' />
                <span className='text-sm font-medium'>
                  {filteredRows.length} items
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='text-sm text-red-600'>{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className='shadow-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Inventory Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className='flex justify-center py-8'>
              <RefreshCw className='h-6 w-6 animate-spin text-blue-600' />
            </div>
          )}
          {!loading && (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 text-left border-b-2 border-gray-200'>
                  <tr>
                    <th className='px-4 py-3 font-semibold text-gray-700'>
                      Product ID
                    </th>
                    <th className='px-4 py-3 font-semibold text-gray-700'>
                      Stock
                    </th>
                    <th className='px-4 py-3 font-semibold text-gray-700'>
                      Reserved
                    </th>
                    <th className='px-4 py-3 font-semibold text-gray-700'>
                      Available
                    </th>
                    <th className='px-4 py-3 font-semibold text-gray-700'>
                      Threshold
                    </th>
                    <th className='px-4 py-3 font-semibold text-gray-700'>
                      Status
                    </th>
                    <th className='px-4 py-3 font-semibold text-gray-700 text-right'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(r => (
                    <tr
                      key={r.inventoryId}
                      className='border-t hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3 whitespace-nowrap font-medium'>
                        #{r.productId}
                      </td>
                      <td className='px-4 py-3 font-semibold'>{r.stock}</td>
                      <td className='px-4 py-3 text-orange-600 font-semibold'>
                        {r.reserved}
                      </td>
                      <td className='px-4 py-3 text-green-600 font-semibold'>
                        {r.availableStock}
                      </td>
                      <td className='px-4 py-3 text-gray-600'>
                        {r.minThreshold}
                      </td>
                      <td className='px-4 py-3'>
                        <Badge
                          variant={
                            r.status.variant as
                              | 'default'
                              | 'destructive'
                              | 'outline'
                              | 'secondary'
                          }
                          className='font-medium'
                        >
                          {r.status.label}
                        </Badge>
                      </td>
                      <td className='px-4 py-3 text-right'>
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
                                setThreshold('');
                                setDialogOpen(true);
                              }}
                              className='hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
                            >
                              <Edit className='w-4 h-4 mr-1' />
                              Update
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
                                <Edit className='h-6 w-6' />
                                Update Stock - Product #{editing?.productId}
                              </DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                              {/* Current Stats */}
                              <div className='grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg'>
                                <div className='text-center'>
                                  <div className='text-xs text-gray-500 mb-1'>
                                    Current Stock
                                  </div>
                                  <div className='text-lg font-bold text-gray-900'>
                                    {editing?.stock}
                                  </div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-xs text-gray-500 mb-1'>
                                    Reserved
                                  </div>
                                  <div className='text-lg font-bold text-orange-600'>
                                    {editing?.reserved}
                                  </div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-xs text-gray-500 mb-1'>
                                    Available
                                  </div>
                                  <div className='text-lg font-bold text-green-600'>
                                    {editing?.availableStock}
                                  </div>
                                </div>
                              </div>

                              {/* Delta Input */}
                              <div className='space-y-2'>
                                <Label htmlFor='delta-input'>
                                  Change by (Delta)
                                </Label>
                                <Input
                                  id='delta-input'
                                  className='h-11'
                                  type='number'
                                  value={delta}
                                  onChange={e => setDelta(e.target.value)}
                                  placeholder='Enter positive or negative number'
                                />
                                <p className='text-xs text-gray-500'>
                                  Positive to add, negative to remove stock
                                </p>
                              </div>

                              {/* Threshold Input */}
                              <div className='space-y-2'>
                                <Label htmlFor='threshold-input'>
                                  Min Threshold (Optional)
                                </Label>
                                <Input
                                  id='threshold-input'
                                  className='h-11'
                                  type='number'
                                  value={threshold}
                                  placeholder={String(
                                    editing?.minThreshold ?? ''
                                  )}
                                  onChange={e => setThreshold(e.target.value)}
                                />
                              </div>
                              {/* Action Buttons */}
                              <div className='flex gap-3 pt-2'>
                                <Button
                                  variant='outline'
                                  onClick={() => {
                                    setDialogOpen(false);
                                    setEditing(null);
                                    setDelta('0');
                                    setThreshold('');
                                  }}
                                  className='flex-1 h-11 border-2 border-red-300 text-red-600 hover:bg-red-50'
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
                                      setDelta('0');
                                      setThreshold('');
                                    } catch (e: unknown) {
                                      setError(
                                        e instanceof Error
                                          ? e.message
                                          : 'Failed to update'
                                      );
                                    }
                                  }}
                                  className='flex-1 h-11 font-semibold'
                                  style={{
                                    background:
                                      'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
                                  }}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && !loading && (
                    <tr>
                      <td
                        className='px-4 py-8 text-center text-muted-foreground'
                        colSpan={7}
                      >
                        {searchQuery
                          ? 'No inventory found matching your search'
                          : 'No inventory found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// remove duplicate default export
