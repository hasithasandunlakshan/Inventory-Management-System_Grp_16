'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { productService } from '@/lib/services/productService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { CreateProductRequest, Category } from '@/lib/types/product';

interface AddProductClientProps {
  readonly categories: Category[];
}

export default function AddProductClient({
  categories,
}: AddProductClientProps) {
  const router = useRouter();
  const [newProduct, setNewProduct] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: 0,
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setNewProduct(prev => ({
      ...prev,
      categoryId: Number.parseInt(categoryId),
    }));
  };

  const uploadImageToCloudinary = async (file: File) => {
    const productServiceUrl =
      process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';
    const cloudinaryUrl = `${productServiceUrl}/api/cloudinary/signature`;
    const sigRes = await axios.get(cloudinaryUrl);
    const { timestamp, signature, apiKey, cloudName } = sigRes.data;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const cloudinaryUploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const uploadRes = await axios.post(cloudinaryUploadURL, formData);
    return uploadRes.data.secure_url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImageToCloudinary(file);
    setNewProduct(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!newProduct.name.trim()) {
      setError('Product name is required');
      setIsSubmitting(false);
      return;
    }

    if (newProduct.price <= 0) {
      setError('Price must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (newProduct.stock < 0) {
      setError('Stock cannot be negative');
      setIsSubmitting(false);
      return;
    }

    if (newProduct.categoryId === 0) {
      setError('Please select a category');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('newProduct', newProduct);
      await productService.addProduct(newProduct);
      router.push('/products');
    } catch {
      setError('Failed to create product. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto py-8 px-4 max-w-7xl'>
      <Card>
        <CardHeader>
          <CardTitle className='text-3xl font-bold'>Add New Product</CardTitle>
          <p className='text-gray-500 text-sm mt-2'>
            Fill in the details to create a new product
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
                {error}
              </div>
            )}

            {/* Row 1: Product Name and Category */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Product Name *</Label>
                <Input
                  id='name'
                  name='name'
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder='Enter product name'
                  required
                  className='h-11'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='categoryId'>Category *</Label>
                <Select
                  value={newProduct.categoryId.toString()}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className='h-11'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Description (Full Width) */}
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                name='description'
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder='Enter product description'
                className='h-11'
              />
            </div>

            {/* Row 3: Price and Stock */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='price'>Price (LKR) *</Label>
                <Input
                  id='price'
                  name='price'
                  type='number'
                  step='0.01'
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder='0.00'
                  required
                  className='h-11'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='stock'>Stock Quantity *</Label>
                <Input
                  id='stock'
                  name='stock'
                  type='number'
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  placeholder='0'
                  required
                  className='h-11'
                />
              </div>
            </div>

            {/* Row 4: Image Upload */}
            <div className='space-y-2'>
              <Label htmlFor='image'>Product Image</Label>
              <Input
                id='image'
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                className='h-11 cursor-pointer'
              />
              {newProduct.imageUrl && (
                <div className='mt-4 flex justify-center'>
                  <div className='relative w-48 h-48 border-2 border-gray-200 rounded-lg overflow-hidden'>
                    <Image
                      src={newProduct.imageUrl}
                      alt='Product preview'
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-4'>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 h-11 text-sm font-semibold text-white shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                style={{
                  background:
                    'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Product
                  </>
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/products')}
                disabled={isSubmitting}
                className='h-11 px-6 text-sm font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200'
              >
                <X className='w-4 h-4 mr-2' />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
