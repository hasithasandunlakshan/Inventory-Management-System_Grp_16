import { Product } from '../types/product';

const API_BASE_URL = 'http://localhost:8083/api/products'; // Adjust this to your actual backend URL

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    console.log("Fetching products from:", API_BASE_URL);
    const response = await fetch(API_BASE_URL);
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
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
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  },

  async updateProduct(product: Product): Promise<Product> {
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
  }
};