import { productService } from '@/lib/services/productService';
import { Product } from '@/lib/types/product';
import { toast } from 'sonner'; // Assuming you're using sonner for notifications
import { useRouter } from 'next/navigation';

export const productUtils = {
  /**
   * Delete a product and handle the aftermath
   * @param id Product ID to delete
   * @param onSuccessCallback Optional callback after successful deletion
   */
  deleteProduct: async (id: string, onSuccessCallback?: () => void) => {
    try {
      await productService.deleteProduct(Number(id));
      toast.success('Product deleted successfully');

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch (error) {
      console.error('Failed to delete product', error);
      toast.error('Failed to delete product');
    }
  },

  /**
   * Edit a product
   * @param product Product to edit
   * @param router Next.js router for navigation
   */
  editProduct: (product: Product, router: ReturnType<typeof useRouter>) => {
    // Navigate to edit page for the specific product
    router.push(`/products/edit/${product.productId}`);
  },

  /**
   * Navigate to product details
   * @param productId Product ID to view
   * @param router Next.js router for navigation
   */
  viewProductDetails: (
    productId: string,
    router: ReturnType<typeof useRouter>
  ) => {
    router.push(`/products/${productId}`);
  },
};
