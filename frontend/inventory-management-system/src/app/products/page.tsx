'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/services/productService';
import { Product } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log("fetching")
    fetchProducts();
    console.log("products", products);
  }, []);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await productService.getAllProducts();
      console.log("Fetched products:", fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      console.log("Deleting product with id:", id);
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  const handleEditProduct = (id: string) => {
    // TODO: Implement edit functionality
    console.log(`Editing product with id: ${id}`);
  };

  return (
    <div className="space-y-4 p-4">
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
              onEdit={() => handleEditProduct(product.id)}
              onDelete={() => handleDeleteProduct(Number(product.id))}
              barcode={product.barcode || 'N/A'}
            />
          ))
        )}
      </div>
    </div>
  );
}