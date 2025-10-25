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
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { supplierService } from '@/lib/services/supplierService';
import {
  PurchaseOrder,
  PurchaseOrderUpdateRequest,
  PurchaseOrderItem,
  StatusUpdateRequest,
  ReceiveRequest,
} from '@/lib/types/supplier';
import { useAuth } from '@/contexts/AuthContext';

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  
  const orderId = parseInt(params.id as string);
  
  // Form state
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState<PurchaseOrderUpdateRequest>({
    supplierId: 0,
    date: '',
    status: 'DRAFT',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  
  // Status update state
  const [statusUpdate, setStatusUpdate] = useState<StatusUpdateRequest>({
    status: '',
    reason: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Mark received state
  const [receiveData, setReceiveData] = useState<ReceiveRequest>({
    receivedBy: '',
    notes: '',
  });
  const [markingReceived, setMarkingReceived] = useState(false);
  
  // Item management
  const [newItem, setNewItem] = useState<{
    itemId: number;
    quantity: number;
    unitPrice: number;
  }>({
    itemId: 0,
    quantity: 1,
    unitPrice: 0,
  });

  // Load purchase order and suppliers on component mount
  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadPurchaseOrder();
      loadSuppliers();
    }
  }, [isAuthenticated, orderId]);

  const loadPurchaseOrder = async () => {
    try {
      setLoadingOrder(true);
      setError(null);
      const order = await purchaseOrderService.getPurchaseOrderById(orderId);
      setPurchaseOrder(order);
      
      // Populate form data
      setFormData({
        supplierId: order.supplierId,
        date: order.date,
        status: order.status,
      });
      
      // Set status update with current status
      setStatusUpdate({
        status: order.status,
        reason: '',
      });
    } catch (error) {
      setError('Failed to load purchase order');
    } finally {
      setLoadingOrder(false);
    }
  };

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

  const handleStatusUpdateChange = (field: string, value: string) => {
    setStatusUpdate(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReceiveDataChange = (field: string, value: string) => {
    setReceiveData(prev => ({
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

  const addItem = async () => {
    if (newItem.itemId && newItem.quantity > 0 && newItem.unitPrice >= 0) {
      try {
        const items = [{
          itemId: newItem.itemId,
          quantity: newItem.quantity,
          unitPrice: newItem.unitPrice,
        }];
        
        await purchaseOrderService.addPurchaseOrderItems(orderId, items);
        
        // Refresh the purchase order data
        await loadPurchaseOrder();
        
        // Reset new item form
        setNewItem({
          itemId: 0,
          quantity: 1,
          unitPrice: 0,
        });
        
        setSuccess('Item added successfully');
      } catch (error) {
        setError('Failed to add item');
      }
    }
  };

  const removeItem = async (itemId: number) => {
    if (confirm('Are you sure you want to remove this item?')) {
      try {
        await purchaseOrderService.deletePurchaseOrderItem(orderId, itemId);
        await loadPurchaseOrder();
        setSuccess('Item removed successfully');
      } catch (error) {
        setError('Failed to remove item');
      }
    }
  };

  const calculateItemTotal = (item: PurchaseOrderItem) => {
    return item.quantity * item.unitPrice;
  };

  const calculateOrderTotal = () => {
    return purchaseOrder?.items?.reduce((total, item) => total + calculateItemTotal(item), 0) || 0;
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await purchaseOrderService.updatePurchaseOrder(orderId, formData);
      
      setSuccess('Purchase order updated successfully!');
      
      // Refresh the purchase order data
      await loadPurchaseOrder();
      
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update purchase order'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      setError('Please select a status');
      return;
    }

    try {
      setUpdatingStatus(true);
      setError(null);
      setSuccess(null);
      
      await purchaseOrderService.updatePurchaseOrderStatus(orderId, statusUpdate);
      
      setSuccess('Status updated successfully!');
      
      // Refresh the purchase order data
      await loadPurchaseOrder();
      
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update status'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkReceived = async () => {
    try {
      setMarkingReceived(true);
      setError(null);
      setSuccess(null);
      
      await purchaseOrderService.markReceived(orderId, receiveData);
      
      setSuccess('Purchase order marked as received!');
      
      // Refresh the purchase order data
      await loadPurchaseOrder();
      
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to mark as received'
      );
    } finally {
      setMarkingReceived(false);
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
          <p className="text-muted-foreground">Please log in to edit purchase orders.</p>
        </div>
      </div>
    );
  }

  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Purchase Order</h3>
          <p className="text-muted-foreground">Please wait while we load the order details...</p>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Purchase Order Not Found</h3>
          <p className="text-muted-foreground">The requested purchase order could not be found.</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
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
          Back to Purchase Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Purchase Order #{purchaseOrder.id}
          </h1>
          <p className="text-muted-foreground">
            Update purchase order details and manage status
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

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={
              purchaseOrder.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
              purchaseOrder.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
              purchaseOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              purchaseOrder.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
              purchaseOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }>
              {purchaseOrder.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Total: ${calculateOrderTotal().toFixed(2)} | {purchaseOrder.items?.length || 0} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Order Form */}
      <form onSubmit={handleUpdateOrder} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
            <CardDescription>
              Update the basic information for the purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select
                  value={formData.supplierId?.toString() || ''}
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
            </div>
          </CardContent>
        </Card>

        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Update Status
            </CardTitle>
            <CardDescription>
              Change the status of this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status *</Label>
                <Select
                  value={statusUpdate.status}
                  onValueChange={(value) => handleStatusUpdateChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason for status change"
                  value={statusUpdate.reason}
                  onChange={(e) => handleStatusUpdateChange('reason', e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updatingStatus || !statusUpdate.status}
              className="flex items-center gap-2"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Update Status
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mark as Received */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Mark as Received
            </CardTitle>
            <CardDescription>
              Mark this purchase order as received with delivery details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receivedBy">Received By</Label>
                <Input
                  id="receivedBy"
                  placeholder="Enter name of person who received"
                  value={receiveData.receivedBy}
                  onChange={(e) => handleReceiveDataChange('receivedBy', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any notes about the delivery"
                  value={receiveData.notes}
                  onChange={(e) => handleReceiveDataChange('notes', e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleMarkReceived}
              disabled={markingReceived}
              className="flex items-center gap-2"
            >
              {markingReceived ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Received
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Items Management */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              Manage items in this purchase order
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
                    ${(newItem.quantity * newItem.unitPrice).toFixed(2)}
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
            {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Order Items ({purchaseOrder.items.length})</h4>
                {purchaseOrder.items.map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-4">
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
                          <div className="font-medium text-primary">
                            ${item.lineTotal?.toFixed(2) || calculateItemTotal(item).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id!)}
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
                <p>No items in this purchase order.</p>
              </div>
            )}

            {/* Order Total */}
            {purchaseOrder.items && purchaseOrder.items.length > 0 && (
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
            disabled={loading || !formData.supplierId}
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
                Update Purchase Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
