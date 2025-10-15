import { Product } from '@/lib/types/product';
import SaleForecastClient from './SaleForecastClient';

// SSG with ISR - Revalidate every 10 minutes (products don't change frequently)
export const revalidate = 600;

// Server Component - Fetches products with ISR
export default async function SaleForecastPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';

  // Fetch all products for dropdown (using large page size)
  const productsResponse = await fetch(
    `${apiUrl}/api/products?page=0&size=1000`,
    {
      next: { revalidate: 600 }, // ISR: Revalidate every 10 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).catch(() => null);

  let products: Product[] = [];

  if (productsResponse) {
    try {
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        products = data.content || [];
      }
    } catch {
      products = [];
    }
  }

  return <SaleForecastClient initialProducts={products} />;
}
