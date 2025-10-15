'use client';

import DiscountAnalytics from '@/components/promotions/DiscountAnalytics';
import DiscountForm from '@/components/promotions/DiscountForm';
import DiscountProductsList from '@/components/promotions/DiscountProductsList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { discountService } from '@/lib/services/discountService';
import { Discount, DiscountsResponse } from '@/lib/types/discount';
import {
  AlertCircle,
  BarChart3,
  Edit,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PromotionsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: DiscountsResponse = await discountService.getAllDiscounts(
        currentPage,
        pageSize
      );
      setDiscounts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      setError(
        'Failed to fetch discounts. Please check your connection and try again.'
      );
      setDiscounts([]); // Ensure discounts is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async (discountId: number) => {
    try {
      await discountService.deleteDiscount(discountId);
      toast.success('Discount deleted successfully.');
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount. Please try again.');
    }
  };

  const handleCreateDiscount = () => {
    setSelectedDiscount(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsEditDialogOpen(true);
  };

  const handleViewAnalytics = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsAnalyticsDialogOpen(true);
  };

  const handleViewProducts = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsProductsDialogOpen(true);
  };

  const handleDiscountSaved = () => {
    fetchDiscounts();
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedDiscount(null);
  };

  const filteredDiscounts = (discounts || []).filter(
    discount =>
      discount.discountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.discountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    });
  };

  const getDiscountTypeColor = (type: string) => {
    return type === 'BILL_DISCOUNT'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Promotions & Discounts
          </h1>
          <p className='text-muted-foreground'>
            Manage discount codes and promotional campaigns
          </p>
        </div>
        <Button
          className='bg-primary hover:bg-primary/90'
          onClick={handleCreateDiscount}
        >
          <Plus className='mr-2 h-4 w-4' />
          Create Discount
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Discounts
            </CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalElements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Discounts
            </CardTitle>
            <Badge variant='secondary' className='bg-green-100 text-green-800'>
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {discounts.filter(d => d.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Usage</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {discounts.reduce((sum, d) => sum + (d.totalUsageCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center space-x-2 text-red-800'>
              <AlertCircle className='h-4 w-4' />
              <span>{error}</span>
            </div>
            <Button
              onClick={fetchDiscounts}
              variant='outline'
              size='sm'
              className='mt-3'
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Management</CardTitle>
          <CardDescription>
            View, create, edit, and manage all discount codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className='flex items-center space-x-2 mb-6'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search discounts...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              Filter
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <p className='mt-4 text-muted-foreground'>Loading discounts...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && discounts.length === 0 && (
            <div className='text-center py-12'>
              <BarChart3 className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-4 text-lg font-semibold'>No discounts found</h3>
              <p className='mt-2 text-muted-foreground'>
                Get started by creating your first promotional campaign.
              </p>
              <Button className='mt-4' onClick={handleCreateDiscount}>
                <Plus className='mr-2 h-4 w-4' />
                Create Your First Discount
              </Button>
            </div>
          )}

          {/* Discounts Table */}
          {!loading && !error && filteredDiscounts.length > 0 && (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscounts.map(discount => (
                    <TableRow key={discount.id}>
                      <TableCell className='font-medium'>
                        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                          {discount.discountCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {discount.discountName}
                          </div>
                          <div className='text-sm text-muted-foreground truncate max-w-[200px]'>
                            {discount.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={getDiscountTypeColor(discount.type)}
                        >
                          {discount.type === 'BILL_DISCOUNT'
                            ? 'Bill Discount'
                            : 'Product Discount'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>
                          {discount.isPercentage
                            ? `${discount.discountValue}%`
                            : formatCurrency(discount.discountValue)}
                        </div>
                        {discount.minOrderAmount && (
                          <div className='text-sm text-muted-foreground'>
                            Min: {formatCurrency(discount.minOrderAmount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={getStatusColor(discount.status)}
                        >
                          {discount.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <div>{formatDate(discount.validFrom)}</div>
                          <div className='text-muted-foreground'>
                            to {formatDate(discount.validTo)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <div className='font-medium'>
                            {discount.totalUsageCount || 0} uses
                          </div>
                          <div className='text-muted-foreground'>
                            {discount.uniqueUsersCount || 0} users
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            title='Edit Discount'
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            title='View Analytics'
                            onClick={() => handleViewAnalytics(discount)}
                          >
                            <BarChart3 className='h-4 w-4' />
                          </Button>
                          {discount.type === 'PRODUCT_DISCOUNT' && (
                            <Button
                              variant='outline'
                              size='sm'
                              title='View Products'
                              onClick={() => handleViewProducts(discount)}
                            >
                              <Package className='h-4 w-4' />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                title='Delete Discount'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Discount
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the discount
                                  &quot;{discount.discountCode}&quot;? This
                                  action cannot be undone and will affect any
                                  ongoing campaigns.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteDiscount(discount.id!)
                                  }
                                  className='bg-red-600 hover:bg-red-700'
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className='flex items-center justify-between space-x-2 py-4'>
              <div className='text-sm text-muted-foreground'>
                Showing {currentPage * pageSize + 1} to{' '}
                {Math.min((currentPage + 1) * pageSize, totalElements)} of{' '}
                {totalElements} results
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className='text-sm text-muted-foreground'>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Discount Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create New Discount</DialogTitle>
            <DialogDescription>
              Create a new discount code or promotional campaign with full
              configuration options.
            </DialogDescription>
          </DialogHeader>
          <DiscountForm
            onSave={handleDiscountSaved}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Discount Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>
              Update the discount configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <DiscountForm
            discount={selectedDiscount}
            onSave={handleDiscountSaved}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={isAnalyticsDialogOpen}
        onOpenChange={setIsAnalyticsDialogOpen}
      >
        <DialogContent className='max-w-7xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Discount Analytics</DialogTitle>
            <DialogDescription>
              Comprehensive usage statistics and analytics for this discount
              campaign.
            </DialogDescription>
          </DialogHeader>
          {selectedDiscount && (
            <DiscountAnalytics
              discount={selectedDiscount}
              onClose={() => setIsAnalyticsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Products Dialog */}
      <Dialog
        open={isProductsDialogOpen}
        onOpenChange={setIsProductsDialogOpen}
      >
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Associated Products</DialogTitle>
            <DialogDescription>
              Products included in this discount campaign:{' '}
              {selectedDiscount?.discountName}
            </DialogDescription>
          </DialogHeader>
          {selectedDiscount && (
            <DiscountProductsList
              discountId={selectedDiscount.id!}
              onClose={() => setIsProductsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
