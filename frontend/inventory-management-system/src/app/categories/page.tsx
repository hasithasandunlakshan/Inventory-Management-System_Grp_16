import { Category } from '@/lib/types/product';
import CategoriesClient from './CategoriesClient';

// SSG with ISR - Revalidate every 10 minutes (categories don't change frequently)
export const revalidate = 600;

// Server Component - Fetches data with ISR
export default async function CategoriesPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';

  // Fetch categories data with ISR caching
  const categoriesResponse = await fetch(`${apiUrl}/api/categories`, {
    next: { revalidate: 600 }, // ISR: Revalidate every 10 minutes
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch(() => null);

  let categoriesData: Category[] = [];

  if (!categoriesResponse) {
    categoriesData = [];
  } else {
    try {
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
      }
      const data = await categoriesResponse.json();
      // Ensure categoriesData is an array
      if (Array.isArray(data)) {
        categoriesData = data;
      }
    } catch {
      // Fallback to empty array on error
      categoriesData = [];
    }
  }

  return <CategoriesClient initialCategories={categoriesData} />;
}
