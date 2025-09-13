'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Package,
  Calendar,
  User,
  DollarSign,
  X,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderItem, orderService } from '@/services/orderService';
import { toast } from 'sonner';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRefundSuccess?: () => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onRefundSuccess,
}: OrderDetailsModalProps) {
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);

  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isEligibleForRefund = (status: string) => {
    const eligibleStatuses = ['confirmed', 'processed', 'shipped', 'delivered'];
    return eligibleStatuses.includes(status.toLowerCase());
  };

  const handleRefundSubmit = async () => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setIsProcessingRefund(true);
    try {
      const response = await orderService.processRefund({
        orderId: order.orderId,
        refundReason: refundReason.trim(),
      });

      if (response.success) {
        toast.success(
          `Refund processed successfully! Amount: $${response.refundAmount?.toFixed(2) || order.totalAmount.toFixed(2)}`
        );
        setShowRefundForm(false);
        setRefundReason('');
        if (onRefundSuccess) {
          onRefundSuccess();
        }
        onClose();
      } else {
        toast.error(response.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund. Please try again.');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const totalItems = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-bold'>
              Order Details #{order.orderId}
            </DialogTitle>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Order Summary */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Package className='h-4 w-4 text-blue-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Order ID</p>
                    <p className='font-semibold'>#{order.orderId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-green-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Customer ID</p>
                    <p className='font-semibold'>{order.customerId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <DollarSign className='h-4 w-4 text-yellow-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Total Amount</p>
                    <p className='font-semibold'>
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-purple-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Order Date</p>
                    <p className='font-semibold text-xs'>
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and Dates */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>Order Status</h3>
                <div className='flex items-center gap-2'>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  {isEligibleForRefund(order.status) && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowRefundForm(!showRefundForm)}
                      className='text-red-600 border-red-200 hover:bg-red-50'
                    >
                      <RefreshCw className='h-4 w-4 mr-1' />
                      Refund
                    </Button>
                  )}
                </div>
              </div>

              {showRefundForm && (
                <div className='mt-4 p-4 bg-red-50 rounded-lg border border-red-200'>
                  <h4 className='font-semibold text-red-800 mb-2'>
                    Process Refund
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-red-700 mb-1'>
                        Refund Reason
                      </label>
                      <Input
                        value={refundReason}
                        onChange={e => setRefundReason(e.target.value)}
                        placeholder='Enter reason for refund...'
                        className='border-red-200 focus:border-red-400'
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        onClick={handleRefundSubmit}
                        disabled={isProcessingRefund || !refundReason.trim()}
                        variant='destructive'
                        size='sm'
                      >
                        {isProcessingRefund ? (
                          <>
                            <RefreshCw className='h-4 w-4 mr-1 animate-spin' />
                            Processing...
                          </>
                        ) : (
                          'Confirm Refund'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRefundForm(false);
                          setRefundReason('');
                        }}
                        variant='outline'
                        size='sm'
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className='text-sm text-red-600'>
                      Refund amount:{' '}
                      <strong>${order.totalAmount.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div>
                  <p className='text-gray-500'>Created At</p>
                  <p className='font-medium'>{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className='text-gray-500'>Updated At</p>
                  <p className='font-medium'>{formatDate(order.updatedAt)}</p>
                </div>
                <div>
                  <p className='text-gray-500'>Total Items</p>
                  <p className='font-medium'>{totalItems} items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className='p-4'>
              <h3 className='text-lg font-semibold mb-4'>
                Order Items ({order.orderItems.length})
              </h3>
              <div className='space-y-4'>
                {order.orderItems.map((item: OrderItem) => (
                  <div key={item.orderItemId} className='border rounded-lg p-4'>
                    <div className='flex items-start space-x-4'>
                      {/* Product Image */}
                      <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden'>
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <Package className='h-6 w-6 text-gray-400' />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <h4 className='font-semibold text-lg'>
                              {item.productName}
                            </h4>
                            <div className='text-sm text-gray-500 space-y-1'>
                              <p>Product ID: {item.productId || 'N/A'}</p>
                              <p>Barcode: {item.barcode || 'N/A'}</p>
                              <p>Added: {formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold'>
                              ${item.price.toFixed(2)}
                            </p>
                            <p className='text-sm text-gray-500'>per unit</p>
                          </div>
                        </div>

                        <div className='mt-3 flex items-center justify-between'>
                          <div className='flex items-center space-x-4'>
                            <div className='bg-blue-50 px-3 py-1 rounded-full'>
                              <span className='text-sm font-medium text-blue-700'>
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-500'>Subtotal</p>
                            <p className='text-lg font-bold text-green-600'>
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className='mt-6 pt-4 border-t'>
                <div className='flex justify-between items-center'>
                  <div className='text-lg font-semibold'>Order Total:</div>
                  <div className='text-2xl font-bold text-green-600'>
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
