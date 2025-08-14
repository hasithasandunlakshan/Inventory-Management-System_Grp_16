'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/services/productService';
import { Product } from '@/lib/types/product';
import ProductCard from '@/components/product/ProductCard';
import LoadingScreen from '@/components/ui/loading';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No products available
          </p>
        ) : (
          products.map((product, index) => (
            <ProductCard 
              key={product.id || index}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              stock={product.stock}
              imageUrl={product.imageUrl || ''}
              barcode={product.barcode || 'N/A'}
            />
          ))
        )}
      </div>
    </div>
  );
}