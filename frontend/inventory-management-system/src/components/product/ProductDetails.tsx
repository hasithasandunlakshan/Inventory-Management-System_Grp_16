'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  DollarSign,
  Hash,
  ArrowLeft,
  Edit3,
  Eye,
  Tag,
  Info,
} from 'lucide-react';
import { productUtils } from '@/lib/utils/productUtils';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetails({
  product,
  onBack,
}: ProductDetailsProps) {
  const router = useRouter();

  const handleEdit = () => {
    productUtils.editProduct(product, router);
  };

  return (
    <div className='w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen'>
      <div className='w-full px-6 sm:px-8 lg:px-12 py-8'>
        {/* Header */}
        <div className='mb-12'>
          <Button
            onClick={onBack}
            variant='ghost'
            size='lg'
            className='mb-6 hover:bg-white/80 transition-all duration-200 text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='w-5 h-5 mr-3' />
            Back to Products
          </Button>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div className='flex-1'>
              <h1 className='text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight'>
                {product.name}
              </h1>
              <p className='text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl'>
                {product.description}
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12 max-w-none'>
          {/* Product Images Section */}
          <div className='xl:col-span-3 space-y-8'>
            {/* Main Product Image */}
            <Card className='overflow-hidden shadow-2xl border-0'>
              <CardContent className='p-0'>
                {product.imageUrl ? (
                  <div className='relative h-[500px] lg:h-[600px] w-full'>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw'
                      priority
                    />
                  </div>
                ) : (
                  <div className='h-[500px] lg:h-[600px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                    <div className='text-center'>
                      <Package className='w-20 h-20 text-gray-400 mx-auto mb-6' />
                      <p className='text-gray-500 text-xl'>
                        No image available
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Barcode Image */}
            {product.barcodeImageUrl && (
              <Card className='shadow-xl border-0'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center text-2xl font-bold'>
                    <Hash className='w-6 h-6 mr-3 text-gray-600' />
                    Product Barcode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='relative h-40 w-full bg-white rounded-xl border-2 border-gray-100'>
                    <Image
                      src={product.barcodeImageUrl}
                      alt={`Barcode for ${product.name}`}
                      fill
                      className='object-contain p-6'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw'
                    />
                  </div>
                  <p className='text-lg text-gray-600 mt-4 font-mono text-center bg-gray-50 p-3 rounded-lg'>
                    {product.barcode}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Information Section */}
          <div className='xl:col-span-2 space-y-8'>
            {/* Quick Stats */}
            <Card className='shadow-xl border-0'>
              <CardHeader className='pb-6'>
                <CardTitle className='flex items-center text-3xl font-bold'>
                  <Info className='w-7 h-7 mr-3 text-gray-600' />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-8'>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200'>
                    <DollarSign className='w-12 h-12 text-gray-600 mx-auto mb-4' />
                    <p className='text-4xl font-bold text-gray-700'>
                      ${product.price.toFixed(2)}
                    </p>
                    <p className='text-lg text-gray-600 font-medium'>Price</p>
                  </div>
                  <div className='text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200'>
                    <Package className='w-12 h-12 text-gray-600 mx-auto mb-4' />
                    <p className='text-4xl font-bold text-gray-700'>
                      {product.stock}
                    </p>
                    <p className='text-lg text-gray-600 font-medium'>Stock</p>
                  </div>
                </div>

                <div className='space-y-6'>
                  <div>
                    <label className='text-lg font-semibold text-gray-600 flex items-center mb-3'>
                      <Tag className='w-5 h-5 mr-2 text-gray-500' />
                      Product Name
                    </label>
                    <p className='text-2xl font-bold text-gray-900'>
                      {product.name}
                    </p>
                  </div>

                  <div>
                    <label className='text-lg font-semibold text-gray-600 flex items-center mb-3'>
                      <Info className='w-5 h-5 mr-2 text-gray-500' />
                      Description
                    </label>
                    <p className='text-lg text-gray-700 leading-relaxed'>
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <label className='text-lg font-semibold text-gray-600 flex items-center mb-3'>
                      <Hash className='w-5 h-5 mr-2 text-gray-500' />
                      Barcode
                    </label>
                    <p className='font-mono text-xl text-gray-800 bg-gray-50 p-4 rounded-xl border-2 border-gray-200'>
                      {product.barcode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className='shadow-xl border-0'>
              <CardContent className='pt-8'>
                <div className='space-y-4'>
                  <Button
                    onClick={handleEdit}
                    size='lg'
                    className='w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-white font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl'
                  >
                    <Edit3 className='w-6 h-6 mr-3' />
                    Edit Product
                  </Button>
                  <Button
                    variant='outline'
                    size='lg'
                    className='w-full border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 text-gray-700 font-semibold text-lg py-6 rounded-xl hover:border-gray-400'
                    onClick={onBack}
                  >
                    <Eye className='w-6 h-6 mr-3' />
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
