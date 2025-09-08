export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  reserved: number;
  availableStock: number;
  imageUrl: string;
  barcode: string; // Unique identifier for the product
  barcodeImageUrl: string; // URL for the barcode image
}

export interface ProductWithCategory {
  productId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  reserved: number;
  availableStock: number;
  imageUrl: string;
  barcode: string;
  barcodeImageUrl: string;
  categoryId?: number;
  categoryName?: string;
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
  categoryId?: number;
}

export interface CreateCategoryRequest {
  categoryName: string;
}