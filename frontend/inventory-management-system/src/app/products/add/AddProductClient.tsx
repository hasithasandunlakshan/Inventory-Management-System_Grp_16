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
import axios from 'axios';
import { CreateProductRequest, Category } from '@/lib/types/product';

interface AddProductClientProps {
  categories: Category[];
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
      categoryId: parseInt(categoryId),
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
      await productService.addProduct(newProduct);
      router.push('/products');
    } catch {
      setError('Failed to create product. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='name'>Product Name *</Label>
              <Input
                id='name'
                name='name'
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder='Enter product name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                name='description'
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder='Enter product description'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
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
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='categoryId'>Category *</Label>
              <Select
                value={newProduct.categoryId.toString()}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
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

            <div className='space-y-2'>
              <Label htmlFor='image'>Product Image</Label>
              <Input
                id='image'
                type='file'
                accept='image/*'
                onChange={handleImageChange}
              />
              {newProduct.imageUrl && (
                <div className='mt-2'>
                  <Image
                    src={newProduct.imageUrl}
                    alt='Product preview'
                    width={200}
                    height={200}
                    className='rounded-lg object-cover'
                  />
                </div>
              )}
            </div>

            <div className='flex gap-4'>
              <Button type='submit' disabled={isSubmitting} className='flex-1'>
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/products')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
