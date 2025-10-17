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
import {
  ArrowLeft,
  Save,
  Package,
  X,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
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
          productService.getProductById(Number.parseInt(productId)),
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
      await productService.updateProduct(
        Number.parseInt(productId),
        updateData
      );
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
    <div className='container mx-auto py-8 px-4 max-w-7xl'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='mb-4 hover:bg-gray-100'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-3xl font-bold flex items-center gap-2'>
            <Package className='h-7 w-7' />
            Edit Product
          </CardTitle>
          <p className='text-gray-500 text-sm mt-2'>
            Update product information and details
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Row 1: Product Name and Category */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Product Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Enter product name'
                  required
                  className='h-11'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={value =>
                    handleInputChange('categoryId', Number.parseInt(value))
                  }
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
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder='Enter product description'
                rows={3}
                required
                className='resize-none'
              />
            </div>

            {/* Row 3: Price and Stock */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='price'>Price (LKR) *</Label>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.price}
                  onChange={e =>
                    handleInputChange(
                      'price',
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder='0.00'
                  required
                  className='h-11'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='stock'>Stock Quantity *</Label>
                <Input
                  id='stock'
                  type='number'
                  min='0'
                  value={formData.stock}
                  onChange={e =>
                    handleInputChange(
                      'stock',
                      Number.parseInt(e.target.value) || 0
                    )
                  }
                  placeholder='0'
                  required
                  className='h-11'
                />
              </div>
            </div>

            {/* Row 4: Image Upload */}
            <div className='space-y-2'>
              <Label>Product Image</Label>

              <div className='space-y-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileInput}
                  className='hidden'
                />

                {formData.imageUrl ? (
                  <div className='flex justify-center'>
                    <div className='relative w-48 h-48 border-2 border-gray-200 rounded-lg overflow-hidden'>
                      <Image
                        src={formData.imageUrl}
                        alt='Product preview'
                        fill
                        className='object-cover'
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute top-2 right-2 h-8 w-8 shadow-md'
                        onClick={removeImage}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors'>
                    <ImageIcon className='h-12 w-12 mx-auto text-gray-400 mb-3' />
                    <div className='text-sm text-gray-600 mb-4'>
                      No image selected
                    </div>
                  </div>
                )}

                <div className='flex justify-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className='h-10'
                  >
                    {(() => {
                      if (uploading) {
                        return (
                          <>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Uploading...
                          </>
                        );
                      }
                      if (formData.imageUrl) {
                        return 'Change Image';
                      }
                      return 'Select Image';
                    })()}
                  </Button>
                </div>

                {/* Manual URL Input */}
                <div className='space-y-2'>
                  <Label htmlFor='imageUrl' className='text-xs text-gray-500'>
                    Or enter image URL:
                  </Label>
                  <Input
                    id='imageUrl'
                    value={formData.imageUrl}
                    onChange={e =>
                      handleInputChange('imageUrl', e.target.value)
                    }
                    placeholder='https://example.com/image.jpg'
                    className='text-sm h-10'
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-4'>
              <Button
                type='submit'
                disabled={saving}
                className='flex-1 h-11 text-sm font-semibold text-white shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                style={{
                  background:
                    'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Saving Changes...
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
                disabled={saving}
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
