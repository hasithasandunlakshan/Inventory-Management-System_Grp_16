import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/product/ProductCard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} />,
}));

jest.mock('@/lib/utils/productUtils', () => ({
  productUtils: {
    viewProductDetails: jest.fn(),
  },
}));

const { productUtils } = jest.requireMock('@/lib/utils/productUtils');

const baseProps = {
  id: 'p1',
  name: 'Sample Product',
  description: 'Great product',
  price: 123.45,
  stock: 7,
  imageUrl: '',
  barcode: 'ABC-123',
};

describe('ProductCard', () => {
  it('renders basic info and fallback image block', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText('Sample Product')).toBeInTheDocument();
    expect(screen.getByText('Great product')).toBeInTheDocument();
    expect(screen.getByText(/Barcode:/i)).toBeInTheDocument();
    expect(screen.getByText(/Price: \$123.45/)).toBeInTheDocument();
    expect(screen.getByText(/Qty: 7/)).toBeInTheDocument();
    expect(screen.getByText(/No image/i)).toBeInTheDocument();
  });

  it('navigates to product details on click', () => {
    render(<ProductCard {...baseProps} />);
    fireEvent.click(screen.getByText('Sample Product'));
    expect(productUtils.viewProductDetails).toHaveBeenCalledWith(
      'p1',
      expect.any(Object)
    );
  });
});
