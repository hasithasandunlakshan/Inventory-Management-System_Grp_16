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
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { supplierService } from '@/lib/services/supplierService';
import {
  PurchaseOrderCreateRequest,
  PurchaseOrderItemCreateRequest,
} from '@/lib/types/supplier';
import { useAuth } from '@/contexts/AuthContext';

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<PurchaseOrderCreateRequest>({
    supplierId: 0,
    date: new Date().toISOString().split('T')[0], // Today's date
    status: 'DRAFT',
    items: [],
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  
  // Item management
  const [newItem, setNewItem] = useState<PurchaseOrderItemCreateRequest>({
    itemId: 0,
    quantity: 1,
    unitPrice: 0,
  });

  // Load suppliers on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSuppliers();
    }
  }, [isAuthenticated]);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const suppliersData = await supplierService.getAllSuppliers();
      setSuppliers(suppliersData);
    } catch (error) {
      setError('Failed to load suppliers');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemInputChange = (field: string, value: string | number) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addItem = () => {
    if (newItem.itemId && newItem.quantity > 0 && newItem.unitPrice >= 0) {
      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), { ...newItem }],
      }));
      
      // Reset new item form
      setNewItem({
        itemId: 0,
        quantity: 1,
        unitPrice: 0,
      });
    }
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || [],
    }));
  };

  const calculateItemTotal = (item: PurchaseOrderItemCreateRequest) => {
    return item.quantity * item.unitPrice;
  };

  const calculateOrderTotal = () => {
    return formData.items?.reduce((total, item) => total + calculateItemTotal(item), 0) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }
    
    if (!formData.items || formData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await purchaseOrderService.createPurchaseOrder(formData);
      
      setSuccess(`Purchase order #${result.id} created successfully!`);
      
      // Redirect to purchase orders list after a short delay
      setTimeout(() => {
        router.push('/suppliers/purchase-orders');
      }, 2000);
      
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create purchase order'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/suppliers/purchase-orders');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to create purchase orders.</p>
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
          Back to Purchase Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
          <p className="text-muted-foreground">
            Add a new purchase order with items
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
            <CardDescription>
              Enter the basic information for the purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select
                  value={formData.supplierId.toString()}
                  onValueChange={(value) => handleInputChange('supplierId', parseInt(value))}
                  disabled={loadingSuppliers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                        {supplier.userName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingSuppliers && (
                  <p className="text-sm text-muted-foreground">Loading suppliers...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Order Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              Add items to this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Item */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Add New Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemId">Item ID *</Label>
                  <Input
                    id="itemId"
                    type="number"
                    placeholder="Enter item ID"
                    value={newItem.itemId || ''}
                    onChange={(e) => handleItemInputChange('itemId', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={newItem.quantity}
                    onChange={(e) => handleItemInputChange('quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter unit price"
                    value={newItem.unitPrice || ''}
                    onChange={(e) => handleItemInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                    ${calculateItemTotal(newItem).toFixed(2)}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={addItem}
                disabled={!newItem.itemId || newItem.quantity <= 0 || newItem.unitPrice < 0}
                className="mt-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Items List */}
            {formData.items && formData.items.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Order Items ({formData.items.length})</h4>
                {formData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <Label className="text-sm text-muted-foreground">Item ID</Label>
                          <div className="font-medium">{item.itemId}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Quantity</Label>
                          <div className="font-medium">{item.quantity}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Unit Price</Label>
                          <div className="font-medium">${item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Total</Label>
                          <div className="font-medium">${calculateItemTotal(item).toFixed(2)}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items added yet. Add items using the form above.</p>
              </div>
            )}

            {/* Order Total */}
            {formData.items && formData.items.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Order Total:</span>
                  <span>${calculateOrderTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
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
            disabled={loading || !formData.supplierId || !formData.items || formData.items.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Purchase Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
