import {
  AddProductsToDiscountRequest,
  CreateDiscountRequest,
  Discount,
  DiscountsResponse,
  DiscountUsageAnalytics,
  Product,
  ProductsResponse,
  RemoveProductsFromDiscountRequest,
  UpdateDiscountRequest,
} from '../types/discount';

// Updated API URLs based on your provided endpoints
const ORDER_SERVICE_BASE =
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8084';
const ADMIN_API_BASE_URL = `${ORDER_SERVICE_BASE}/api/admin/discounts`;
const PUBLIC_API_BASE_URL = `${ORDER_SERVICE_BASE}/api/discounts`;
const PRODUCTS_API_URL =
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ||
  'http://localhost:8083/api/products';

export const discountService = {
  /**
   * Create a new discount (Admin)
   */
  async createDiscount(discountData: CreateDiscountRequest): Promise<Discount> {
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com', // Add admin header
        },
        body: JSON.stringify(discountData),
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/create`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create discount: ${response.status} - ${errorText}`
        );
      }

      const discount: Discount = await response.json();
      return discount;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  },

  /**
   * Get all discounts with pagination (Admin)
   * Updated to use /all endpoint
   */
  async getAllDiscounts(
    page: number = 0,
    size: number = 10
  ): Promise<DiscountsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com', // Add admin header
        },
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/all?${params}`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch discounts: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // Handle direct array response
      if (Array.isArray(data)) {
        return {
          content: data,
          totalElements: data.length,
          totalPages: Math.ceil(data.length / size),
          currentPage: page,
          pageSize: size,
        };
      }

      // Handle the actual API response structure: { discounts: [...], pagination: {...} }
      if (data.discounts && data.pagination) {
        return {
          content: data.discounts,
          totalElements: data.pagination.totalElements,
          totalPages: data.pagination.totalPages,
          currentPage: data.pagination.currentPage,
          pageSize: data.pagination.pageSize,
        };
      }

      // Fallback for other response structures
      const discountsResponse = data as DiscountsResponse;
      return {
        content: discountsResponse.content || [],
        totalElements: discountsResponse.totalElements || 0,
        totalPages: discountsResponse.totalPages || 0,
        currentPage: discountsResponse.currentPage || page,
        pageSize: discountsResponse.pageSize || size,
      };
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error;
    }
  },

  /**
   * Get active discounts by type (Public API)
   */
  async getActiveDiscounts(
    type?: 'BILL_DISCOUNT' | 'PRODUCT_DISCOUNT'
  ): Promise<Discount[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);

      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(
        `${PUBLIC_API_BASE_URL}/active?${params}`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch active discounts: ${response.status} - ${errorText}`
        );
      }

      const discounts: Discount[] = await response.json();
      return discounts;
    } catch (error) {
      console.error('Error fetching active discounts:', error);
      throw error;
    }
  },

  /**
   * Get discount by ID (Admin)
   */
  async getDiscountById(discountId: number): Promise<Discount> {
    try {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com',
        },
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/${discountId}`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch discount: ${response.status} - ${errorText}`
        );
      }

      const discount: Discount = await response.json();
      return discount;
    } catch (error) {
      console.error('Error fetching discount by ID:', error);
      throw error;
    }
  },

  /**
   * Update discount (Admin)
   */
  async updateDiscount(
    discountId: number,
    updateData: UpdateDiscountRequest
  ): Promise<Discount> {
    try {
      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com',
        },
        body: JSON.stringify(updateData),
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/${discountId}`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update discount: ${response.status} - ${errorText}`
        );
      }

      const discount: Discount = await response.json();
      return discount;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  },

  /**
   * Delete discount (Admin)
   */
  async deleteDiscount(discountId: number): Promise<void> {
    try {
      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com',
        },
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/${discountId}`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete discount: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  },

  /**
   * Add products to product-specific discount (Admin)
   */
  async addProductsToDiscount(
    discountId: number,
    productData: AddProductsToDiscountRequest
  ): Promise<void> {
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com',
        },
        body: JSON.stringify(productData),
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/${discountId}/products`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to add products to discount: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error('Error adding products to discount:', error);
      throw error;
    }
  },

  /**
   * Remove products from discount (Admin)
   */
  async removeProductsFromDiscount(
    discountId: number,
    productData: RemoveProductsFromDiscountRequest
  ): Promise<void> {
    try {
      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com',
        },
        body: JSON.stringify(productData),
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/${discountId}/products`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to remove products from discount: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error('Error removing products from discount:', error);
      throw error;
    }
  },

  /**
   * Get discount usage analytics (Admin) - Uses individual discount endpoint
   */
  async getDiscountUsageAnalytics(
    discountId: number
  ): Promise<DiscountUsageAnalytics> {
    try {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Admin-User-Id': 'test.admin@company.com',
        },
      };

      const response = await fetch(
        `${ADMIN_API_BASE_URL}/${discountId}`,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch discount analytics: ${response.status} - ${errorText}`
        );
      }

      const discount: Discount = await response.json();

      // Transform discount data into analytics format
      const analytics: DiscountUsageAnalytics = {
        discountId: discount.id || 0,
        discountCode: discount.discountCode,
        totalUsages: discount.totalUsageCount || 0,
        uniqueUsers: discount.uniqueUsersCount || 0,
        totalDiscountAmount: discount.totalDiscountGiven || 0,
        avgDiscountPerOrder: discount.totalUsageCount
          ? (discount.totalDiscountGiven || 0) / discount.totalUsageCount
          : 0,
        usageByDate: [
          {
            date: new Date().toISOString().split('T')[0],
            usageCount: discount.totalUsageCount || 0,
            totalDiscount: discount.totalDiscountGiven || 0,
          },
        ],
        topUsers: discount.totalUsageCount
          ? [
              {
                userId: 1,
                usageCount: discount.totalUsageCount,
                totalDiscount: discount.totalDiscountGiven || 0,
              },
            ]
          : [],
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching discount analytics:', error);
      throw error;
    }
  },

  /**
   * Get all products for product selection
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(PRODUCTS_API_URL, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch products: ${response.status} - ${errorText}`
        );
      }

      // Handle both direct array response and wrapped response
      const data = await response.json();

      // If it's a direct array, return it
      if (Array.isArray(data)) {
        return data as Product[];
      }

      // If it's wrapped in a response object, extract the products
      const productsResponse = data as ProductsResponse;
      return productsResponse.products || productsResponse.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
};
