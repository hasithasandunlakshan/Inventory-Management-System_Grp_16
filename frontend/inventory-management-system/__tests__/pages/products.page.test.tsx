import { render, screen, waitFor } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

jest.mock('@/lib/services/productService', () => ({
  productService: {
    getAllProducts: jest.fn(),
    getAllProductsWithCategories: jest.fn(),
  },
}));

jest.mock('@/lib/services/categoryService', () => ({
  categoryService: {
    getAllCategories: jest.fn(),
  },
}));

jest.mock('@/components/ui/loading', () => () => (
  <div data-testid='loading'>Loading...</div>
));
jest.mock('@/components/product/ProductCard', () => (props: any) => (
  <div data-testid='product-card'>{props.name}</div>
));

const { productService } = jest.requireMock('@/lib/services/productService');
const { categoryService } = jest.requireMock('@/lib/services/categoryService');

describe('ProductsPage', () => {
  it('shows loader then renders products', async () => {
    (productService.getAllProductsWithCategories as jest.Mock).mockResolvedValueOnce([
      { productId: 1, name: 'Item A', description: 'A', price: 100, stock: 5 },
    ]);
    (categoryService.getAllCategories as jest.Mock).mockResolvedValueOnce([
      { id: 1, categoryName: 'Category A' },
    ]);

    render(<ProductsPage />);
    
    // Wait for the products to load and check that loading is gone
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    expect(await screen.findAllByTestId('product-card')).toHaveLength(1);
  });

  it('renders empty state on no data', async () => {
    (productService.getAllProductsWithCategories as jest.Mock).mockResolvedValueOnce([]);
    (categoryService.getAllCategories as jest.Mock).mockResolvedValueOnce([]);
    render(<ProductsPage />);
    expect(
      await screen.findByText(/No products available/i)
    ).toBeInTheDocument();
  });

  it('handles fetch failure gracefully', async () => {
    (productService.getAllProductsWithCategories as jest.Mock).mockRejectedValueOnce(
      new Error('fail')
    );
    (categoryService.getAllCategories as jest.Mock).mockResolvedValueOnce([]);
    render(<ProductsPage />);
    await waitFor(() =>
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    );
    expect(screen.getByText(/No products available/i)).toBeInTheDocument();
  });
});
