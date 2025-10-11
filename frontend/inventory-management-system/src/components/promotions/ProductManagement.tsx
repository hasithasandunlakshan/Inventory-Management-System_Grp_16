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
import { Input } from '@/components/ui/input';
import { discountService } from '@/lib/services/discountService';
import { Product } from '@/lib/types/discount';
import { cn } from '@/lib/utils';
import { Package, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProductManagementProps {
  discountId: number;
  onClose: () => void;
}

export default function ProductManagement({
  discountId,
  onClose,
}: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productList = await discountService.getAllProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.productId === product.productId);
      if (exists) {
        return prev.filter(p => p.productId !== product.productId);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const productIds = selectedProducts.map(p => p.productId);
      await discountService.addProductsToDiscount(discountId, { productIds });

      toast.success(`${selectedProducts.length} products added to discount.`);

      onClose();
    } catch (error) {
      console.error('Error saving product selection:', error);
      toast.error('Failed to add products to discount. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSelected = async () => {
    try {
      setSaving(true);
      const productIds = selectedProducts.map(p => p.productId);
      await discountService.removeProductsFromDiscount(discountId, {
        productIds,
      });

      toast.success(
        `${selectedProducts.length} products removed from discount.`
      );

      setSelectedProducts([]);
    } catch (error) {
      console.error('Error removing products:', error);
      toast.error('Failed to remove products from discount. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <span className='ml-3'>Loading products...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <h2 className='text-2xl font-bold'>Product Management</h2>
          <p className='text-muted-foreground'>
            Manage which products this discount applies to
          </p>
        </div>
        <Button variant='outline' onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Search className='mr-2 h-5 w-5' />
            Search Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by product name or barcode...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Selected Products ({selectedProducts.length})</span>
              <div className='space-x-2'>
                <Button size='sm' onClick={handleSave} disabled={saving}>
                  {saving ? 'Adding...' : 'Add to Discount'}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleRemoveSelected}
                  disabled={saving}
                >
                  Remove Selected
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {selectedProducts.map(product => (
                <Badge
                  key={product.productId}
                  variant='secondary'
                  className='flex items-center gap-2 px-3 py-1'
                >
                  <div className='flex flex-col text-left'>
                    <span className='font-medium'>{product.name}</span>
                    <span className='text-xs opacity-75'>
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <X
                    className='h-3 w-3 cursor-pointer hover:text-red-500'
                    onClick={() => handleProductToggle(product)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Products */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Click on products to select them for this discount
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className='text-center py-8'>
              <Package className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-4 text-lg font-semibold'>No products found</h3>
              <p className='mt-2 text-muted-foreground'>
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto'>
              {filteredProducts.map(product => {
                const isSelected = selectedProducts.some(
                  p => p.productId === product.productId
                );
                return (
                  <div
                    key={product.productId}
                    className={cn(
                      'border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => handleProductToggle(product)}
                  >
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={200}
                        height={96}
                        className='w-full h-24 object-cover rounded-md mb-3'
                      />
                    )}

                    <div className='space-y-2'>
                      <h4 className='font-medium text-sm line-clamp-2'>
                        {product.name}
                      </h4>

                      <div className='flex justify-between items-center text-xs'>
                        <span className='font-semibold text-green-600'>
                          {formatCurrency(product.price)}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {product.availableStock} in stock
                        </Badge>
                      </div>

                      {product.barcode && (
                        <div className='text-xs text-muted-foreground truncate'>
                          {product.barcode}
                        </div>
                      )}

                      {product.categoryName && (
                        <Badge variant='secondary' className='text-xs'>
                          {product.categoryName}
                        </Badge>
                      )}

                      {isSelected && (
                        <div className='flex items-center justify-center mt-2'>
                          <Badge className='bg-blue-500 text-white'>
                            ✓ Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className='flex justify-end space-x-3'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        {selectedProducts.length > 0 && (
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? 'Adding Products...'
              : `Add ${selectedProducts.length} Products to Discount`}
          </Button>
        )}
      </div>
    </div>
  );
}
