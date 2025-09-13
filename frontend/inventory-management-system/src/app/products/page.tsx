'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/services/productService';
import { categoryService } from '@/lib/services/categoryService';
import { Product, Category } from '@/lib/types/product';
import ProductCard from '@/components/product/ProductCard';
import LoadingScreen from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts =
        await productService.getAllProductsWithCategories();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleCategoryFilter = async (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategory(null);
      await fetchProducts();
    } else {
      setSelectedCategory(parseInt(categoryId));
      try {
        setLoading(true);
        const filteredProducts = await productService.getProductsByCategory(
          parseInt(categoryId)
        );
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Failed to fetch products by category', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='space-y-6'>
      {/* Category Filter */}
      <div className='flex items-center space-x-4'>
        <h2 className='text-lg font-semibold'>Filter by Category:</h2>
        <Select onValueChange={handleCategoryFilter}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='All Categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          onClick={() => {
            setSelectedCategory(null);
            fetchProducts();
          }}
        >
          Clear Filter
        </Button>
      </div>

      {/* Products Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {products.length === 0 ? (
          <p className='col-span-full text-center text-gray-500'>
            {selectedCategory
              ? 'No products found in this category'
              : 'No products available'}
          </p>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={product.productId || index}
              id={product.productId}
              name={product.name}
              description={product.description}
              price={product.price}
              stock={product.availableStock}
              imageUrl={product.imageUrl || ''}
              barcode={product.barcode || 'N/A'}
              categoryName={product.categoryName}
            />
          ))
        )}
      </div>
    </div>
  );
}
