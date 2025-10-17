'use client';

import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import OrderFilters from '@/components/orders/OrderFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Order,
  orderService,
  OrdersResponse,
} from '@/lib/services/orderService';
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

// Color scheme from dashboard
const CustomerColors = {
  brandBlue: '#2A7CC7',
  brandDark: '#072033ff',
  brandMedium: '#245e91ff',
  accentBlue: '#6366F1',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  bgPage: '#F8FAFC',
  bgCard: '#FFFFFF',
  borderDefault: '#E2E8F0',
};

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
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await orderService.getAllOrders(
        currentPage,
        pageSize
      )) as OrdersResponse;

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
      <div
        className='min-h-screen p-6'
        style={{ backgroundColor: CustomerColors.bgPage }}
      >
        <div className='space-y-6'>
          <div
            className='w-full mb-8 rounded-2xl overflow-hidden p-6'
            style={{
              background: `linear-gradient(135deg, ${CustomerColors.brandBlue} 0%, ${CustomerColors.brandMedium} 100%)`,
              boxShadow:
                '0 10px 25px -5px rgba(42, 124, 199, 0.3), 0 8px 10px -6px rgba(42, 124, 199, 0.2)',
            }}
          >
            <h1 className='text-2xl font-bold tracking-tight text-white'>
              Order Management
            </h1>
          </div>
          <Card
            className='border-0'
            style={{
              backgroundColor: CustomerColors.bgCard,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent className='p-6'>
              <div className='text-center'>
                <p className='text-red-600 mb-4'>Error: {error}</p>
                <Button
                  onClick={fetchOrders}
                  style={{
                    background: `linear-gradient(135deg, ${CustomerColors.brandBlue} 0%, ${CustomerColors.brandMedium} 100%)`,
                    color: 'white',
                  }}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen p-6'
      style={{ backgroundColor: CustomerColors.bgPage }}
    >
      <div className='space-y-6'>
        {/* Header Section */}
        <div
          className='w-full mb-8 rounded-2xl overflow-hidden transition-all duration-500'
          style={{
            background: `linear-gradient(135deg, ${CustomerColors.brandBlue} 0%, ${CustomerColors.brandMedium} 100%)`,
            boxShadow:
              '0 10px 25px -5px rgba(42, 124, 199, 0.3), 0 8px 10px -6px rgba(42, 124, 199, 0.2)',
          }}
        >
          <div className='px-6 pt-6 pb-4 flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-white'>
                Order Management
              </h1>
              <p className='text-sm mt-1 text-white/85'>
                Manage customer orders and track sales performance
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={fetchOrders}
                disabled={loading}
                style={{
                  backgroundColor: 'white',
                  color: CustomerColors.brandBlue,
                  border: 'none',
                }}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button
                style={{
                  backgroundColor: 'white',
                  color: CustomerColors.brandBlue,
                }}
              >
                New Order
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
          <Card
            className='border-0'
            style={{
              backgroundColor: CustomerColors.bgCard,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle
                className='text-sm font-medium'
                style={{ color: CustomerColors.textSecondary }}
              >
                Total Orders
              </CardTitle>
              <Package
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                {stats.totalOrders}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                {filteredOrders.length !== orders.length
                  ? `${filteredOrders.length} filtered`
                  : 'All orders'}
              </p>
            </CardContent>
          </Card>

          <Card
            className='border-0'
            style={{
              backgroundColor: CustomerColors.bgCard,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle
                className='text-sm font-medium'
                style={{ color: CustomerColors.textSecondary }}
              >
                Confirmed Orders
              </CardTitle>
              <CheckCircle
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                {stats.confirmedOrders}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                {((stats.confirmedOrders / stats.totalOrders) * 100).toFixed(1)}
                % confirmation rate
              </p>
            </CardContent>
          </Card>

          <Card
            className='border-0'
            style={{
              backgroundColor: CustomerColors.bgCard,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle
                className='text-sm font-medium'
                style={{ color: CustomerColors.textSecondary }}
              >
                Total Revenue
              </CardTitle>
              <DollarSign
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                From all orders
              </p>
            </CardContent>
          </Card>

          <Card
            className='border-0'
            style={{
              backgroundColor: CustomerColors.bgCard,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle
                className='text-sm font-medium'
                style={{ color: CustomerColors.textSecondary }}
              >
                Avg Order Value
              </CardTitle>
              <TrendingUp
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                ${stats.averageOrderValue.toFixed(2)}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card
            className='border-0'
            style={{
              backgroundColor: CustomerColors.bgCard,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle
                className='text-sm font-medium'
                style={{ color: CustomerColors.textSecondary }}
              >
                Unique Customers
              </CardTitle>
              <Users
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                {stats.uniqueCustomers}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                Active customers
              </p>
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
        <Card
          className='border-0'
          style={{
            backgroundColor: CustomerColors.bgCard,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle
              className='flex items-center justify-between'
              style={{ color: CustomerColors.textPrimary }}
            >
              Orders ({filteredOrders.length})
              {loading && (
                <div
                  className='animate-spin rounded-full h-4 w-4 border-b-2'
                  style={{ borderColor: CustomerColors.brandBlue }}
                ></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center h-64'>
                <div
                  className='animate-spin rounded-full h-8 w-8 border-b-2'
                  style={{ borderColor: CustomerColors.brandBlue }}
                ></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className='text-center py-8'>
                <Package
                  className='mx-auto h-12 w-12'
                  style={{ color: CustomerColors.textSecondary }}
                />
                <h3
                  className='mt-2 text-sm font-semibold'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  No orders found
                </h3>
                <p
                  className='mt-1 text-sm'
                  style={{ color: CustomerColors.textSecondary }}
                >
                  {orders.length === 0
                    ? 'No orders have been created yet.'
                    : 'Try adjusting your filters.'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm'>
                  <thead>
                    <tr
                      className='border-b'
                      style={{ borderColor: CustomerColors.borderDefault }}
                    >
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Order ID
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Customer ID
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Status
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Items
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Total Amount
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Order Date
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr
                        key={order.orderId}
                        className='border-b hover:bg-gray-50 transition-colors'
                        style={{ borderColor: CustomerColors.borderDefault }}
                      >
                        <td
                          className='py-3 px-4 font-medium'
                          style={{ color: CustomerColors.textPrimary }}
                        >
                          #{order.orderId}
                        </td>
                        <td
                          className='py-3 px-4'
                          style={{ color: CustomerColors.textSecondary }}
                        >
                          {order.customerId}
                        </td>
                        <td className='py-3 px-4'>
                          {getStatusBadge(order.status)}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-1'>
                            <ShoppingCart
                              className='h-4 w-4'
                              style={{ color: CustomerColors.textSecondary }}
                            />
                            <span
                              style={{ color: CustomerColors.textSecondary }}
                            >
                              {order.orderItems.length} items
                            </span>
                          </div>
                        </td>
                        <td
                          className='py-3 px-4 font-semibold'
                          style={{ color: CustomerColors.textPrimary }}
                        >
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td
                          className='py-3 px-4'
                          style={{ color: CustomerColors.textSecondary }}
                        >
                          {formatDate(order.orderDate)}
                        </td>
                        <td className='py-3 px-4'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewOrder(order)}
                            className='flex items-center gap-1'
                            style={{
                              borderColor: CustomerColors.brandBlue,
                              color: CustomerColors.brandBlue,
                            }}
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
              <div
                className='mt-6 flex items-center justify-between border-t pt-4'
                style={{ borderColor: CustomerColors.borderDefault }}
              >
                <div
                  className='text-sm'
                  style={{ color: CustomerColors.textSecondary }}
                >
                  Showing page {currentPage + 1} of {totalPages} ({totalOrders}{' '}
                  total orders)
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage(prev => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0 || loading}
                    style={{
                      borderColor: CustomerColors.borderDefault,
                      color: CustomerColors.textPrimary,
                    }}
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
                          style={
                            currentPage === pageNum
                              ? {
                                  background: `linear-gradient(135deg, ${CustomerColors.brandBlue} 0%, ${CustomerColors.brandMedium} 100%)`,
                                  color: 'white',
                                  border: 'none',
                                }
                              : {
                                  borderColor: CustomerColors.borderDefault,
                                  color: CustomerColors.textPrimary,
                                }
                          }
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
                    style={{
                      borderColor: CustomerColors.borderDefault,
                      color: CustomerColors.textPrimary,
                    }}
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
    </div>
  );
}
