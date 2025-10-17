'use client';

import CustomerDetailsModal from '@/components/customers/CustomerDetailsModal';
import CustomerFilters from '@/components/customers/CustomerFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserInfo,
  userService,
  UsersResponse,
} from '@/lib/services/userService';
import {
  Calendar,
  CheckCircle,
  Eye,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<UserInfo[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<UserInfo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    recentSignups: 0,
    thisMonthSignups: 0,
    verificationRate: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: UsersResponse = await userService.getUsersWithUserRole();

      if (response.success) {
        setCustomers(response.users);
        setFilteredCustomers(response.users);

        // Calculate stats
        const userStats = userService.getUserStats(response.users);
        setStats(userStats);
      } else {
        setError(response.message || 'Failed to fetch customers');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch customers'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: Record<string, unknown>) => {
    const filtered = userService.filterUsers(customers, filters);
    setFilteredCustomers(filtered);

    // Update stats for filtered customers
    const filteredStats = userService.getUserStats(filtered);
    setStats(filteredStats);
  };

  const handleViewCustomer = (customer: UserInfo) => {
    setSelectedCustomer(customer);
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
      case 'active':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'inactive':
        return <Badge className='bg-gray-100 text-gray-800'>Inactive</Badge>;
      case 'suspended':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
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
              Customer Management
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
                  onClick={fetchCustomers}
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
                Customer Management
              </h1>
              <p className='text-sm mt-1 text-white/85'>
                Manage customers and view their account details
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={fetchCustomers}
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
                New Customer
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
                Total Customers
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
                {stats.totalUsers}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                {filteredCustomers.length !== customers.length
                  ? `${filteredCustomers.length} filtered`
                  : 'All customers'}
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
                Active Customers
              </CardTitle>
              <UserCheck
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                {stats.activeUsers}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of
                total
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
                Verified Emails
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
                {stats.verifiedUsers}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                {stats.verificationRate.toFixed(1)}% verification rate
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
                This Month
              </CardTitle>
              <Calendar
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                {stats.thisMonthSignups}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                New signups
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
                Recent Signups
              </CardTitle>
              <User
                className='h-4 w-4'
                style={{ color: CustomerColors.textSecondary }}
              />
            </CardHeader>
            <CardContent>
              <div
                className='text-2xl font-bold'
                style={{ color: CustomerColors.textPrimary }}
              >
                {stats.recentSignups}
              </div>
              <p
                className='text-xs'
                style={{ color: CustomerColors.textSecondary }}
              >
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <CustomerFilters
          onFiltersChange={handleFiltersChange}
          onRefresh={fetchCustomers}
          isLoading={loading}
        />

        {/* Customers Table */}
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
              Customers ({filteredCustomers.length})
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
            ) : filteredCustomers.length === 0 ? (
              <div className='text-center py-8'>
                <User
                  className='mx-auto h-12 w-12'
                  style={{ color: CustomerColors.textSecondary }}
                />
                <h3
                  className='mt-2 text-sm font-semibold'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  No customers found
                </h3>
                <p
                  className='mt-1 text-sm'
                  style={{ color: CustomerColors.textSecondary }}
                >
                  {customers.length === 0
                    ? 'No customers have signed up yet.'
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
                        Customer ID
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Name
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Email
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Phone
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
                        Verified
                      </th>
                      <th
                        className='py-3 px-4 text-left font-medium'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        Joined
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
                    {filteredCustomers.map(customer => (
                      <tr
                        key={customer.id}
                        className='border-b hover:bg-gray-50 transition-colors'
                        style={{ borderColor: CustomerColors.borderDefault }}
                      >
                        <td
                          className='py-3 px-4 font-medium'
                          style={{ color: CustomerColors.textPrimary }}
                        >
                          #{customer.id}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
                              {customer.profileImageUrl ? (
                                <Image
                                  src={customer.profileImageUrl}
                                  alt={customer.fullName}
                                  width={32}
                                  height={32}
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <User
                                  className='h-4 w-4'
                                  style={{
                                    color: CustomerColors.textSecondary,
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <p
                                className='font-medium'
                                style={{ color: CustomerColors.textPrimary }}
                              >
                                {customer.fullName}
                              </p>
                              <p
                                className='text-xs'
                                style={{ color: CustomerColors.textSecondary }}
                              >
                                @{customer.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className='py-3 px-4'
                          style={{ color: CustomerColors.textSecondary }}
                        >
                          {customer.email}
                        </td>
                        <td
                          className='py-3 px-4'
                          style={{ color: CustomerColors.textSecondary }}
                        >
                          {customer.phoneNumber || 'N/A'}
                        </td>
                        <td className='py-3 px-4'>
                          {getStatusBadge(customer.accountStatus || 'ACTIVE')}
                        </td>
                        <td className='py-3 px-4'>
                          {customer.emailVerified ? (
                            <Badge className='bg-green-100 text-green-800'>
                              <CheckCircle className='w-3 h-3 mr-1' />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant='outline'>No</Badge>
                          )}
                        </td>
                        <td
                          className='py-3 px-4'
                          style={{ color: CustomerColors.textSecondary }}
                        >
                          {formatDate(
                            customer.createdAt || new Date().toISOString()
                          )}
                        </td>
                        <td className='py-3 px-4'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewCustomer(customer)}
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
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      </div>
    </div>
  );
}
