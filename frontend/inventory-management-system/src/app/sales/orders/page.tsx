'use client';

import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import OrderFilters from '@/components/orders/OrderFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, orderService, OrdersResponse } from '@/services/orderService';
import {
  CheckCircle,
  DollarSign,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    uniqueCustomers: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: OrdersResponse = await orderService.getAllOrders(
        currentPage,
        pageSize
      );

      if (response.success) {
        setOrders(response.orders);
        setFilteredOrders(response.orders);
        setTotalOrders(response.totalOrders);
        setTotalPages(response.pagination.totalPages);

        // Calculate stats
        const orderStats = orderService.getOrderStats(response.orders);
        setStats({
          ...orderStats,
          totalOrders: response.totalOrders, // Use total from API instead of current page
        });
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: Record<string, unknown>) => {
    const filtered = orderService.filterOrders(orders, filters);
    setFilteredOrders(filtered);

    // Update stats for filtered orders
    const filteredStats = orderService.getOrderStats(filtered);
    setStats(filteredStats);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className='bg-green-100 text-green-800'>Confirmed</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'cancelled':
        return <Badge className='bg-red-100 text-red-800'>Cancelled</Badge>;
      case 'processing':
        return <Badge className='bg-blue-100 text-blue-800'>Processing</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Order Management
          </h1>
        </div>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <p className='text-red-600 mb-4'>Error: {error}</p>
              <Button onClick={fetchOrders}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Order Management
          </h1>
          <p className='text-muted-foreground'>
            Manage customer orders and track sales performance
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={fetchOrders} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button>New Order</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalOrders}</div>
            <p className='text-xs text-muted-foreground'>
              {filteredOrders.length !== orders.length
                ? `${filteredOrders.length} filtered`
                : 'All orders'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Confirmed Orders
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.confirmedOrders}</div>
            <p className='text-xs text-muted-foreground'>
              {((stats.confirmedOrders / stats.totalOrders) * 100).toFixed(1)}%
              confirmation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className='text-xs text-muted-foreground'>From all orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg Order Value
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${stats.averageOrderValue.toFixed(2)}
            </div>
            <p className='text-xs text-muted-foreground'>Per order average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Unique Customers
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.uniqueCustomers}</div>
            <p className='text-xs text-muted-foreground'>Active customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrderFilters
        onFiltersChange={handleFiltersChange}
        onRefresh={fetchOrders}
        isLoading={loading}
      />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            Orders ({filteredOrders.length})
            {loading && (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className='text-center py-8'>
              <Package className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                No orders found
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {orders.length === 0
                  ? 'No orders have been created yet.'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='py-3 px-4 text-left font-medium'>
                      Order ID
                    </th>
                    <th className='py-3 px-4 text-left font-medium'>
                      Customer ID
                    </th>
                    <th className='py-3 px-4 text-left font-medium'>Status</th>
                    <th className='py-3 px-4 text-left font-medium'>Items</th>
                    <th className='py-3 px-4 text-left font-medium'>
                      Total Amount
                    </th>
                    <th className='py-3 px-4 text-left font-medium'>
                      Order Date
                    </th>
                    <th className='py-3 px-4 text-left font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr
                      key={order.orderId}
                      className='border-b hover:bg-gray-50'
                    >
                      <td className='py-3 px-4 font-medium'>
                        #{order.orderId}
                      </td>
                      <td className='py-3 px-4'>{order.customerId}</td>
                      <td className='py-3 px-4'>
                        {getStatusBadge(order.status)}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-1'>
                          <ShoppingCart className='h-4 w-4 text-gray-400' />
                          {order.orderItems.length} items
                        </div>
                      </td>
                      <td className='py-3 px-4 font-semibold'>
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className='py-3 px-4 text-gray-600'>
                        {formatDate(order.orderDate)}
                      </td>
                      <td className='py-3 px-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewOrder(order)}
                          className='flex items-center gap-1'
                        >
                          <Eye className='h-3 w-3' />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className='mt-6 flex items-center justify-between border-t pt-4'>
              <div className='text-sm text-gray-600'>
                Showing page {currentPage + 1} of {totalPages} ({totalOrders}{' '}
                total orders)
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0 || loading}
                >
                  Previous
                </Button>
                <div className='flex items-center gap-1'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className='w-10'
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onRefundSuccess={() => {
          fetchOrders(); // Refresh orders data after successful refund
        }}
      />
    </div>
  );
}
