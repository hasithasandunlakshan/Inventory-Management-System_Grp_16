'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { productService } from '@/lib/services/productService';
import { categoryService } from '@/lib/services/categoryService';
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

export default function AddProductPage() {
  const router = useRouter();
  const [newProduct, setNewProduct] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: 0, // Will be set when user selects a category
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

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
    const sigRes = await axios.get(
      'http://localhost:8083/api/cloudinary/signature'
    );
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
    if (newProduct.price < 0) {
      setError('Price must be a positive number');
      setIsSubmitting(false);
      return;
    }
    if (newProduct.stock < 0) {
      setError('Stock must be a positive number');
      setIsSubmitting(false);
      return;
    }
    if (!newProduct.categoryId || newProduct.categoryId === 0) {
      setError('Please select a category for the product');
      setIsSubmitting(false);
      return;
    }

    try {
      await productService.addProduct(newProduct);
      router.push('/products');
    } catch (error) {
      setError('Failed to add product. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 py-10 px-4'>
        <div className='max-w-2xl mx-auto'>
          <Card className='shadow-lg'>
            <CardContent className='flex items-center justify-center py-10'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Loading categories...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className='max-w-2xl mx-auto'>
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Add New Product
            </CardTitle>
            <p className='text-muted-foreground text-sm'>
              Create a new product for your inventory
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {error && (
                <div className='bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded'>
                  <div className='font-semibold'>Error:</div>
                  <div className='text-sm'>{error}</div>
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

              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  onValueChange={handleCategoryChange}
                  value={newProduct.categoryId.toString()}
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
                {!newProduct.categoryId && (
                  <p className='text-sm text-red-600'>
                    Please select a category
                  </p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='price'>Price *</Label>
                  <Input
                    id='price'
                    name='price'
                    type='number'
                    value={newProduct.price}
                    onChange={handleInputChange}
                    min='0'
                    step='0.01'
                    required
                    placeholder='0.00'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='stock'>Stock *</Label>
                  <Input
                    id='stock'
                    name='stock'
                    type='number'
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    min='0'
                    required
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='image'>Product Image</Label>
                <Input
                  id='image'
                  name='image'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                />
                {newProduct.imageUrl && (
                  <Image
                    src={newProduct.imageUrl}
                    alt='Preview'
                    width={128}
                    height={128}
                    className='h-32 mt-2 rounded border'
                  />
                )}
              </div>

              <div className='flex gap-4 pt-4'>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1'
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1'
                  onClick={() => router.push('/products')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
