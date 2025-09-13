export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  reserved: number;
  availableStock: number;
  imageUrl: string;
  barcode: string; // Unique identifier for the product
  barcodeImageUrl: string; // URL for the barcode image
  categoryId?: number;
  categoryName?: string;
  // Additional properties for analytics
  minThreshold?: number;
  unitPrice?: number;
}

export interface Category {
  id: number;
  categoryName: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number; // Required - products must have a category
}

export interface CreateCategoryRequest {
  categoryName: string;
}
