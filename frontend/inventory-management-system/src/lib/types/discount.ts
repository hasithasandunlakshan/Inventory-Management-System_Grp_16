export interface Discount {
  id?: number;
  discountCode: string;
  discountName: string;
  description: string;
  type: 'BILL_DISCOUNT' | 'PRODUCT_DISCOUNT';
  discountValue: number;
  isPercentage: boolean;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  maxUsage?: number;
  maxUsagePerUser?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  lastUsedAt?: string;
  totalUsageCount?: number;
  uniqueUsersCount?: number;
  totalDiscountGiven?: number;
  associatedProducts?: Array<{
    productId: number;
    productBarcode: string | null;
  }>;
}

export interface CreateDiscountRequest {
  discountCode: string;
  discountName: string;
  description: string;
  type: 'BILL_DISCOUNT' | 'PRODUCT_DISCOUNT';
  discountValue: number;
  isPercentage: boolean;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  maxUsage?: number;
  maxUsagePerUser?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDiscountRequest {
  discountName?: string;
  description?: string;
  discountValue?: number;
  isPercentage?: boolean;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom?: string;
  validTo?: string;
  maxUsage?: number;
  maxUsagePerUser?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface DiscountsResponse {
  content: Discount[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface AddProductsToDiscountRequest {
  productIds?: number[];
  productBarcodes?: string[];
}

export interface RemoveProductsFromDiscountRequest {
  productIds?: number[];
  productBarcodes?: string[];
}

export interface DiscountUsageAnalytics {
  discountId: number;
  discountCode: string;
  totalUsages: number;
  uniqueUsers: number;
  totalDiscountAmount: number;
  avgDiscountPerOrder: number;
  usageByDate: UsageByDate[];
  topUsers: TopUser[];
}

export interface UsageByDate {
  date: string;
  usageCount: number;
  totalDiscount: number;
}

export interface TopUser {
  userId: number;
  usageCount: number;
  totalDiscount: number;
}

export interface Product {
  productId: number;
  name: string;
  description: string;
  imageUrl: string;
  stock: number;
  reserved: number;
  availableStock: number;
  price: number;
  barcode: string;
  barcodeImageUrl?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface ProductsResponse {
  success?: boolean;
  message?: string;
  products?: Product[];
  data?: Product[];
}

export interface DiscountProduct {
  id: number;
  productId: number;
  productBarcode: string | null;
  productName: string;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
  category: number | null;
  addedAt: string;
}

export interface DiscountProductsResponse {
  discountId: number;
  discountName: string;
  discountCode: string;
  discountType: string;
  totalProducts: number;
  message: string;
  products: DiscountProduct[];
}
