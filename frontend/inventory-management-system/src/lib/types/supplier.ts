// Based on backend SupplierDTO
export interface Supplier {
  supplierId: number;
  userId: number;
  userName: string;
  categoryId: number | null; // Can be null
  categoryName?: string; // Optional field from backend
}

// Enhanced supplier with user details for display
export interface EnhancedSupplier extends Supplier {
  userDetails?: {
    email: string;
    fullName: string;
    phoneNumber?: string;
    formattedAddress?: string;
    accountStatus?: string;
    profileImageUrl?: string;
  };
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
  poNumber?: string | null;
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
  SENT = 'SENT',
  PENDING = 'PENDING', 
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

// Delivery Log types - Updated to match backend response
export interface DeliveryLog {
  id: number;
  itemId: number;
  receivedQuantity: number;
  receivedDate: string; // LocalDate from backend as string
  purchaseOrder?: {
    poId: number;
    // Add other PO fields as needed
  };
  // Computed fields for UI compatibility
  purchaseOrderId?: number; // Derived from purchaseOrder.poId
  deliveryDate?: string;    // Alias for receivedDate
  status?: string;          // You may need to derive this or add to backend
}

export interface DeliveryLogCreateRequest {
  poId: number;
  receivedDate: string;
  itemID: number;
  receivedQuantity: number;
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

// Purchase Order Notes
export interface PurchaseOrderNote {
  id: number;
  poId: number;
  note: string;
  createdBy: string;
  createdDate: string;
  updatedDate?: string;
}

// Purchase Order Attachments
export interface PurchaseOrderAttachment {
  id: number;
  poId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedBy: string;
  uploadedDate: string;
}

// Purchase Order Audit Log
export interface PurchaseOrderAudit {
  id: number;
  poId: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedDate: string;
  description?: string;
}

// Purchase Order Update Request
export interface PurchaseOrderEditRequest {
  supplierName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  status?: PurchaseOrderStatus;
}

// Purchase Order Item Update Request
export interface PurchaseOrderItemUpdateRequest {
  productName?: string;
  quantity?: number;
  unitPrice?: number;
}

// Quantity Update Request
export interface QuantityUpdateRequest {
  quantity: number;
}

// Note Create Request
export interface NoteCreateRequest {
  content: string;
}

// Attachment Create Request
export interface AttachmentCreateRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
}
