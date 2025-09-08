import { Category, CreateCategoryRequest } from '../types/product';

const API_BASE_URL = 'http://localhost:8083/api/categories';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch categories from backend:', error);
      throw new Error('Failed to fetch categories - backend not available');
    }
  },

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Category not found');
        }
        throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch category from backend:', error);
      throw error;
    }
  },

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create category:', error);
      throw new Error('Failed to create category - backend not available');
    }
  },

  async updateCategory(id: number, category: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to update category:', error);
      throw new Error('Failed to update category - backend not available');
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw new Error('Failed to delete category - backend not available');
    }
  }
};

