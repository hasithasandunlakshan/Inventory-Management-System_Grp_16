'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';
import { supplierService } from '@/lib/services/supplierService';
import { supplierCategoryService } from '@/lib/services/supplierCategoryService';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierCategory } from '@/lib/types/supplier';

interface SupplierFormData {
  userId: number;
  categoryId: number;
}

export default function AddSupplierPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState<SupplierFormData>({
    userId: 0,
    categoryId: 0,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await supplierCategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load supplier categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (
    field: keyof SupplierFormData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.userId) {
      setError('User ID is required');
      return false;
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create the supplier using the supplier service
      const supplierData = {
        userId: formData.userId,
        categoryId: formData.categoryId,
      };

      await supplierService.createSupplier(supplierData);

      setSuccess('Supplier created successfully!');

      // Redirect to suppliers list after a short delay
      setTimeout(() => {
        router.push('/suppliers/suppliers');
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to create supplier'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/suppliers/suppliers');
  };

  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            Authentication Required
          </h3>
          <p className='text-muted-foreground'>
            Please log in to create suppliers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleBack}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Suppliers
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Add New Supplier
          </h1>
          <p className='text-muted-foreground'>
            Create a new supplier account with contact information
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='h-5 w-5' />
              Supplier Information
            </CardTitle>
            <CardDescription>Enter the supplier details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='userId'>User ID *</Label>
                <Input
                  id='userId'
                  type='number'
                  placeholder='Enter user ID'
                  value={formData.userId || ''}
                  onChange={e =>
                    handleInputChange('userId', parseInt(e.target.value) || 0)
                  }
                  required
                />
                <p className='text-sm text-muted-foreground'>
                  Enter the ID of the user to be assigned as a supplier
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={value =>
                    handleInputChange('categoryId', parseInt(value))
                  }
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem
                        key={category.categoryId}
                        value={category.categoryId.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingCategories && (
                  <p className='text-sm text-muted-foreground'>
                    Loading categories...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className='flex items-center justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={handleBack}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={loading || !formData.userId || !formData.categoryId}
            className='flex items-center gap-2'
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Create Supplier
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
