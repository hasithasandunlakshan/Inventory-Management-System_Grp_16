'use client';

import Image from 'next/image';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { discountService } from '@/lib/services/discountService';
import { DiscountProductsResponse } from '@/lib/types/discount';
import { format } from 'date-fns';
import { Package, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DiscountProductsListProps {
  discountId: number;
  onClose: () => void;
}

export default function DiscountProductsList({
  discountId,
  onClose,
}: DiscountProductsListProps) {
  const [productsData, setProductsData] =
    useState<DiscountProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discountService.getDiscountProducts(discountId);
      setProductsData(data);
    } catch (error) {
      setError('Failed to load products');
      toast.error('Failed to load associated products');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (loading) {
    return (
      <div className='text-center py-8'>
        <Package className='mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse' />
        <p className='text-gray-600'>Loading associated products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <Package className='mx-auto h-12 w-12 text-gray-400 mb-4' />
        <p className='text-gray-600 mb-4'>{error}</p>
        <Button onClick={fetchProducts} variant='outline'>
          Try Again
        </Button>
      </div>
    );
  }

  if (!productsData || productsData.products.length === 0) {
    return (
      <div className='text-center py-8'>
        <Package className='mx-auto h-12 w-12 text-gray-400 mb-4' />
        <p className='text-gray-600'>
          No products associated with this discount
        </p>
      </div>
    );
  }

  const validProducts = productsData.products.filter(
    product => product.productName !== 'Product not found'
  );

  return (
    <div className='space-y-6'>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Package className='h-5 w-5' />
            <span>Discount Summary</span>
          </CardTitle>
          <CardDescription>{productsData.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Discount Code</p>
              <p className='text-lg font-semibold'>
                {productsData.discountCode}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>Type</p>
              <Badge variant='outline'>{productsData.discountType}</Badge>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Products
              </p>
              <p className='text-lg font-semibold'>
                {productsData.totalProducts}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Valid Products
              </p>
              <p className='text-lg font-semibold'>{validProducts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Associated Products</CardTitle>
          <CardDescription>
            Products that are eligible for this discount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsData.products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.productName}
                          width={40}
                          height={40}
                          className='h-10 w-10 object-cover rounded'
                        />
                      ) : (
                        <div className='h-10 w-10 bg-gray-200 rounded flex items-center justify-center'>
                          <Package className='h-5 w-5 text-gray-400' />
                        </div>
                      )}
                      <div>
                        <p className='font-medium'>{product.productName}</p>
                        {product.description && (
                          <p className='text-sm text-gray-600 truncate max-w-xs'>
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    {product.category ? `Category ${product.category}` : 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(product.addedAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.productName === 'Product not found'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {product.productName === 'Product not found'
                        ? 'Invalid'
                        : 'Active'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={onClose}>
          <X className='h-4 w-4 mr-2' />
          Close
        </Button>
      </div>
    </div>
  );
}
