// Based on backend SupplierDTO
export interface Supplier {
  supplierId: number;
  userId: number;
  userName: string;
  categoryId: number;
  categoryName?: string; // Optional field from backend
}

// For creating new suppliers
export interface SupplierCreateRequest {
  userId: number;
  categoryId: number;
}

// Supplier Category types
export interface SupplierCategory {
  categoryId: number;
  name: string;
}

export interface SupplierCategoryCreateRequest {
  name: string;
}

// Purchase Order types based on backend DTOs
export interface PurchaseOrder {
  id: number; // poId
  supplierId: number;
  supplierName: string; // convenience for UI
  date: string; // LocalDate as string (YYYY-MM-DD)
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal?: number;
  total?: number;
}

export interface PurchaseOrderSummary {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string;
  status: PurchaseOrderStatus;
  itemCount?: number;
  total?: number;
}

export interface PurchaseOrderItem {
  id?: number; // line id (null on create)
  itemId: number; // inventory item reference
  quantity: number;
  unitPrice: number;
  lineTotal?: number; // computed on read
}

export interface PurchaseOrderCreateRequest {
  supplierId: number;
  date: string;
  status?: string;
  items?: PurchaseOrderItemCreateRequest[];
}

export interface PurchaseOrderItemCreateRequest {
  itemId: number;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderUpdateRequest {
  supplierId?: number;
  date?: string;
  status?: string;
}

export interface StatusUpdateRequest {
  status: string;
  reason?: string;
}

export interface ReceiveRequest {
  receivedBy?: string;
  notes?: string;
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED', 
  CONFIRMED = 'CONFIRMED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

// Search parameters for purchase orders
export interface PurchaseOrderSearchParams {
  q?: string; // search query
  status?: string;
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// Stats/KPI summary
export interface StatsSummary {
  totalOrders: number;
  totalValue: number;
  pendingOrders: number;
  receivedOrders: number;
}

// Delivery Log types
export interface DeliveryLog {
  id: number;
  purchaseOrderId: number;
  deliveryDate: string;
  receivedBy: string;
  notes?: string;
  status: string;
}

export interface DeliveryLogCreateRequest {
  purchaseOrderId: number;
  deliveryDate: string;
  receivedBy: string;
  notes?: string;
}

// Pagination response wrapper
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
