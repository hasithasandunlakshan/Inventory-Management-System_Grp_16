import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/product/ProductCard';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} src={props.src} />,
}));

// Mock productUtils
jest.mock('@/lib/utils/product/productUtils', () => ({
  productUtils: {
    viewProductDetails: jest.fn(),
  },
}));

const baseProps = {
  id: 1,
  name: 'Sample Product',
  description: 'Great product',
  price: 123.45,
  stock: 7,
  imageUrl: '',
  barcode: 'ABC-123',
};

const { productUtils } = jest.requireMock('@/lib/utils/product/productUtils');

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders basic info and fallback image block', () => {
      render(<ProductCard {...baseProps} />);
      expect(screen.getByText('Sample Product')).toBeInTheDocument();
      expect(screen.getByText('Great product')).toBeInTheDocument();
      expect(screen.getByText('ABC-123')).toBeInTheDocument(); // Barcode value
      expect(screen.getByText('$123.45')).toBeInTheDocument();
      expect(screen.getByText(/Stock:/i)).toBeInTheDocument();
      expect(screen.getByText(/Stock: 7/i)).toBeInTheDocument();
      // Verify the card renders (basic smoke test)
      expect(screen.getByText('Sample Product')).toBeInTheDocument();
    });

    it('renders with image when imageUrl is provided', () => {
      const propsWithImage = {
        ...baseProps,
        imageUrl: 'https://example.com/image.jpg',
      };
      render(<ProductCard {...propsWithImage} />);

      const image = screen.getByAltText('Sample Product');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('renders category badge when categoryName is provided', () => {
      const propsWithCategory = { ...baseProps, categoryName: 'Electronics' };
      render(<ProductCard {...propsWithCategory} />);

      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('does not render category badge when categoryName is not provided', () => {
      render(<ProductCard {...baseProps} />);

      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });
  });

  describe('Stock Status', () => {
    it('shows "In Stock" status for good stock levels', () => {
      const goodStockProps = { ...baseProps, stock: 50, availableStock: 50 };
      render(<ProductCard {...goodStockProps} />);

      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('shows "Low" status for low stock levels', () => {
      const lowStockProps = {
        ...baseProps,
        stock: 5,
        availableStock: 5,
        minThreshold: 10,
      };
      render(<ProductCard {...lowStockProps} />);

      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('shows "Out" status for zero stock', () => {
      const outOfStockProps = { ...baseProps, stock: 0, availableStock: 0 };
      render(<ProductCard {...outOfStockProps} />);

      expect(screen.getByText('Out')).toBeInTheDocument();
    });

    it('uses availableStock when provided instead of stock', () => {
      const propsWithAvailableStock = {
        ...baseProps,
        stock: 100,
        availableStock: 5,
        minThreshold: 10,
      };
      render(<ProductCard {...propsWithAvailableStock} />);

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText(/Stock: 5/i)).toBeInTheDocument(); // Available stock display
    });

    it('uses stock when availableStock is not provided', () => {
      const propsWithoutAvailableStock = {
        ...baseProps,
        stock: 5,
        minThreshold: 10,
      };
      render(<ProductCard {...propsWithoutAvailableStock} />);

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText(/Stock: 5/i)).toBeInTheDocument();
    });
  });

  describe('Price Display', () => {
    it('formats price correctly with two decimal places', () => {
      const priceProps = { ...baseProps, price: 99.9 };
      render(<ProductCard {...priceProps} />);

      expect(screen.getByText('$99.90')).toBeInTheDocument();
    });

    it('handles zero price', () => {
      const zeroPriceProps = { ...baseProps, price: 0 };
      render(<ProductCard {...zeroPriceProps} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('handles large prices', () => {
      const largePriceProps = { ...baseProps, price: 1234.567 };
      render(<ProductCard {...largePriceProps} />);

      expect(screen.getByText('$1234.57')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders action buttons when showActions is true', () => {
      render(<ProductCard {...baseProps} showActions={true} />);

      expect(screen.getByText('View')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('does not render action buttons when showActions is false', () => {
      render(<ProductCard {...baseProps} showActions={false} />);

      expect(screen.queryByText('View')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('calls viewProductDetails when View button is clicked', () => {
      render(<ProductCard {...baseProps} />);

      fireEvent.click(screen.getByText('View'));
      expect(productUtils.viewProductDetails).toHaveBeenCalledWith(
        '1',
        expect.any(Object)
      );
    });

    it('navigates to edit page when Edit button is clicked', () => {
      render(<ProductCard {...baseProps} />);

      fireEvent.click(screen.getByText('Edit'));
      expect(mockPush).toHaveBeenCalledWith('/products/edit/1');
    });

    it('prevents event propagation on button clicks', () => {
      const parentClickHandler = jest.fn();
      render(
        <div onClick={parentClickHandler}>
          <ProductCard {...baseProps} />
        </div>
      );

      fireEvent.click(screen.getByText('View'));
      fireEvent.click(screen.getByText('Edit'));

      // Parent click handler should not be called due to stopPropagation
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string description', () => {
      const emptyDescProps = { ...baseProps, description: '' };
      render(<ProductCard {...emptyDescProps} />);

      expect(screen.getByText('Sample Product')).toBeInTheDocument();
      expect(screen.queryByText('Great product')).not.toBeInTheDocument();
    });

    it('handles very long product names', () => {
      const longNameProps = {
        ...baseProps,
        name: 'This is a very long product name that should be truncated',
      };
      render(<ProductCard {...longNameProps} />);

      expect(
        screen.getByText(
          'This is a very long product name that should be truncated'
        )
      ).toBeInTheDocument();
    });

    it('handles very long descriptions', () => {
      const longDescProps = {
        ...baseProps,
        description:
          'This is a very long description that should be truncated to two lines maximum in the UI',
      };
      render(<ProductCard {...longDescProps} />);

      expect(
        screen.getByText(
          'This is a very long description that should be truncated to two lines maximum in the UI'
        )
      ).toBeInTheDocument();
    });

    it('handles special characters in barcode', () => {
      const specialBarcodeProps = { ...baseProps, barcode: 'ABC-123!@#$%' };
      render(<ProductCard {...specialBarcodeProps} />);

      expect(screen.getByText('ABC-123!@#$%')).toBeInTheDocument();
    });

    it('handles negative stock values', () => {
      const negativeStockProps = {
        ...baseProps,
        stock: -5,
        availableStock: -5,
        minThreshold: 10,
      };
      render(<ProductCard {...negativeStockProps} />);

      expect(screen.getByText(/Stock: -5/i)).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument(); // Negative values show as low stock
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      const imageProps = {
        ...baseProps,
        imageUrl: 'https://example.com/image.jpg',
      };
      render(<ProductCard {...imageProps} />);

      const image = screen.getByAltText('Sample Product');
      expect(image).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<ProductCard {...baseProps} />);

      const viewButton = screen.getByRole('button', { name: /view/i });
      const editButton = screen.getByRole('button', { name: /edit/i });

      expect(viewButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ProductCard {...baseProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Sample Product');
    });
  });

  describe('Different Product Types', () => {
    it('renders electronics product correctly', () => {
      const electronicsProps = {
        ...baseProps,
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop',
        price: 1299.99,
        categoryName: 'Electronics',
        stock: 15,
      };
      render(<ProductCard {...electronicsProps} />);

      expect(screen.getByText('Gaming Laptop')).toBeInTheDocument();
      expect(
        screen.getByText('High-performance gaming laptop')
      ).toBeInTheDocument();
      expect(screen.getByText('$1299.99')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('renders clothing product correctly', () => {
      const clothingProps = {
        ...baseProps,
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        categoryName: 'Clothing',
        stock: 3,
        minThreshold: 5,
      };
      render(<ProductCard {...clothingProps} />);

      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
      expect(
        screen.getByText('Comfortable cotton t-shirt')
      ).toBeInTheDocument();
      expect(screen.getByText('$19.99')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('renders food product correctly', () => {
      const foodProps = {
        ...baseProps,
        name: 'Organic Apples',
        description: 'Fresh organic apples',
        price: 4.5,
        categoryName: 'Food',
        stock: 0,
      };
      render(<ProductCard {...foodProps} />);

      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('Fresh organic apples')).toBeInTheDocument();
      expect(screen.getByText('$4.50')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Out')).toBeInTheDocument();
    });
  });
});
