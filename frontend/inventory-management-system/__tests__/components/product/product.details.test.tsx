import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetails from '@/components/product/ProductDetails';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} />,
}));

jest.mock('@/lib/utils/product/productUtils', () => ({
  productUtils: {
    editProduct: jest.fn(),
  },
}));

const { productUtils } = jest.requireMock('@/lib/utils/product/productUtils');

const product = {
  id: 'p1',
  name: 'Deluxe Rice 5kg',
  description: 'Premium quality rice',
  price: 2500,
  stock: 30,
  imageUrl: '',
  barcode: 'RICE-555',
  barcodeImageUrl: '',
};

describe('ProductDetails', () => {
  it('renders key product information', () => {
    render(<ProductDetails product={product as any} onBack={jest.fn()} />);
    expect(screen.getAllByText(/Deluxe Rice 5kg/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Premium quality rice/)[0]).toBeInTheDocument();
    expect(screen.getByText(/\$2500.00/)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('RICE-555')).toBeInTheDocument();
  });

  it('calls edit on button click and onBack on back button', () => {
    const onBack = jest.fn();
    render(<ProductDetails product={product as any} onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: /Edit Product/i }));
    expect(productUtils.editProduct).toHaveBeenCalledWith(
      expect.objectContaining(product),
      expect.any(Object)
    );

    fireEvent.click(screen.getByRole('button', { name: /View All Products/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
