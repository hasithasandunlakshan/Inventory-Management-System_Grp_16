import { Product, Category } from '@/lib/types/product';
import ProductsClient from './ProductsClient';
// ISR Configuration - Revalidate every 5 minutes
export const revalidate = 300;

// Server Component - Fetches data at build time and revalidates
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    size?: string;
    sortBy?: string;
    sortDir?: string;
    category?: string;
  }>;
}) {
  const params = await (searchParams || Promise.resolve({}));
  const page = parseInt((params as { page?: string }).page || '0');
  const size = parseInt((params as { size?: string }).size || '12');
  const sortBy = (params as { sortBy?: string }).sortBy || 'id';
  const sortDir = (params as { sortDir?: string }).sortDir || 'asc';
  const selectedCategory = (params as { category?: string }).category
    ? parseInt((params as { category?: string }).category!)
    : null;

  // Fetch products data at build time with ISR
  const productsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083'}/api/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );

  // Fetch categories data
  const categoriesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083'}/api/categories`
  );

  let productsData;
  let categoriesData;

  try {
    if (!productsResponse.ok) {
      throw new Error(`HTTP error! status: ${productsResponse.status}`);
    }
    productsData = await productsResponse.json();
    // Ensure productsData has the expected structure
    if (!productsData.content || !Array.isArray(productsData.content)) {
      console.error('Invalid products data structure:', productsData);
      productsData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
        first: true,
        last: true,
      };
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    productsData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 0,
      number: 0,
      first: true,
      last: true,
    };
  }

  try {
    if (!categoriesResponse.ok) {
      throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
    }
    categoriesData = await categoriesResponse.json();
    // Ensure categoriesData is an array
    if (!Array.isArray(categoriesData)) {
      console.error('Invalid categories data structure:', categoriesData);
      categoriesData = [];
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    categoriesData = [];
  }

  // Filter products by category if specified
  let filteredProducts = productsData.content || [];
  let filteredTotalElements = productsData.totalElements || 0;
  let filteredTotalPages = productsData.totalPages || 0;

  if (selectedCategory && Array.isArray(productsData.content)) {

    // Filter products by category on the server side
    filteredProducts = productsData.content.filter(
      (product: Product) =>
        product.categoryName &&
        product.categoryName
          .toLowerCase()
          .includes(
            categoriesData
              .find((cat: Category) => cat.id === selectedCategory)
              ?.categoryName.toLowerCase() || ''
          )
    );
    filteredTotalElements = filteredProducts.length;
    filteredTotalPages = Math.ceil(filteredTotalElements / size);
  }

  return (
    <ProductsClient
      initialProducts={filteredProducts}
      initialCategories={categoriesData}
      initialTotalElements={filteredTotalElements}
      initialTotalPages={filteredTotalPages}
      initialCurrentPage={page}
      initialPageSize={size}
      initialSortBy={sortBy}
      initialSortDir={sortDir}
      initialSelectedCategory={selectedCategory}
    />
  );
}
