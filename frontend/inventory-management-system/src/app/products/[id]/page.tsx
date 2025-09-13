'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/lib/services/productService';
import { Product } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import ProductDetails from '@/components/product/ProductDetails';
import LoadingScreen from '@/components/ui/loading';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProduct = await productService.getProductById(
        parseInt(productId)
      );
      setProduct(fetchedProduct);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleBack = () => {
    router.push('/products');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !product) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Product Not Found
          </h2>
          <p className='text-gray-600 mb-4'>
            {error || 'The product you are looking for does not exist.'}
          </p>
          <Button
            onClick={handleBack}
            className='bg-gray-600 hover:bg-gray-700'
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetails product={product} onBack={handleBack} />;
}
