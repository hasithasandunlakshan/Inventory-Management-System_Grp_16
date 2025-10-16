'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Package, X, Image as ImageIcon } from 'lucide-react';
import { productService } from '@/lib/services/productService';
import { categoryService } from '@/lib/services/categoryService';
import axios from 'axios';
import { Product, Category, CreateProductRequest } from '@/lib/types/product';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, categoriesData] = await Promise.all([
          productService.getProductById(parseInt(productId)),
          categoryService.getAllCategories(),
        ]);

        setProduct(productData);
        setCategories(categoriesData);

        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          imageUrl: productData.imageUrl,
          categoryId: productData.categoryId || 0,
        });
      } catch {
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
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

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);

      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);

      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl,
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      formData.price <= 0 ||
      formData.stock < 0
    ) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    try {
      setSaving(true);

      const updateData: CreateProductRequest = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        imageUrl: formData.imageUrl,
        categoryId: formData.categoryId,
      };
      await productService.updateProduct(parseInt(productId), updateData);
      toast.success('Product updated successfully');
      router.push('/products');
    } catch {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <Package className='h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse' />
            <p className='text-muted-foreground'>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center'>
          <Package className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
          <h2 className='text-2xl font-bold mb-2'>Product Not Found</h2>
          <p className='text-muted-foreground mb-4'>
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
        <h1 className='text-3xl font-bold'>Edit Product</h1>
        <p className='text-muted-foreground'>
          Update product information and details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Product Name */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Product Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Enter product name'
                  required
                />
              </div>

              {/* Price */}
              <div className='space-y-2'>
                <Label htmlFor='price'>Price *</Label>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.price}
                  onChange={e =>
                    handleInputChange('price', parseFloat(e.target.value) || 0)
                  }
                  placeholder='0.00'
                  required
                />
              </div>

              {/* Stock */}
              <div className='space-y-2'>
                <Label htmlFor='stock'>Stock Quantity *</Label>
                <Input
                  id='stock'
                  type='number'
                  min='0'
                  value={formData.stock}
                  onChange={e =>
                    handleInputChange('stock', parseInt(e.target.value) || 0)
                  }
                  placeholder='0'
                  required
                />
              </div>

              {/* Category */}
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={value =>
                    handleInputChange('categoryId', parseInt(value))
                  }
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
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder='Enter product description'
                rows={4}
                required
              />
            </div>

            {/* Image Upload */}
            <div className='space-y-2'>
              <Label>Product Image</Label>

              {/* Image Upload Area */}
              <div className='space-y-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileInput}
                  className='hidden'
                />

                {formData.imageUrl ? (
                  <div className='space-y-4'>
                    <div className='relative inline-block'>
                      <Image
                        src={formData.imageUrl}
                        alt='Product preview'
                        width={200}
                        height={200}
                        className='w-48 h-48 object-cover rounded-lg mx-auto border'
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute -top-2 -right-2 h-6 w-6'
                        onClick={removeImage}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                    <div className='text-center'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Change Image'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                    <ImageIcon className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                    <div className='text-sm text-gray-600 mb-4'>
                      No image selected
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Select Image'}
                    </Button>
                  </div>
                )}

                {uploading && (
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2' />
                    <div className='text-sm text-gray-600'>
                      Uploading to Cloudinary...
                    </div>
                  </div>
                )}
              </div>

              {/* Manual URL Input */}
              <div className='space-y-2'>
                <Label htmlFor='imageUrl' className='text-sm text-gray-500'>
                  Or enter image URL manually:
                </Label>
                <Input
                  id='imageUrl'
                  value={formData.imageUrl}
                  onChange={e => handleInputChange('imageUrl', e.target.value)}
                  placeholder='https://example.com/image.jpg'
                  className='text-sm'
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-6'>
              <Button type='submit' disabled={saving} className='flex-1'>
                {saving ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                className='flex-1'
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
