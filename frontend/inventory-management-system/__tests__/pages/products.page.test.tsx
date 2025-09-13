import { render, screen, waitFor } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

jest.mock('@/lib/services/productService', () => ({
  productService: {
    getAllProducts: jest.fn(),
  },
}));

jest.mock('@/components/ui/loading', () => () => (
  <div data-testid='loading'>Loading...</div>
));
jest.mock('@/components/product/ProductCard', () => (props: any) => (
  <div data-testid='product-card'>{props.name}</div>
));

const { productService } = jest.requireMock('@/lib/services/productService');

describe('ProductsPage', () => {
  it('shows loader then renders products', async () => {
    (productService.getAllProducts as jest.Mock).mockResolvedValueOnce([
      { id: '1', name: 'Item A', description: 'A', price: 100, stock: 5 },
    ]);

    render(<ProductsPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(await screen.findAllByTestId('product-card')).toHaveLength(1);
  });

  it('renders empty state on no data', async () => {
    (productService.getAllProducts as jest.Mock).mockResolvedValueOnce([]);
    render(<ProductsPage />);
    expect(
      await screen.findByText(/No products available/i)
    ).toBeInTheDocument();
  });

  it('handles fetch failure gracefully', async () => {
    (productService.getAllProducts as jest.Mock).mockRejectedValueOnce(
      new Error('fail')
    );
    render(<ProductsPage />);
    await waitFor(() =>
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    );
    expect(screen.getByText(/No products available/i)).toBeInTheDocument();
  });
});
