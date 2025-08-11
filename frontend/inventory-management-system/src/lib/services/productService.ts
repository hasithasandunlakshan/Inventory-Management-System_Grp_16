import { Product } from '../types/product';

const API_BASE_URL = 'http://localhost:8083/api/products'; // Adjust this to your actual backend URL

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(API_BASE_URL);
       console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch products from backend:', error);
      throw new Error('Failed to fetch products - backend not available');
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch product from backend:', error);
      throw error; // Re-throw the original error
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
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

  async updateProduct(product: Product): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/${product.id}`, {
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
  }
};