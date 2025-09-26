'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Calendar,
  Eye,
  Users,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { userService, UserInfo, UsersResponse } from '@/services/userService';
import CustomerDetailsModal from '@/components/customers/CustomerDetailsModal';
import CustomerFilters from '@/components/customers/CustomerFilters';

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
      console.error('Error fetching customers:', err);
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
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Customer Management
          </h1>
        </div>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center'>
              <p className='text-red-600 mb-4'>Error: {error}</p>
              <Button onClick={fetchCustomers}>Retry</Button>
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
            Customer Management
          </h1>
          <p className='text-muted-foreground'>
            Manage customers and view their account details
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={fetchCustomers} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button>New Customer</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Customers
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalUsers}</div>
            <p className='text-xs text-muted-foreground'>
              {filteredCustomers.length !== customers.length
                ? `${filteredCustomers.length} filtered`
                : 'All customers'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Customers
            </CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeUsers}</div>
            <p className='text-xs text-muted-foreground'>
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Verified Emails
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.verifiedUsers}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.verificationRate.toFixed(1)}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>This Month</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.thisMonthSignups}</div>
            <p className='text-xs text-muted-foreground'>New signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Recent Signups
            </CardTitle>
            <User className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.recentSignups}</div>
            <p className='text-xs text-muted-foreground'>Last 7 days</p>
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
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            Customers ({filteredCustomers.length})
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
          ) : filteredCustomers.length === 0 ? (
            <div className='text-center py-8'>
              <User className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                No customers found
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {customers.length === 0
                  ? 'No customers have signed up yet.'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='py-3 px-4 text-left font-medium'>
                      Customer ID
                    </th>
                    <th className='py-3 px-4 text-left font-medium'>Name</th>
                    <th className='py-3 px-4 text-left font-medium'>Email</th>
                    <th className='py-3 px-4 text-left font-medium'>Phone</th>
                    <th className='py-3 px-4 text-left font-medium'>Status</th>
                    <th className='py-3 px-4 text-left font-medium'>
                      Verified
                    </th>
                    <th className='py-3 px-4 text-left font-medium'>Joined</th>
                    <th className='py-3 px-4 text-left font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className='border-b hover:bg-gray-50'>
                      <td className='py-3 px-4 font-medium'>#{customer.id}</td>
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
                              <User className='h-4 w-4 text-gray-400' />
                            )}
                          </div>
                          <div>
                            <p className='font-medium'>{customer.fullName}</p>
                            <p className='text-xs text-gray-500'>
                              @{customer.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='py-3 px-4'>{customer.email}</td>
                      <td className='py-3 px-4'>
                        {customer.phoneNumber || 'N/A'}
                      </td>
                      <td className='py-3 px-4'>
                        {getStatusBadge(customer.accountStatus)}
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
                      <td className='py-3 px-4 text-gray-600'>
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className='py-3 px-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewCustomer(customer)}
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
  );
}
