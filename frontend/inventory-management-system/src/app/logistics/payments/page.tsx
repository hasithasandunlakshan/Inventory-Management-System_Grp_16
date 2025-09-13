'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react';
import { paymentService, PaymentData } from '@/services/paymentService';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await paymentService.getAllPayments();

      if (response.success) {
        setPayments(response.payments);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch =
        searchQuery === '' ||
        payment.paymentId.toString().includes(searchQuery) ||
        payment.orderId?.toString().includes(searchQuery) ||
        payment.customerId?.toString().includes(searchQuery) ||
        payment.stripePaymentIntentId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        payment.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesMethod =
        methodFilter === 'all' ||
        payment.method.toLowerCase() === methodFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, statusFilter, methodFilter]);

  const stats = useMemo(() => {
    if (payments.length === 0) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        averagePayment: 0,
        statusGroups: {},
        methodGroups: {},
        recentPayments: 0,
        recentAmount: 0,
      };
    }
    return paymentService.calculatePaymentStats(payments);
  }, [payments]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'failed':
        return <XCircle className='h-4 w-4 text-red-600' />;
      case 'refunded':
        return <RefreshCw className='h-4 w-4 text-purple-600' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center space-x-2'>
          <RefreshCw className='h-6 w-6 animate-spin' />
          <span>Loading payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Payment Management
          </h1>
          <p className='text-muted-foreground'>
            Track and manage all payment transactions
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button onClick={fetchPayments} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2 text-red-800'>
              <XCircle className='h-5 w-5' />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Payments
            </CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalPayments}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.recentPayments} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Amount</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.totalAmount)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(stats.recentAmount)} recent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Payment
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.averagePayment)}
            </div>
            <p className='text-xs text-muted-foreground'>Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Success Rate</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.totalPayments > 0
                ? Math.round(
                    ((stats.statusGroups['PAID'] || 0) / stats.totalPayments) *
                      100
                  )
                : 0}
              %
            </div>
            <p className='text-xs text-muted-foreground'>
              Payment success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='search'>Search</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Search payments...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='paid'>Paid</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='failed'>Failed</SelectItem>
                  <SelectItem value='refunded'>Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='method'>Payment Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All methods' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Methods</SelectItem>
                  <SelectItem value='card'>Card</SelectItem>
                  <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                  <SelectItem value='digital_wallet'>Digital Wallet</SelectItem>
                  <SelectItem value='cash'>Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>&nbsp;</Label>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setMethodFilter('all');
                }}
              >
                <Filter className='h-4 w-4 mr-2' />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Transactions ({filteredPayments.length})
          </CardTitle>
          <CardDescription>
            Complete list of payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredPayments.length === 0 ? (
              <div className='text-center py-8'>
                <CreditCard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>No payments found</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-3 px-4 font-medium'>
                        Payment ID
                      </th>
                      <th className='text-left py-3 px-4 font-medium'>
                        Order ID
                      </th>
                      <th className='text-left py-3 px-4 font-medium'>
                        Customer
                      </th>
                      <th className='text-left py-3 px-4 font-medium'>
                        Amount
                      </th>
                      <th className='text-left py-3 px-4 font-medium'>
                        Method
                      </th>
                      <th className='text-left py-3 px-4 font-medium'>
                        Status
                      </th>
                      <th className='text-left py-3 px-4 font-medium'>Date</th>
                      <th className='text-left py-3 px-4 font-medium'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr
                        key={payment.paymentId}
                        className='border-b hover:bg-muted/50'
                      >
                        <td className='py-3 px-4'>
                          <span className='font-mono text-sm'>
                            #{payment.paymentId}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='font-mono text-sm'>
                            {payment.orderId ? `#${payment.orderId}` : 'N/A'}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center space-x-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            <span>{payment.customerId || 'N/A'}</span>
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='font-semibold'>
                            {formatCurrency(payment.amount)}
                          </span>
                          <div className='text-xs text-muted-foreground'>
                            {payment.currency}
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='capitalize'>{payment.method}</span>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(payment.status)}
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-muted-foreground' />
                            <span className='text-sm'>
                              {formatDate(payment.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <Button variant='ghost' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
