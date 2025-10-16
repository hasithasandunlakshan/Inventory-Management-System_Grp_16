'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  Filter,
  Truck,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { deliveryLogService } from '@/lib/services/deliveryLogService';
import { useAuth } from '@/contexts/AuthContext';
import { DeliveryLog } from '@/lib/types/supplier';

// Define DeliveryLogCreateRequest to match the imported type
interface DeliveryLogCreateRequest {
  poId: number;
  itemID: number;
  receivedDate: string;
  receivedQuantity: number;
}

// Main component
function DeliveryLogsPageContent() {
  const { isAuthenticated, canAccessSupplierService } = useAuth();
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [poFilter, setPoFilter] = useState('');
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [newDeliveryLog, setNewDeliveryLog] =
    useState<DeliveryLogCreateRequest>({
      poId: 0,
      itemID: 0,
      receivedDate: '',
      receivedQuantity: 0,
    });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDeliveryLogs = useCallback(async () => {
    if (!isAuthenticated) {
      // No data when not authenticated
      setDeliveryLogs([]);
      setFilteredLogs([]);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      // Fetch from the actual API with authentication
      const apiLogs = await deliveryLogService.getAllDeliveryLogs();
      setDeliveryLogs(apiLogs);
      setFilteredLogs(apiLogs);
    } catch (apiError) {
      const errorMessage =
        apiError instanceof Error ? apiError.message : 'Unknown error';
      setApiError(errorMessage);

      // Set empty arrays on API failure
      setDeliveryLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load delivery logs on component mount and when authentication changes
  useEffect(() => {
    loadDeliveryLogs();
  }, [loadDeliveryLogs]);

  // Filter delivery logs by PO ID
  useEffect(() => {
    if (!poFilter) {
      setFilteredLogs(deliveryLogs);
    } else {
      const filtered = deliveryLogs.filter(
        log =>
          log.purchaseOrderId !== undefined &&
          log.purchaseOrderId.toString().includes(poFilter)
      );
      setFilteredLogs(filtered);
    }
  }, [poFilter, deliveryLogs]);

  const handleCreateDeliveryLog = async () => {
    if (
      !newDeliveryLog.poId ||
      !newDeliveryLog.receivedDate ||
      !newDeliveryLog.receivedQuantity
    ) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await deliveryLogService.logDelivery(newDeliveryLog);

      // Show success message from backend response
      setSuccessMessage(response.message);

      // Reload the delivery logs
      await loadDeliveryLogs();

      // Reset form
      setNewDeliveryLog({
        poId: 0,
        itemID: 0,
        receivedDate: '',
        receivedQuantity: 0,
      });

      setIsCreateSheetOpen(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Failed to create delivery log';
      setErrorMessage(errorMsg);

      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilter = () => {
    setPoFilter('');
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Delivery Logs</h1>
          <p className='text-muted-foreground'>
            Monitor recent shipment status and delivery progress
          </p>
        </div>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button disabled={!isAuthenticated || !canAccessSupplierService()}>
              <Plus className='mr-2 h-4 w-4' />
              New Delivery Log
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create Delivery Log</SheetTitle>
              <SheetDescription>
                Record a new delivery for a purchase order
              </SheetDescription>
            </SheetHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='poId'>Purchase Order ID</Label>
                <Input
                  id='poId'
                  type='number'
                  placeholder='Enter PO ID'
                  value={newDeliveryLog.poId || ''}
                  onChange={e =>
                    setNewDeliveryLog(prev => ({
                      ...prev,
                      poId: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='itemID'>Item ID</Label>
                <Input
                  id='itemID'
                  type='number'
                  placeholder='Enter Item ID'
                  value={newDeliveryLog.itemID || ''}
                  onChange={e =>
                    setNewDeliveryLog(prev => ({
                      ...prev,
                      itemID: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='receivedDate'>Received Date</Label>
                <Input
                  id='receivedDate'
                  type='date'
                  value={newDeliveryLog.receivedDate}
                  onChange={e =>
                    setNewDeliveryLog(prev => ({
                      ...prev,
                      receivedDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='receivedQuantity'>Received Quantity</Label>
                <Input
                  id='receivedQuantity'
                  type='number'
                  placeholder='Enter quantity received'
                  value={newDeliveryLog.receivedQuantity || ''}
                  onChange={e =>
                    setNewDeliveryLog(prev => ({
                      ...prev,
                      receivedQuantity: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handleCreateDeliveryLog}
                disabled={submitting}
                className='flex-1'
              >
                {submitting ? 'Creating...' : 'Create Delivery Log'}
              </Button>
              <Button
                variant='outline'
                onClick={() => setIsCreateSheetOpen(false)}
                className='flex-1'
              >
                Cancel
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertTitle className='text-green-800'>Success</AlertTitle>
          <AlertDescription className='text-green-700'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Authentication Status */}
      {!isAuthenticated && (
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 text-yellow-600' />
            <span className='text-yellow-800 font-medium'>
              Authentication Required
            </span>
          </div>
          <p className='text-yellow-700 text-sm mt-1'>
            Please log in to view and manage delivery logs.
          </p>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filter Delivery Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 items-end'>
            <div className='flex-1'>
              <Label htmlFor='po-filter'>Filter by Purchase Order ID</Label>
              <div className='relative mt-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  id='po-filter'
                  placeholder='Enter PO ID to filter...'
                  value={poFilter}
                  onChange={e => setPoFilter(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            {poFilter && (
              <Button variant='outline' onClick={clearFilter}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Logs</CardTitle>
          <CardDescription>
            {filteredLogs.length} of {deliveryLogs.length} delivery logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='text-lg'>Loading delivery logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className='text-center py-8'>
              <Truck className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                No delivery logs found
              </h3>
              <p className='text-muted-foreground mb-4'>
                {deliveryLogs.length === 0
                  ? 'No delivery logs have been recorded yet.'
                  : 'Try adjusting your filter criteria.'}
              </p>
              {deliveryLogs.length === 0 && (
                <Button
                  onClick={() => setIsCreateSheetOpen(true)}
                  disabled={!isAuthenticated || !canAccessSupplierService()}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Create First Delivery Log
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='font-semibold text-lg'>
                          Delivery #{log.id}
                        </h3>
                        <Badge variant='default'>Delivered</Badge>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-2'>
                          <Package className='h-4 w-4' />
                          <span>PO: {log.purchaseOrderId}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4' />
                          <span>
                            {new Date(log.receivedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Truck className='h-4 w-4' />
                          <span>Qty: {log.receivedQuantity}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Package className='h-4 w-4' />
                          <span>Item: {log.itemId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeliveryLogsPage() {
  return <DeliveryLogsPageContent />;
}
