'use client';

import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types/product';
import ProductDetails from '@/components/product/ProductDetails';

interface ProductDetailsClientProps {
  initialProduct: Product;
}

export default function ProductDetailsClient({
  initialProduct,
}: ProductDetailsClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/products');
  };

  return <ProductDetails product={initialProduct} onBack={handleBack} />;
}
