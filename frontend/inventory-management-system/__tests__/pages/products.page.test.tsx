import { render, screen, waitFor } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the ProductsClient component
jest.mock('@/app/products/ProductsClient', () => {
  return function MockProductsClient({
    initialProducts,
    initialCategories,
  }: any) {
    return (
      <div>
        {initialProducts.length === 0 ? (
          <div>No products available</div>
        ) : (
          initialProducts.map((product: any) => (
            <div key={product.productId} data-testid='product-card'>
              {product.name}
            </div>
          ))
        )}
      </div>
    );
  };
});

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders products successfully', async () => {
    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              productId: 1,
              name: 'Item A',
              description: 'A',
              price: 100,
              stock: 5,
            },
          ],
          totalElements: 1,
          totalPages: 1,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, categoryName: 'Category A' }],
      } as Response);

    const searchParams = Promise.resolve({});
    render(await ProductsPage({ searchParams }));

    expect(await screen.findByTestId('product-card')).toBeInTheDocument();
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });

  it('renders empty state on no data', async () => {
    // Mock empty API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [],
          totalElements: 0,
          totalPages: 0,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    const searchParams = Promise.resolve({});
    render(await ProductsPage({ searchParams }));

    expect(
      await screen.findByText(/No products available/i)
    ).toBeInTheDocument();
  });

  it('handles fetch failure gracefully', async () => {
    // Mock failed API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    const searchParams = Promise.resolve({});
    render(await ProductsPage({ searchParams }));

    expect(
      await screen.findByText(/No products available/i)
    ).toBeInTheDocument();
  });
});
