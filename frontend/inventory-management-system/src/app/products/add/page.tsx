import { Category } from '@/lib/types/product';
import AddProductClient from './AddProductClient';

// ISR Configuration - Revalidate every 10 minutes (600 seconds)
export const revalidate = 600;

// Server Component - Fetches categories with ISR
export default async function AddProductPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';

  // Fetch categories at build time with ISR
  const categoriesResponse = await fetch(`${apiUrl}/api/categories`, {
    next: { revalidate: 600 },
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch(() => null);

  let categories: Category[] = [];

  if (categoriesResponse?.ok) {
    try {
      const data = await categoriesResponse.json();
      categories = Array.isArray(data) ? data : [];
    } catch {
      categories = [];
    }
  }

  return <AddProductClient categories={categories} />;
}
