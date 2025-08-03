import { Product } from '../types/product';

const API_BASE_URL = 'http://localhost:8083/api/products'; // Adjust this to your actual backend URL

// Fallback data for when backend is not available
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Sample Product 1',
    description: 'This is a sample product for demonstration purposes.',
    price: 29.99,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    barcode: '1234567890123',
    barcodeImageUrl: 'https://barcode.tec-it.com/barcode.ashx?data=1234567890123&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Png&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=Default&qunit=Mm&quiet=0&hidehrt=False'
  },
  {
    id: '2',
    name: 'Sample Product 2',
    description: 'Another sample product to show the interface.',
    price: 49.99,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    barcode: '9876543210987',
    barcodeImageUrl: 'https://barcode.tec-it.com/barcode.ashx?data=9876543210987&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Png&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=Default&qunit=Mm&quiet=0&hidehrt=False'
  }
];

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        console.warn('Backend not available, using fallback data');
        return fallbackProducts;
      }
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch products from backend, using fallback data:', error);
      return fallbackProducts;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        // Try to find in fallback data
        const fallbackProduct = fallbackProducts.find(p => p.id === id);
        if (fallbackProduct) {
          console.warn('Backend not available, using fallback product data');
          return fallbackProduct;
        }
        throw new Error('Product not found');
      }
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch product from backend:', error);
      // Try to find in fallback data
      const fallbackProduct = fallbackProducts.find(p => p.id === id);
      if (fallbackProduct) {
        return fallbackProduct;
      }
      throw new Error('Product not found');
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