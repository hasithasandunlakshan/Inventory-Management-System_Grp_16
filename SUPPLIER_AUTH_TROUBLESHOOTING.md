# Supplier Service Authentication Troubleshooting Guide

## Issue Summary

The suppliers page is showing 403 Forbidden errors when trying to access `/api/secure/user/current`, preventing the supplier list from loading.

## Quick Fixes Applied

### 1. Enhanced Error Handling

- **UserService**: Added token validation and expiration checks
- **EnhancedSupplierService**: Better authentication error handling
- **AuthContext**: Token validation on app startup
- **Suppliers Page**: Improved error messages with login prompts

### 2. Debug Tools Added

- **AuthDebug Utility**: Added comprehensive authentication debugging
- **Development Debug Button**: Click "🔧 Debug Auth" button (only visible in development mode)
- **Enhanced Error Messages**: Authentication errors now prompt for login

## Testing Steps

### Step 1: Check Backend Services

```bash
# Ensure API Gateway is running
curl -I http://localhost:8090

# Should return HTTP/1.1 404 (which is expected for root endpoint)
# If connection refused, start the backend services
```

### Step 2: Start Backend Services (if not running)

```bash
# Navigate to backend directory
cd /Users/gayathriharshila/train-passenger-counter/Inventory-Management-System_Grp_16/backend

# Start each service in separate terminals:

# Terminal 1: API Gateway
cd ApiGateway
./mvnw spring-boot:run

# Terminal 2: User Service
cd userservice
./mvnw spring-boot:run

# Terminal 3: Supplier Service
cd supplierservice
./mvnw spring-boot:run

# Terminal 4: Product Service (if needed)
cd productservice
./mvnw spring-boot:run
```

### Step 3: Check Authentication in Browser

1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Check localStorage for:
   - `inventory_auth_token`
   - `inventory_user_info`

### Step 4: Use Debug Tools

1. **In Development Mode**: Click the "🔧 Debug Auth" button on the suppliers page
2. **In Browser Console**: Run `authDebug.debugAll()`
3. **Check Token**: Run `authDebug.checkAuthStatus()`
4. **Test API**: Run `authDebug.testApiEndpoint('/api/secure/user/current')`

### Step 5: Manual Login Test

If authentication is expired or missing:

1. Click "Login Now" button in the error message
2. Or click user avatar in top-right corner
3. Login with valid credentials
4. Page should automatically reload supplier data

## Common Issues & Solutions

### Issue: "Authentication token expired"

**Solution**: Clear browser storage and login again

```javascript
// In browser console
localStorage.clear();
// Then refresh page and login
```

### Issue: "Backend not available"

**Solution**: Ensure all backend services are running

- API Gateway: Port 8090
- User Service: Check if it's running
- Supplier Service: Check if it's running

### Issue: "403 Forbidden"

**Solution**: Check user role permissions

- User must have "Store Keeper", "MANAGER", or "ADMIN" role
- Check token payload with debug tools

### Issue: JWT Token Invalid

**Solution**:

1. Check token format in localStorage
2. Verify token hasn't been corrupted
3. Clear and re-authenticate

## API Endpoints Being Used

- `GET /api/secure/user/current` - Get current user (requires auth)
- `GET /api/secure/user/{id}` - Get user by ID (requires auth)
- `GET /api/admin/user/{id}` - Admin access to user (requires admin role)
- `GET /api/suppliers/enhanced` - Get suppliers with user details

## Files Modified

- `src/lib/services/userService.ts` - Enhanced token validation
- `src/lib/services/enhancedSupplierService.ts` - Better error handling
- `src/contexts/AuthContext.tsx` - Token validation on startup
- `src/app/operations/suppliers/page.tsx` - Improved error UI
- `src/lib/utils/authDebug.ts` - New debugging utility

## Next Steps

1. Test the login flow
2. Verify backend services are running
3. Check user permissions
4. Use debug tools to troubleshoot any remaining issues
