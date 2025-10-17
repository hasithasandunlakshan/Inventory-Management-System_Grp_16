import { render, screen } from '@testing-library/react';
import ProductLayout from '@/app/products/layout';

describe('ProductLayout (root __tests__)', () => {
  it('renders children correctly', () => {
    render(
      <ProductLayout>
        <div>content</div>
      </ProductLayout>
    );
    // Layout should render the children
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('wraps children in a main element', () => {
    const { container } = render(
      <ProductLayout>
        <div>test content</div>
      </ProductLayout>
    );
    // Check that main element exists
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toContainHTML('test content');
  });
});
