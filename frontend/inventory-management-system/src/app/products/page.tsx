'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/services/productService';
import { Product } from '@/lib/types/product';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log("fetching")
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   // Filter products based on search term
  //   const filtered = products.filter(product => 
  //     product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     product.description.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   setFilteredProducts(filtered);
  // }, [searchTerm, products]);

const fetchProducts = async () => {
  try {
    const fetchedProducts = await productService.getAllProducts();
    console.log("Fetched products:", fetchedProducts); // <--- Add this
    setProducts(fetchedProducts);
  } catch (error) {
    console.error('Failed to fetch products', error);
  }
};

  const handleDeleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
             No products available
          </p>
        ) : (
          products.map((product,key) => (
            <div 
              key={product.id} 
              className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Price: ${product.price.toFixed(2)}</span>
                  <span>Qty: {product.quantity}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => product.id && handleDeleteProduct(product.id)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}