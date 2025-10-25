'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productService } from '@/lib/services/productService';
import { Product, Category } from '@/lib/types/product';
import ProductCard from '@/components/product/ProductCard';
import LoadingScreen from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Filter } from 'lucide-react';

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

  // Ensure we always have arrays, even if props are undefined
  const [products, setProducts] = useState<Product[]>(
    Array.isArray(initialProducts) ? initialProducts : []
  );
  const [categories] = useState<Category[]>(
    Array.isArray(initialCategories) ? initialCategories : []
  );

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
  const [searchQuery, setSearchQuery] = useState('');

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

        // Ensure we have valid data before updating state
        if (response && Array.isArray(response.content)) {
          setProducts(response.content);
          setTotalElements(response.totalElements || 0);
          setTotalPages(response.totalPages || 0);
        } else {
          setProducts([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } catch {
        // Set empty arrays on error to prevent map errors
        setProducts([]);
        setTotalElements(0);
        setTotalPages(0);
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

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.barcode?.toLowerCase().includes(query) ||
      product.categoryName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className='space-y-6'>
      {/* Controls Card */}
      <Card
        className='shadow-lg border-0'
        style={{
          background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
        }}
      >
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {/* Top Row: Search and Add Product Button */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5' />
                <Input
                  type='text'
                  placeholder='Search products by name, description, barcode...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 h-11 bg-white/95 border-white/20 focus:bg-white placeholder:text-gray-400'
                />
              </div>
              <Button
                onClick={() => router.push('/products/add')}
                className='h-11 px-6 font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200'
              >
                <Plus className='h-5 w-5 mr-2' />
                Add Product
              </Button>
            </div>

            {/* Bottom Row: Filters */}
            <div className='flex flex-wrap items-center gap-4 pt-2 border-t border-white/20'>
              <Filter className='h-5 w-5 text-white/80' />

              {/* Category Filter */}
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium text-white'>
                  Category:
                </span>
                <Select
                  onValueChange={handleCategoryFilter}
                  value={selectedCategory?.toString() || 'all'}
                >
                  <SelectTrigger className='w-[180px] h-10 bg-white/95 border-white/20 hover:bg-white'>
                    <SelectValue placeholder='All Categories' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium text-white'>Sort by:</span>
                <Select onValueChange={handleSortChange} value={sortBy}>
                  <SelectTrigger className='w-[130px] h-10 bg-white/95 border-white/20 hover:bg-white'>
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='name'>Name</SelectItem>
                    <SelectItem value='price'>Price</SelectItem>
                    <SelectItem value='stock'>Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  onClick={() => handleSortChange(sortBy)}
                  className='h-10 w-10 p-0 bg-white/95 border-white/20 hover:bg-white text-gray-700'
                  title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDir === 'asc' ? '↑' : '↓'}
                </Button>
              </div>

              {/* Page Size */}
              <div className='flex items-center space-x-2 ml-auto'>
                <span className='text-sm font-medium text-white'>
                  Items per page:
                </span>
                <Select
                  onValueChange={value =>
                    handlePageSizeChange(Number.parseInt(value))
                  }
                  value={pageSize.toString()}
                >
                  <SelectTrigger className='w-[90px] h-10 bg-white/95 border-white/20 hover:bg-white'>
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
          </div>
        </CardContent>
      </Card>

      {/* Products Grid - More compact, more items per row */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
        {filteredProducts.length === 0 ? (
          <p className='col-span-full text-center text-gray-500 py-8'>
            {(() => {
              if (searchQuery) {
                return 'No products found matching your search';
              }
              if (selectedCategory) {
                return 'No products found in this category';
              }
              return 'No products available';
            })()}
          </p>
        ) : (
          filteredProducts.map((product, index) => (
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
        {searchQuery ? (
          <>
            Showing {filteredProducts.length} of {products.length} products
            matching &quot;{searchQuery}&quot;
          </>
        ) : (
          <>
            Showing {products.length} of {totalElements} products
            {totalPages > 1 && ` (Page ${currentPage + 1} of ${totalPages})`}
          </>
        )}
      </div>
    </div>
  );
}
