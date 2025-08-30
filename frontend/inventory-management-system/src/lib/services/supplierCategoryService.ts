import { SupplierCategory, SupplierCategoryCreateRequest } from '../types/supplier';

const API_BASE_URL = 'http://localhost:8090/api/supplier-categories'; // Through API Gateway

export const supplierCategoryService = {
  /**
   * Get all supplier categories
   */
  async getAllCategories(): Promise<SupplierCategory[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch supplier categories: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch supplier categories:', error);
      throw new Error('Failed to fetch supplier categories - backend not available');
    }
  },

  /**
   * Create new supplier category
   */
  async createCategory(category: SupplierCategoryCreateRequest): Promise<SupplierCategory> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
      });

      if (!response.ok) {
        throw new Error('Failed to create supplier category');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to create supplier category:', error);
      throw new Error('Failed to create supplier category - backend not available');
    }
  }
};
