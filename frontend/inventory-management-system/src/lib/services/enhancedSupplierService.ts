import { supplierService } from './supplierService';
import { userService } from './userService';
import { Supplier, EnhancedSupplier } from '../types/supplier';

export const enhancedSupplierService = {
  /**
   * Get all suppliers with their user details
   */
  async getAllSuppliersWithUserDetails(): Promise<EnhancedSupplier[]> {
    try {
      console.log('Fetching suppliers with user details...');
      
      // First, test if we can access the user service at all
      try {
        const currentUser = await userService.getCurrentUser();
        console.log('Current user access test successful:', currentUser);
        console.log('Current user role:', currentUser.role);
        
        // Check if current user has admin/manager privileges
        if (currentUser.role?.includes('ADMIN') || currentUser.role?.includes('MANAGER')) {
          console.log('User has admin/manager privileges - should be able to access other users data');
        } else if (currentUser.role?.includes('Store Keeper')) {
          console.log('User has Store Keeper privileges - should be able to access other users data');
        } else {
          console.log('User role may not have sufficient privileges:', currentUser.role);
        }
      } catch (currentUserError) {
        console.error('Current user access test failed:', currentUserError);
        
        // Check if it's an authentication error that requires re-login
        if (currentUserError instanceof Error && 
            (currentUserError.message.includes('login') || 
             currentUserError.message.includes('Authentication') || 
             currentUserError.message.includes('token'))) {
          // Re-throw authentication errors to trigger login flow
          throw currentUserError;
        }
        
        // For other errors, still try to continue but with limited functionality
        console.warn('Continuing with limited user service access');
      }
      
      // Get all suppliers
      const suppliers = await supplierService.getAllSuppliers();
      console.log('Fetched suppliers:', suppliers.length);
      
      // Then, fetch user details for each supplier
      const enhancedSuppliers: EnhancedSupplier[] = await Promise.allSettled(
        suppliers.map(async (supplier): Promise<EnhancedSupplier> => {
          try {
            console.log(`Attempting to fetch user details for supplier ${supplier.supplierId} (userId: ${supplier.userId})`);
            const userDetails = await userService.getUserById(supplier.userId);
            console.log(`Successfully fetched user details for supplier ${supplier.supplierId}`);
            
            return {
              ...supplier,
              userDetails: {
                email: userDetails.email,
                fullName: userDetails.fullName,
                phoneNumber: userDetails.phoneNumber,
                formattedAddress: userDetails.formattedAddress,
                accountStatus: userDetails.accountStatus,
                profileImageUrl: userDetails.profileImageUrl,
              }
            };
          } catch (error) {
            console.warn(`Failed to fetch user details for supplier ${supplier.supplierId} (userId: ${supplier.userId}):`, error);
            // Return supplier without user details if user fetch fails
            return {
              ...supplier,
              userDetails: undefined
            };
          }
        })
      ).then(results => 
        results
          .filter((result): result is PromiseFulfilledResult<EnhancedSupplier> => result.status === 'fulfilled')
          .map(result => result.value)
      );
      
      console.log('Enhanced suppliers with user details:', enhancedSuppliers.length);
      return enhancedSuppliers;
      
    } catch (error) {
      console.error('Failed to fetch suppliers with user details:', error);
      throw new Error('Failed to fetch suppliers with user details - backend not available');
    }
  },

  /**
   * Get supplier by ID with user details
   */
  async getSupplierWithUserDetails(supplierId: string): Promise<EnhancedSupplier> {
    try {
      const supplier = await supplierService.getSupplierById(supplierId);
      
      try {
        const userDetails = await userService.getUserById(supplier.userId);
        
        return {
          ...supplier,
          userDetails: {
            email: userDetails.email,
            fullName: userDetails.fullName,
            phoneNumber: userDetails.phoneNumber,
            formattedAddress: userDetails.formattedAddress,
            accountStatus: userDetails.accountStatus,
            profileImageUrl: userDetails.profileImageUrl,
          }
        };
      } catch (userError) {
        console.warn(`Failed to fetch user details for supplier ${supplierId} (userId: ${supplier.userId}):`, userError);
        // Return supplier without user details if user fetch fails
        return {
          ...supplier,
          userDetails: undefined
        };
      }
      
    } catch (error) {
      console.error('Failed to fetch supplier with user details:', error);
      throw error;
    }
  }
};
