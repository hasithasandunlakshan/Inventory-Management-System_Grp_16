import { render, screen } from '@testing-library/react';
import ProductLayout from '@/app/products/layout';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('ProductLayout (root __tests__)', () => {
  it('renders search and add product button', () => {
    render(
      <ProductLayout>
        <div>content</div>
      </ProductLayout>
    );
    expect(screen.getByPlaceholderText(/Search products/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Add Product/i })
    ).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
