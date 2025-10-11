# Discount System API Documentation

## Overview
The Order Service provides a comprehensive discount management system with separate interfaces for administrators and users. The system supports percentage and fixed amount discounts, order-level and product-specific discounts, with proper usage tracking and validation.

## Base URL
```
http://localhost:8084
```

---

# 🔥 **UPDATED FLOW - Order ID Dependency Resolved**

## **Problem Solved: Chicken-and-Egg Issue**
**Previous Issue**: Discount application required order ID, but order ID was only available after order creation.

**Solution Implemented**: Optional order ID with two modes:
- **Validation Mode** (no orderId): Pre-order discount preview/calculation
- **Apply Mode** (with orderId): Post-order discount application and usage recording

---

# 👨‍💼 **ADMIN APIs**

## Authentication
Admin endpoints use **header-based authentication** with the `Admin-User-Id` header:

- **Required Header**: `Admin-User-Id` (identifies the admin performing the action)
- **Default Value**: `"admin"` (if header not provided)
- **Purpose**: Track which admin user created/modified discounts
- **Security**: Currently no validation - relies on upstream authentication (API Gateway, Load Balancer, etc.)

### 1. Create Discount
```http
POST /api/admin/discounts/create
Content-Type: application/json
Admin-User-Id: john.admin@company.com

{
  "discountCode": "SUMMER25",
  "discountName": "Summer Sale 25% Off",
  "description": "25% discount on summer collection",
  "type": "BILL_DISCOUNT",           // BILL_DISCOUNT or PRODUCT_DISCOUNT
  "discountValue": 25.0,
  "isPercentage": true,              // true for %, false for fixed amount
  "minOrderAmount": 100.0,
  "maxDiscountAmount": 200.0,        // Optional: cap for percentage discounts
  "validFrom": "2025-10-15T00:00:00",
  "validTo": "2025-12-31T23:59:59",
  "maxUsage": 1000,                  // Optional: total usage limit
  "maxUsagePerUser": 3,              // Optional: per-user usage limit
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "discountCode": "SUMMER25",
  "discountName": "Summer Sale 25% Off",
  "description": "25% discount on summer collection",
  "type": "BILL_DISCOUNT",
  "discountValue": 25.0,
  "isPercentage": true,
  "minOrderAmount": 100.0,
  "maxDiscountAmount": 200.0,
  "validFrom": "2025-10-15T00:00:00",
  "validTo": "2025-12-31T23:59:59",
  "maxUsage": 1000,
  "maxUsagePerUser": 3,
  "isActive": true,
  "createdAt": "2025-10-11T09:30:00",
  "createdBy": "john.admin@company.com"
}
```

## Authentication Examples

### ✅ **With Admin Header (Recommended)**
```bash
curl -X POST http://localhost:8084/api/admin/discounts/create \
  -H "Content-Type: application/json" \
  -H "Admin-User-Id: john.admin@company.com" \
  -d '{ "discountCode": "SUMMER25", ... }'

# Result: createdBy = "john.admin@company.com"
```

### ⚠️  **Without Admin Header (Uses Default)**  
```bash
curl -X POST http://localhost:8084/api/admin/discounts/create \
  -H "Content-Type: application/json" \
  -d '{ "discountCode": "SUMMER25", ... }'

# Result: createdBy = "admin" (default value)
```

### 🔒 **Security Notes**
- **Current Implementation**: No authentication validation at service level
- **Recommended Setup**: Use API Gateway or Load Balancer for authentication
- **Header Purpose**: Audit trail and admin user tracking
- **Future Enhancement**: Can add JWT validation or API key authentication

---

### 2. Get All Discounts (Admin View)
```http
GET /api/admin/discounts?page=0&size=10&sortBy=createdAt&sortDir=DESC
Admin-User-Id: john.admin@company.com
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "discountCode": "SUMMER25",
      "discountName": "Summer Sale 25% Off",
      "type": "BILL_DISCOUNT",
      "discountValue": 25.0,
      "isPercentage": true,
      "isActive": true,
      "totalUsageCount": 45,
      "uniqueUsersCount": 38,
      "totalDiscountGiven": 1250.75,
      "validFrom": "2025-10-15T00:00:00",
      "validTo": "2025-12-31T23:59:59"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 10
}
```

### 3. Get Discount by ID
```http
GET /api/admin/discounts/{discountId}
Admin-User-Id: john.admin@company.com
```

### 4. Update Discount
```http
PUT /api/admin/discounts/{discountId}
Content-Type: application/json
Admin-User-Id: john.admin@company.com

{
  "discountName": "Updated Summer Sale 30% Off",
  "discountValue": 30.0,
  "maxDiscountAmount": 300.0,
  "isActive": true
}
```

### 5. Delete Discount
```http
DELETE /api/admin/discounts/{discountId}
Admin-User-Id: john.admin@company.com
```

### 6. Add Products to Product-Specific Discount
```http
POST /api/admin/discounts/{discountId}/products
Content-Type: application/json
Admin-User-Id: john.admin@company.com

{
  "productIds": [1, 2, 3, 4, 5],
  "productBarcodes": ["BAR001", "BAR002", "BAR003"]
}
```

### 7. Remove Products from Discount
```http
DELETE /api/admin/discounts/{discountId}/products
Content-Type: application/json
Admin-User-Id: john.admin@company.com

{
  "productIds": [1, 2],
  "productBarcodes": ["BAR001"]
}
```

### 8. Get Discount Usage Analytics
```http
GET /api/admin/discounts/{discountId}/usage?startDate=2025-10-01&endDate=2025-10-31
Admin-User-Id: john.admin@company.com
```

**Response:**
```json
{
  "discountId": 1,
  "discountCode": "SUMMER25",
  "totalUsages": 45,
  "uniqueUsers": 38,
  "totalDiscountAmount": 1250.75,
  "avgDiscountPerOrder": 27.79,
  "usageByDate": [
    {
      "date": "2025-10-11",
      "usageCount": 5,
      "totalDiscount": 125.50
    }
  ],
  "topUsers": [
    {
      "userId": 123,
      "usageCount": 3,
      "totalDiscount": 85.25
    }
  ]
}
```

---

# 👤 **USER APIs**

## 1. Get Available Discounts
```http
GET /api/discounts/active?type=BILL_DISCOUNT
```

**Response:**
```json
[
  {
    "id": 1,
    "discountCode": "SUMMER25",
    "discountName": "Summer Sale 25% Off", 
    "description": "25% discount on summer collection",
    "type": "BILL_DISCOUNT",
    "discountValue": 25.0,
    "isPercentage": true,
    "minOrderAmount": 100.0,
    "maxDiscountAmount": 200.0,
    "validFrom": "2025-10-15T00:00:00",
    "validTo": "2025-12-31T23:59:59"
  }
]
```

## 2. 🔥 **Validate Discount (Pre-Order Preview)**
**NEW FLOW - Validation Mode**
```http
POST /api/discounts/validate
Content-Type: application/json

{
  "discountCode": "SUMMER25",
  "userId": 123,
  "orderAmount": 150.0,
  "productIds": [1, 2, 3]          // Optional: for product-specific discounts
}
```

**Response:**
```json
{
  "applicable": true,
  "message": "Discount is valid and applicable",
  "originalAmount": 150.0,
  "discountAmount": 37.5,
  "finalAmount": 112.5,
  "discountCode": "SUMMER25",
  "discountName": "Summer Sale 25% Off",
  "discountId": 1
}
```

## 3. 🔥 **Apply Discount (Two Modes)**

### **Mode 1: Validation-Only (Pre-Order Calculation)**
**Use Case**: Show discount preview to user before order creation
```http
POST /api/discounts/apply
Content-Type: application/json

{
  "discountCode": "SUMMER25",
  "userId": 123,
  "orderAmount": 150.0,
  "productIds": [1, 2, 3]
  // ❗ NO orderId provided = Validation-only mode
}
```

**Response:**
```json
{
  "applicable": true,
  "message": "Discount applied successfully",
  "originalAmount": 150.0,
  "discountAmount": 37.5,
  "finalAmount": 112.5,
  "discountCode": "SUMMER25",
  "discountName": "Summer Sale 25% Off",
  "discountId": 1
}
```
**Important**: No usage is recorded in database (validation only)

### **Mode 2: Apply Mode (Post-Order Recording)**
**Use Case**: Actually apply discount after order creation
```http
POST /api/discounts/apply
Content-Type: application/json

{
  "discountCode": "SUMMER25",
  "userId": 123,
  "orderId": 1001,              // ✅ orderId provided = Apply mode
  "orderAmount": 150.0,
  "productIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "applicable": true,
  "message": "Discount applied successfully", 
  "originalAmount": 150.0,
  "discountAmount": 37.5,
  "finalAmount": 112.5,
  "discountCode": "SUMMER25",
  "discountName": "Summer Sale 25% Off",
  "discountId": 1
}
```
**Important**: Usage IS recorded in database with orderId linkage

## 4. Get User Discount History
```http
GET /api/discounts/history/{userId}?page=0&size=10
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "discountName": "Summer Sale 25% Off",
      "discountCode": "SUMMER25",
      "orderId": 1001,
      "originalAmount": 150.0,
      "discountAmount": 37.5,
      "finalAmount": 112.5,
      "usedAt": "2025-10-11T09:45:00",
      "discountType": "BILL_DISCOUNT",
      "discountValue": 25.0,
      "wasPercentage": true
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 10
}
```

## 5. Get User Savings Summary
```http
GET /api/discounts/savings/{userId}?startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
```json
{
  "userId": 123,
  "totalSavings": 285.75,
  "totalOrders": 8,
  "avgSavingsPerOrder": 35.72,
  "mostUsedDiscount": {
    "discountCode": "SUMMER25",
    "usageCount": 3,
    "totalSavings": 112.5
  },
  "savingsByMonth": [
    {
      "month": "2025-10",
      "totalSavings": 75.0,
      "orderCount": 2
    }
  ]
}
```

---

# 🔄 **COMPLETE INTEGRATION FLOW**

## **Frontend Integration Example**

### **Step 1: Cart Page - Show Discount Preview**
```javascript
// User enters discount code on cart page
async function previewDiscount(discountCode, userId, cartTotal, productIds) {
  try {
    const response = await fetch('/api/discounts/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        discountCode: discountCode,
        userId: userId,
        orderAmount: cartTotal,
        productIds: productIds
        // ❗ No orderId = Validation-only mode
      })
    });
    
    const result = await response.json();
    
    if (result.applicable) {
      // Show user: "You'll save ₹37.5 with code SUMMER25!"
      updateCartUI(result.originalAmount, result.discountAmount, result.finalAmount);
      return result;
    } else {
      showError(result.message);
      return null;
    }
  } catch (error) {
    console.error('Discount preview failed:', error);
    return null;
  }
}
```

### **Step 2: Order Creation - Use Calculated Amounts**
```javascript
async function createOrder(orderData, appliedDiscount) {
  // Create order with discount amounts calculated in step 1
  const orderPayload = {
    userId: orderData.userId,
    items: orderData.items,
    originalAmount: appliedDiscount ? appliedDiscount.originalAmount : orderData.total,
    discountAmount: appliedDiscount ? appliedDiscount.discountAmount : 0,
    finalAmount: appliedDiscount ? appliedDiscount.finalAmount : orderData.total,
    discountCode: appliedDiscount ? appliedDiscount.discountCode : null
  };
  
  const orderResponse = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  
  const createdOrder = await orderResponse.json();
  
  // Step 3: Record discount usage (if discount was applied)
  if (appliedDiscount) {
    await recordDiscountUsage(appliedDiscount.discountCode, orderData.userId, createdOrder.id, orderPayload);
  }
  
  return createdOrder;
}
```

### **Step 3: Record Discount Usage**
```javascript
async function recordDiscountUsage(discountCode, userId, orderId, orderData) {
  try {
    await fetch('/api/discounts/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        discountCode: discountCode,
        userId: userId,
        orderId: orderId,           // ✅ orderId provided = Apply mode
        orderAmount: orderData.originalAmount,
        productIds: orderData.items.map(item => item.productId)
      })
    });
    
    console.log('Discount usage recorded successfully');
  } catch (error) {
    console.error('Failed to record discount usage:', error);
    // Handle gracefully - order was created successfully
  }
}
```

## **Backend Service Integration Example**
```java
@Service
public class OrderProcessingService {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired  
    private DiscountService discountService;
    
    @Transactional
    public Order processOrderWithDiscount(CreateOrderRequest request) {
        try {
            // Step 1: Create the order
            Order order = orderService.createOrder(request);
            
            // Step 2: Apply discount if provided (record usage)
            if (request.getDiscountCode() != null) {
                ApplyDiscountRequest discountRequest = ApplyDiscountRequest.builder()
                    .discountCode(request.getDiscountCode())
                    .userId(request.getUserId())
                    .orderId(order.getId())  // ✅ Now we have the order ID
                    .orderAmount(request.getOriginalAmount())
                    .productIds(request.getProductIds())
                    .build();
                
                // This will record the discount usage
                discountService.applyDiscountToOrder(
                    discountRequest.getDiscountId(),
                    discountRequest.getUserId(), 
                    discountRequest.getOrderId(),
                    discountRequest.getOrderAmount(),
                    request.getDiscountAmount()
                );
            }
            
            return order;
        } catch (Exception e) {
            throw new RuntimeException("Order processing failed: " + e.getMessage());
        }
    }
}
```

---

# 📊 **Response Formats**

## Success Response
```json
{
  "applicable": true,
  "message": "Discount applied successfully",
  "originalAmount": 150.0,
  "discountAmount": 37.5, 
  "finalAmount": 112.5,
  "discountCode": "SUMMER25",
  "discountName": "Summer Sale 25% Off",
  "discountId": 1
}
```

## Error Responses

### Invalid Discount Code
```json
HTTP 400 Bad Request
{
  "error": "Invalid or expired discount code"
}
```

### User Not Eligible
```json
HTTP 400 Bad Request  
{
  "error": "You are not eligible to use this discount"
}
```

### Minimum Amount Not Met
```json
HTTP 400 Bad Request
{
  "error": "Minimum order amount of ₹100 required for this discount"
}
```

### Usage Limit Exceeded
```json
HTTP 400 Bad Request
{
  "error": "You have reached the maximum usage limit for this discount"
}
```

### No Eligible Products
```json
HTTP 400 Bad Request
{
  "error": "No eligible products in cart for this discount"  
}
```

---

# 🎯 **Key Benefits of Updated Flow**

## ✅ **Problem Resolution**
- **Order ID Dependency**: Completely resolved with optional orderId
- **User Experience**: Smooth discount preview → order creation → usage recording
- **Data Integrity**: No orphaned discount records from failed orders
- **Performance**: Minimal overhead, existing APIs enhanced

## ✅ **Usage Patterns**

### **E-commerce Frontend**
1. Cart page: Validation-only mode for discount preview
2. Checkout: Create order with calculated amounts  
3. Post-order: Record discount usage with order ID

### **Mobile App**
1. Apply discount screen: Show savings preview
2. Payment flow: Process with pre-calculated totals
3. Order confirmation: Link discount to completed order

### **Admin Dashboard** 
1. Real-time discount performance analytics
2. Usage tracking and fraud prevention
3. Customer behavior insights

---

# 🔧 **Testing Examples**

## Test Validation-Only Mode
```bash
curl -X POST http://localhost:8084/api/discounts/apply \
  -H "Content-Type: application/json" \
  -d '{
    "discountCode": "SUMMER25",
    "userId": 123,
    "orderAmount": 150.0
  }'

# Response: Discount calculated, NO usage recorded
```

## Test Apply Mode  
```bash
curl -X POST http://localhost:8084/api/discounts/apply \
  -H "Content-Type: application/json" \
  -d '{
    "discountCode": "SUMMER25", 
    "userId": 123,
    "orderId": 1001,
    "orderAmount": 150.0
  }'

# Response: Discount calculated, usage IS recorded
```

---

# 📋 **Implementation Checklist**

## Frontend Tasks
- [ ] Implement discount preview on cart page
- [ ] Update checkout flow with pre-calculated amounts
- [ ] Add discount usage recording after order creation
- [ ] Handle error cases gracefully
- [ ] Add loading states for discount operations

## Backend Tasks  
- [x] ✅ Update UserDiscountController with optional orderId
- [x] ✅ Test validation-only mode
- [x] ✅ Test apply mode with usage recording
- [x] ✅ Verify error handling
- [x] ✅ Update API documentation

## Testing Tasks
- [x] ✅ Unit tests for both modes
- [x] ✅ Integration tests with order flow
- [x] ✅ Edge case testing (invalid codes, limits, etc.)
- [ ] Load testing for discount preview performance
- [ ] End-to-end user journey testing

This comprehensive API documentation covers the complete discount system with the resolved order ID dependency issue, providing a seamless experience from discount preview through successful order completion.