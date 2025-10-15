import { supplierService } from './supplierService';
import { userService } from './userService';
import { EnhancedSupplier } from '../types/supplier';

export const enhancedSupplierService = {
  /**
   * Get all suppliers with their user details
   */
  async getAllSuppliersWithUserDetails(): Promise<EnhancedSupplier[]> {
    try {
      // First, test if we can access the user service at all
      try {
        const currentUser = await userService.getCurrentUser();
        // Check if current user has admin/manager privileges
        if (
          currentUser.role?.includes('ADMIN') ||
          currentUser.role?.includes('MANAGER')
        ) {
        } else if (currentUser.role?.includes('Store Keeper')) {
        } else {
        }
      } catch (currentUserError) {
        // Check if it's an authentication error that requires re-login
        if (
          currentUserError instanceof Error &&
          (currentUserError.message.includes('login') ||
            currentUserError.message.includes('Authentication') ||
            currentUserError.message.includes('token'))
        ) {
          // Re-throw authentication errors to trigger login flow
          throw currentUserError;
        }

        // For other errors, still try to continue but with limited functionality
      }

      // Get all suppliers
      const suppliers = await supplierService.getAllSuppliers();
      // Then, fetch user details for each supplier
      const enhancedSuppliers: EnhancedSupplier[] = await Promise.allSettled(
        suppliers.map(async (supplier): Promise<EnhancedSupplier> => {
          try {
            const userDetails = await userService.getUserById(supplier.userId);
            return {
              ...supplier,
              categoryId: supplier.categoryId ?? null,
              userDetails: {
                email: userDetails.email,
                fullName: userDetails.fullName,
                phoneNumber: userDetails.phoneNumber,
                formattedAddress: userDetails.formattedAddress,
                accountStatus: userDetails.accountStatus,
                profileImageUrl: userDetails.profileImageUrl,
              },
            };
          } catch (error) {
            // Return supplier without user details if user fetch fails
            return {
              ...supplier,
              categoryId: supplier.categoryId ?? null,
              userDetails: undefined,
            };
          }
        })
      ).then(results =>
        results
          .filter(
            (result): result is PromiseFulfilledResult<EnhancedSupplier> =>
              result.status === 'fulfilled'
          )
          .map(result => result.value)
      );
      return enhancedSuppliers;
    } catch (error) {
      throw new Error(
        'Failed to fetch suppliers with user details - backend not available'
      );
    }
  },

  /**
   * Get supplier by ID with user details
   */
  async getSupplierWithUserDetails(
    supplierId: string
  ): Promise<EnhancedSupplier> {
    try {
      const supplier = await supplierService.getSupplierById(
        parseInt(supplierId)
      );

      try {
        const userDetails = await userService.getUserById(supplier.userId);

        return {
          ...supplier,
          categoryId: supplier.categoryId ?? null,
          userDetails: {
            email: userDetails.email,
            fullName: userDetails.fullName,
            phoneNumber: userDetails.phoneNumber,
            formattedAddress: userDetails.formattedAddress,
            accountStatus: userDetails.accountStatus,
            profileImageUrl: userDetails.profileImageUrl,
          },
        };
      } catch (userError) {
        // Return supplier without user details if user fetch fails
        return {
          ...supplier,
          categoryId: supplier.categoryId ?? null,
          userDetails: undefined,
        };
      }
    } catch (error) {
      throw error;
    }
  },
};
