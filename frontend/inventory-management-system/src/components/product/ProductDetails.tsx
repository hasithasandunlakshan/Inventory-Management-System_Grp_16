'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ArrowLeft,
  Edit,
  Tag,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { productUtils } from '@/lib/utils/product/productUtils';

interface ProductDetailsProps {
  readonly product: Product;
  readonly onBack: () => void;
}

export default function ProductDetails({
  product,
  onBack,
}: ProductDetailsProps) {
  const router = useRouter();

  const handleEdit = () => {
    productUtils.editProduct(product, router);
  };

  const getStockStatus = () => {
    const stock = product.availableStock || product.stock;
    if (stock === 0) {
      return {
        status: 'Out of Stock',
        color: 'destructive',
        icon: XCircle,
        textColor: 'text-red-600',
      };
    } else if (stock <= (product.minThreshold || 10)) {
      return {
        status: 'Low Stock',
        color: 'secondary',
        icon: AlertTriangle,
        textColor: 'text-orange-600',
      };
    } else {
      return {
        status: 'In Stock',
        color: 'default',
        icon: CheckCircle,
        textColor: 'text-green-600',
      };
    }
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant='ghost'
          size='sm'
          className='mb-4 hover:bg-gray-100'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Products
        </Button>

        {/* Product Details Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Images */}
          <div className='space-y-4'>
            {/* Main Product Image */}
            <Card className='overflow-hidden border'>
              <CardContent className='p-0'>
                {product.imageUrl ? (
                  <div className='relative h-[400px] lg:h-[500px] w-full bg-white'>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className='object-contain p-8 hover:scale-105 transition-transform duration-300'
                      sizes='(max-width: 768px) 100vw, 50vw'
                      priority
                    />
                  </div>
                ) : (
                  <div className='h-[400px] lg:h-[500px] bg-gray-100 flex items-center justify-center'>
                    <div className='text-center'>
                      <Package className='w-16 h-16 text-gray-300 mx-auto mb-3' />
                      <p className='text-gray-400 text-sm'>
                        No image available
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thumbnail Images (if you have multiple images in the future) */}
            {product.barcodeImageUrl && (
              <Card className='border'>
                <CardContent className='p-4'>
                  <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                    <Package className='w-4 h-4 mr-2' />
                    Product Barcode
                  </h3>
                  <div className='relative h-24 w-full bg-white rounded border'>
                    <Image
                      src={product.barcodeImageUrl}
                      alt={`Barcode for ${product.name}`}
                      fill
                      className='object-contain p-2'
                      sizes='(max-width: 768px) 100vw, 50vw'
                    />
                  </div>
                  <p className='text-xs text-gray-500 mt-2 font-mono text-center bg-gray-50 p-2 rounded'>
                    {product.barcode}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className='space-y-6'>
            {/* Category Badge */}
            {product.categoryName && (
              <Badge variant='secondary' className='text-xs'>
                <Tag className='w-3 h-3 mr-1' />
                {product.categoryName}
              </Badge>
            )}

            {/* Product Name */}
            <div>
              <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
                {product.name}
              </h1>
              <p className='text-gray-600 text-base leading-relaxed'>
                {product.description}
              </p>
            </div>

            <div className='border-t border-gray-200' />

            {/* Price */}
            <div>
              <p className='text-sm text-gray-500 mb-1'>Price</p>
              <div className='flex items-baseline gap-2'>
                <span className='text-4xl font-bold text-gray-900'>
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <p className='text-sm text-gray-500 mb-2'>Availability</p>
              <div className='flex items-center gap-2'>
                <StockIcon className={`w-5 h-5 ${stockStatus.textColor}`} />
                <span className={`font-semibold ${stockStatus.textColor}`}>
                  {stockStatus.status}
                </span>
                <span className='text-gray-500'>
                  ({product.availableStock || product.stock} units available)
                </span>
              </div>
            </div>

            <div className='border-t border-gray-200' />

            {/* Product Details */}
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Product Details
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-xs text-gray-500 mb-1'>Product ID</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    #{product.productId}
                  </p>
                </div>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-xs text-gray-500 mb-1'>Barcode</p>
                  <p className='text-sm font-mono font-semibold text-gray-900'>
                    {product.barcode}
                  </p>
                </div>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-xs text-gray-500 mb-1'>Total Stock</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {product.stock} units
                  </p>
                </div>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-xs text-gray-500 mb-1'>Reserved</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {product.reserved || 0} units
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className='bg-blue-50 border border-blue-100 rounded-lg p-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Truck className='w-5 h-5 text-blue-600' />
                  <span className='text-sm text-gray-700'>
                    Fast & Reliable Delivery
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <ShieldCheck className='w-5 h-5 text-blue-600' />
                  <span className='text-sm text-gray-700'>
                    Quality Guaranteed
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <RotateCcw className='w-5 h-5 text-blue-600' />
                  <span className='text-sm text-gray-700'>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='pt-4'>
              <Button
                onClick={handleEdit}
                size='lg'
                className='w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200'
              >
                <Edit className='w-5 h-5 mr-2' />
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
