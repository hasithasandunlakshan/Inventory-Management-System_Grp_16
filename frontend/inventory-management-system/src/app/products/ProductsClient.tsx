'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productService } from '@/lib/services/productService';
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

// Custom pagination component
const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className='flex items-center justify-center space-x-2'>
    <Button
      variant='outline'
      onClick={() => onPageChange(Math.max(0, currentPage - 1))}
      disabled={currentPage === 0}
    >
      Previous
    </Button>

    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      let pageNum;
      if (totalPages <= 5) {
        pageNum = i;
      } else if (currentPage < 3) {
        pageNum = i;
      } else if (currentPage > totalPages - 4) {
        pageNum = totalPages - 5 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      return (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? 'default' : 'outline'}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum + 1}
        </Button>
      );
    })}

    <Button
      variant='outline'
      onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
      disabled={currentPage === totalPages - 1}
    >
      Next
    </Button>
  </div>
);

interface ProductsClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialTotalElements: number;
  initialTotalPages: number;
  initialCurrentPage: number;
  initialPageSize: number;
  initialSortBy: string;
  initialSortDir: string;
  initialSelectedCategory: number | null;
}

export default function ProductsClient({
  initialProducts,
  initialCategories,
  initialTotalElements,
  initialTotalPages,
  initialCurrentPage,
  initialPageSize,
  initialSortBy,
  initialSortDir,
  initialSelectedCategory,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialSelectedCategory
  );
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(initialTotalElements);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);

  // Update URL when state changes
  const updateURL = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  const handleSortChange = (newSortBy: string) => {
    let newSortDir = sortDir;
    if (sortBy === newSortBy) {
      newSortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      newSortDir = 'asc';
    }

    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setCurrentPage(0);
    updateURL({ sortBy: newSortBy, sortDir: newSortDir, page: 0 });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
    updateURL({ size: newPageSize, page: 0 });
  };

  const handleCategoryFilter = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategory(null);
      setCurrentPage(0);
      updateURL({ category: '', page: 0 });
    } else {
      setSelectedCategory(parseInt(categoryId));
      setCurrentPage(0);
      updateURL({ category: categoryId, page: 0 });
    }
  };

  // Fetch new data when URL changes (for client-side navigation)
  useEffect(() => {
    const fetchNewData = async () => {
      if (loading) return;

      setLoading(true);
      try {
        const response = await productService.getAllProductsWithCategories(
          currentPage,
          pageSize,
          sortBy,
          sortDir
        );

        setProducts(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we're not using initial data
    if (
      currentPage !== initialCurrentPage ||
      pageSize !== initialPageSize ||
      sortBy !== initialSortBy ||
      sortDir !== initialSortDir
    ) {
      fetchNewData();
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    initialCurrentPage,
    initialPageSize,
    initialSortBy,
    initialSortDir,
    loading,
  ]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='space-y-6'>
      {/* Filters and Sorting */}
      <div className='flex flex-wrap items-center gap-4'>
        {/* Category Filter */}
        <div className='flex items-center space-x-2'>
          <h2 className='text-lg font-semibold'>Filter by Category:</h2>
          <Select
            onValueChange={handleCategoryFilter}
            value={selectedCategory?.toString() || 'all'}
          >
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
        </div>

        {/* Sort Options */}
        <div className='flex items-center space-x-2'>
          <h2 className='text-lg font-semibold'>Sort by:</h2>
          <Select onValueChange={handleSortChange} value={sortBy}>
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='id'>ID</SelectItem>
              <SelectItem value='name'>Name</SelectItem>
              <SelectItem value='price'>Price</SelectItem>
              <SelectItem value='stock'>Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            onClick={() => handleSortChange(sortBy)}
            className='px-3'
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        {/* Page Size */}
        <div className='flex items-center space-x-2'>
          <h2 className='text-lg font-semibold'>Items per page:</h2>
          <Select
            onValueChange={value => handlePageSizeChange(parseInt(value))}
            value={pageSize.toString()}
          >
            <SelectTrigger className='w-[100px]'>
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='6'>6</SelectItem>
              <SelectItem value='12'>12</SelectItem>
              <SelectItem value='24'>24</SelectItem>
              <SelectItem value='48'>48</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              stock={product.stock}
              availableStock={product.availableStock}
              reserved={product.reserved}
              imageUrl={product.imageUrl || ''}
              barcode={product.barcode || 'N/A'}
              categoryName={product.categoryName}
              minThreshold={product.minThreshold}
              showActions={true}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-8'>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Results Info */}
      <div className='text-center text-sm text-gray-600'>
        Showing {products.length} of {totalElements} products
        {totalPages > 1 && ` (Page ${currentPage + 1} of ${totalPages})`}
      </div>
    </div>
  );
}
