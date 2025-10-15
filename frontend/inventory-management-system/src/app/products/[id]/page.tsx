import { Product } from '@/lib/types/product';
import ProductDetailsClient from './ProductDetailsClient';
import { notFound } from 'next/navigation';

// SSG with ISR - Revalidate every 5 minutes
export const revalidate = 300;

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';

    // Fetch all products (use large page size to get all)
    const response = await fetch(`${apiUrl}/api/products?page=0&size=1000`, {
      next: { revalidate: 300 },
    }).catch(() => null);

    if (!response?.ok) {
      return []; // Return empty array if fetch fails
    }

    const data = await response.json();
    const products = data.content || [];

    // Generate params for each product
    return products.map((product: Product) => ({
      id: product.productId?.toString() ?? '',
    }));
  } catch {
    // Return empty array on error - pages will be generated on-demand (ISR fallback)
    return [];
  }
}

// Server Component - Fetches individual product data
export default async function ProductDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiUrl =
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';

  // Fetch product data with ISR
  const productResponse = await fetch(`${apiUrl}/api/products/${id}`, {
    next: { revalidate: 300 }, // ISR: Revalidate every 5 minutes
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch(() => null);

  let product: Product | null = null;

  if (!productResponse) {
    notFound(); // Show 404 page
  } else {
    try {
      if (!productResponse.ok) {
        if (productResponse.status === 404) {
          notFound(); // Show 404 page
        }
        throw new Error(`HTTP error! status: ${productResponse.status}`);
      }
      product = await productResponse.json();
    } catch {
      // Show 404 page on parse error
      notFound();
    }
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient initialProduct={product} />;
}
