export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  barcode: string; // Unique identifier for the product
  barcodeImageUrl: string; // URL for the barcode image
}