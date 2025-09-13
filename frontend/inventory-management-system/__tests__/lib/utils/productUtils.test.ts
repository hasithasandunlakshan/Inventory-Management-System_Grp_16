import { productUtils } from '@/lib/utils/productUtils';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/services/productService', () => ({
  productService: {
    deleteProduct: jest.fn(),
  },
}));

const { toast } = jest.requireMock('sonner');
const { productService } = jest.requireMock('@/lib/services/productService');

describe('productUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteProduct', () => {
    it('calls service, shows success, and runs callback on success', async () => {
      (productService.deleteProduct as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      const cb = jest.fn();
      await productUtils.deleteProduct('42', cb);
      expect(productService.deleteProduct).toHaveBeenCalledWith(42);
      expect(toast.success).toHaveBeenCalledWith(
        'Product deleted successfully'
      );
      expect(cb).toHaveBeenCalled();
    });

    it('shows error toast and does not call callback on failure', async () => {
      (productService.deleteProduct as jest.Mock).mockRejectedValueOnce(
        new Error('boom')
      );
      const cb = jest.fn();
      await productUtils.deleteProduct('7', cb);
      expect(productService.deleteProduct).toHaveBeenCalledWith(7);
      expect(toast.error).toHaveBeenCalledWith('Failed to delete product');
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('navigation helpers', () => {
    it('editProduct pushes to edit route', () => {
      const router = { push: jest.fn() } as any;
      const product = { productId: 1 } as any;
      productUtils.editProduct(product, router);
      expect(router.push).toHaveBeenCalledWith('/products/edit/1');
    });

    it('viewProductDetails pushes to details route', () => {
      const router = { push: jest.fn() } as any;
      productUtils.viewProductDetails('xyz', router);
      expect(router.push).toHaveBeenCalledWith('/products/xyz');
    });
  });
});
