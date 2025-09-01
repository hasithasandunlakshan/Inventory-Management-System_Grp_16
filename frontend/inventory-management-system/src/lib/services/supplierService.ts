import { Supplier, SupplierCreateRequest } from '../types/supplier';

// Use API Gateway URL instead of direct service
const API_BASE_URL = 'http://localhost:8090/api/suppliers'; // Through API Gateway

export const supplierService = {
  /**
   * Get all suppliers
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      throw new Error('Failed to fetch suppliers - backend not available');
    }
  },

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Supplier not found');
        }
        throw new Error(`Failed to fetch supplier: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch supplier:', error);
      throw error;
    }
  },

  /**
   * Create new supplier
   */
  async createSupplier(supplier: SupplierCreateRequest): Promise<Supplier> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplier)
      });

      if (!response.ok) {
        throw new Error('Failed to create supplier');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to create supplier:', error);
      throw new Error('Failed to create supplier - backend not available');
    }
  },

  /**
   * Update existing supplier
   */
  async updateSupplier(supplier: Supplier): Promise<Supplier> {
    try {
      const response = await fetch(`${API_BASE_URL}/${supplier.supplierId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplier)
      });

      if (!response.ok) {
        throw new Error('Failed to update supplier');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to update supplier:', error);
      throw new Error('Failed to update supplier - backend not available');
    }
  },

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      throw new Error('Failed to delete supplier - backend not available');
    }
  }
};
