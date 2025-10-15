import { Product, CreateProductRequest } from '../types/product';

const API_BASE_URL =
`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083'}/api/products`;

export const productService = {
  async getAllProducts(page = 0, size = 20, sortBy = 'id', sortDir = 'asc'): Promise<{
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });
      
      const response = await fetch(`${API_BASE_URL}?${params}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch products from backend:', error);
      throw new Error('Failed to fetch products - backend not available');
    }
  },

  async getAllProductsWithCategories(page = 0, size = 20, sortBy = 'id', sortDir = 'asc'): Promise<{
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    try {
      // The backend /api/products endpoint already returns products with categories
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });
      
      const response = await fetch(`${API_BASE_URL}?${params}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch products with categories: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    } catch (error) {
      console.error(
        'Failed to fetch products with categories from backend:',
        error
      );
      throw new Error(
        'Failed to fetch products with categories - backend not available'
      );
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(
          `Failed to fetch product: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch product from backend:', error);
      throw error;
    }
  },

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products by category: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    } catch (error) {
      console.error(
        'Failed to fetch products by category from backend:',
        error
      );
      throw error;
    }
  },

  async addProduct(product: CreateProductRequest): Promise<Product> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to add product:', error);
      throw new Error('Failed to add product - backend not available');
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw new Error('Failed to delete product - backend not available');
    }
  },

  async updateProduct(
    id: number,
    product: CreateProductRequest
  ): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new Error('Failed to update product - backend not available');
    }
  },
};
