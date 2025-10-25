'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Building2,
} from 'lucide-react';
import { supplierService } from '@/lib/services/supplierService';
import { supplierCategoryService } from '@/lib/services/supplierCategoryService';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierCategory } from '@/lib/types/supplier';

interface SupplierUpdateData {
  categoryId: number;
}

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  
  const supplierId = parseInt(params.id as string);
  
  // Form state
  const [formData, setFormData] = useState<SupplierUpdateData>({
    categoryId: 0,
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [supplierName, setSupplierName] = useState<string>('');

  // Load supplier and categories on component mount
  useEffect(() => {
    if (isAuthenticated && supplierId) {
      loadSupplier();
      loadCategories();
    }
  }, [isAuthenticated, supplierId]);

  const loadSupplier = async () => {
    try {
      setLoadingSupplier(true);
      setError(null);
      
      // Get supplier details - we'll need to implement this in the service
      // For now, we'll use a placeholder approach
      const suppliers = await supplierService.getAllSuppliers();
      const supplier = suppliers.find(s => s.supplierId === supplierId);
      
      if (supplier) {
        setSupplierName(supplier.userName || `Supplier ${supplierId}`);
        setFormData({
          categoryId: supplier.categoryId || 0,
        });
      } else {
        setError('Supplier not found');
      }
    } catch (error) {
      setError('Failed to load supplier details');
    } finally {
      setLoadingSupplier(false);
    }
  };

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

  const handleInputChange = (field: keyof SupplierUpdateData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
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
      
      // Update the supplier category using the supplier service
      await supplierService.editSupplierById(supplierId, {
        categoryId: formData.categoryId,
      });
      
      setSuccess('Supplier category updated successfully!');
      
      // Redirect to suppliers list after a short delay
      setTimeout(() => {
        router.push('/suppliers/suppliers');
      }, 2000);
      
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update supplier'
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to edit suppliers.</p>
        </div>
      </div>
    );
  }

  if (loadingSupplier) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Supplier</h3>
          <p className="text-muted-foreground">Please wait while we load the supplier details...</p>
        </div>
      </div>
    );
  }

  if (error && !supplierName) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Supplier Not Found</h3>
          <p className="text-muted-foreground">The requested supplier could not be found.</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suppliers
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Supplier - {supplierName}
          </h1>
          <p className="text-muted-foreground">
            Update supplier category information
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Update Category
            </CardTitle>
            <CardDescription>
              Change the supplier's category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value) => handleInputChange('categoryId', parseInt(value))}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingCategories && (
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              )}
              <p className="text-sm text-muted-foreground">
                Select the new category for this supplier
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.categoryId}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Supplier
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
