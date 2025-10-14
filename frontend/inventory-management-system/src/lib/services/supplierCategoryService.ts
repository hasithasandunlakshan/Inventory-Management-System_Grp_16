import {
  SupplierCategory,
  SupplierCategoryCreateRequest,
} from '../types/supplier';
import { createAuthenticatedRequestOptions } from '../utils/authUtils';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8082'}/api/supplier-categories`; // Through API Gateway

export const supplierCategoryService = {
  /**
   * Get all supplier categories
   */
  async getAllCategories(): Promise<SupplierCategory[]> {
    try {
      const response = await fetch(
        API_BASE_URL,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch supplier categories: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch supplier categories:', error);
      throw new Error(
        'Failed to fetch supplier categories - backend not available'
      );
    }
  },

  /**
   * Create new supplier category
   */
  async createCategory(
    category: SupplierCategoryCreateRequest
  ): Promise<SupplierCategory> {
    try {
      const response = await fetch(
        API_BASE_URL,
        createAuthenticatedRequestOptions('POST', category)
      );

      if (!response.ok) {
        throw new Error('Failed to create supplier category');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create supplier category:', error);
      throw new Error(
        'Failed to create supplier category - backend not available'
      );
    }
  },
};
