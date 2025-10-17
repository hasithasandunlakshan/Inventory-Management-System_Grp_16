'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Truck,
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Building2,
  Tag,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Paperclip,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { deliveryLogService } from '@/lib/services/deliveryLogService';
import { supplierService } from '@/lib/services/supplierService';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';

import { supplierCategoryService } from '@/lib/services/supplierCategoryService';
import { enhancedSupplierService } from '@/lib/services/enhancedSupplierService';
import {
  DeliveryLog,
  EnhancedSupplier,
  SupplierCreateRequest,
  SupplierCategory,
  SupplierCategoryCreateRequest,
  PurchaseOrderSummary,
  PurchaseOrderStatus,
  PurchaseOrderCreateRequest,
  PurchaseOrder,
  PurchaseOrderNote,
  PurchaseOrderAttachment,
  PurchaseOrderAudit,
  PurchaseOrderItem,
  NoteCreateRequest,
} from '@/lib/types/supplier';
import { useAuth } from '@/contexts/AuthContext';
import { PurchaseOrderStats } from '@/components/PurchaseOrderStats';
import { SupplierPageStats } from '@/components/SupplierPageStats';
import { userService, UserInfo } from '@/lib/services/userService';
import { getDistinctColor } from '@/lib/utils/color/colorUtils';

// Define DeliveryLogCreateRequest to match the imported type
interface DeliveryLogCreateRequest {
  poId: number;
  itemID: number;
  receivedDate: string;
  receivedQuantity: number;
}

// Main component wrapped with authentication
function PurchaseOrdersPageContent() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderSummary[]>(
    []
  );
  const [orderTotals, setOrderTotals] = useState<Map<number, number>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState<PurchaseOrderNote[]>([]);
  const [orderAttachments, setOrderAttachments] = useState<
    PurchaseOrderAttachment[]
  >([]);
  const [orderAudit, setOrderAudit] = useState<PurchaseOrderAudit[]>([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  // Handler to view purchase order details
  const handleViewOrder = async (orderId: number) => {
    try {
      setLoadingOrderDetails(true);

      // Fetch purchase order details and all additional information in parallel
      const [orderDetails, notes, attachments, audit] = await Promise.all([
        purchaseOrderService.getPurchaseOrderById(orderId),
        purchaseOrderService.getPurchaseOrderNotes(orderId),
        purchaseOrderService.getPurchaseOrderAttachments(orderId),
        purchaseOrderService.getPurchaseOrderAudit(orderId),
      ]);

      setSelectedPurchaseOrder(orderDetails);
      setOrderNotes(notes);
      setOrderAttachments(attachments);
      setOrderAudit(audit);
      setIsViewOrderOpen(true);
    } catch (error) {
      setError('Failed to load purchase order details');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Handler to download attachment
  const handleDownloadAttachment = async (
    attachmentId: number,
    filename: string
  ) => {
    if (!selectedPurchaseOrder) return;

    try {
      await purchaseOrderService.downloadAttachment(
        selectedPurchaseOrder.id,
        attachmentId,
        filename
      );
    } catch (error) {
      setError('Failed to download attachment');
    }
  };

  // Handler to delete purchase order
  const handleDeleteOrder = async (orderId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this purchase order? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      await purchaseOrderService.deletePurchaseOrder(orderId);

      // Refresh the purchase orders list
      await loadPurchaseOrders();

      // Show success message (you might want to add a toast notification here)
    } catch (error) {
      setError('Failed to delete purchase order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  // Handler for importing purchase orders
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Debug: Read the file content to see what we're actually sending
    const text = await file.text();
    // Reset any previous success message
    setImportSuccess(null);

    try {
      setImporting(true);
      const result = await purchaseOrderService.importPurchaseOrders(file);
      // Show success if any orders were created
      if (result.created > 0) {
        setImportSuccess(
          `Successfully imported ${result.created} purchase orders${result.failed ? ` (${result.failed} failed)` : ''}`
        );
        // Refresh the purchase orders list
        await loadPurchaseOrders();
      } else {
        setError(
          `Import failed: No orders were created. ${result.failed ? `${result.failed} rows failed validation.` : ''}`
        );
      }

      // Show errors/warnings if any
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error, index) => {});

        const errorMessages = result.errors.slice(0, 3).join('; ');
        if (result.created === 0) {
          // Check if it's a header format error and provide helpful message
          const isHeaderError = result.errors.some(error =>
            error.includes('Invalid header')
          );
          if (isHeaderError) {
            setError(
              `Import failed: CSV format error. The file has quotes around fields or extra columns. Please download the template file and save it as plain CSV without quotes. Expected format: tempKey,supplierId,date,status,itemId,quantity,unitPrice`
            );
          } else {
            setError(`Import failed: ${errorMessages}`);
          }
        } else {
          // Just show as info if some succeeded
        }
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to import purchase orders'
      );
    } finally {
      setImporting(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  // Handler for exporting purchase orders
  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      setExporting(true);
      const blob = await purchaseOrderService.exportPurchaseOrders(format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export purchase orders');
    } finally {
      setExporting(false);
    }
  };

  // Handler for downloading import template
  const handleDownloadTemplate = () => {
    // Create template with exact format the backend expects (no quotes, no extra columns)
    const template = `tempKey,supplierId,date,status,itemId,quantity,unitPrice
B,1,2025-09-11,DRAFT,1001,5,25.00
B,1,2025-09-11,DRAFT,1002,3,15.00
C,2,2025-09-12,SENT,2001,10,30.00`;

    // Create blob with explicit UTF-8 encoding without BOM
    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'purchase-orders-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handler to edit purchase order
  const handleEditOrder = async (orderId: number) => {
    try {
      setLoadingOrderDetails(true);
      const orderDetails =
        await purchaseOrderService.getPurchaseOrderById(orderId);
      setEditingPurchaseOrder(orderDetails);
      setIsEditOrderOpen(true);
    } catch (error) {
      setError('Failed to load purchase order for editing');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const loadPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const orders = await purchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(orders);

      // Load totals for each order
      await loadOrderTotals(orders);
    } catch (error) {
      setError('Failed to load purchase orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load purchase orders when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadPurchaseOrders();
    } else {
      setPurchaseOrders([]);
      setError(null);
    }
  }, [isAuthenticated, loadPurchaseOrders]);

  // Auto-clear import success message after 5 seconds
  useEffect(() => {
    if (importSuccess) {
      const timer = setTimeout(() => {
        setImportSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccess]);

  const loadOrderTotals = async (orders: PurchaseOrderSummary[]) => {
    try {
      setLoadingTotals(true);
      const totalsMap = new Map<number, number>();

      // Load totals for each order in parallel
      await Promise.all(
        orders.map(async order => {
          try {
            const totalResponse =
              await purchaseOrderService.getPurchaseOrderTotal(order.id);
            totalsMap.set(order.id, totalResponse.total);
          } catch (error) {
            console.error(`Failed to load total for order ${order.id}:`, error);
            totalsMap.set(order.id, 0);
          }
        })
      );

      setOrderTotals(totalsMap);
    } catch (error) {
      console.error('Failed to load order totals:', error);
    } finally {
      setLoadingTotals(false);
    }
  };

  // Filter purchase orders based on search and filter criteria
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch =
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter || statusFilter === 'all' || order.status === statusFilter;
    const matchesSupplier =
      !supplierFilter ||
      supplierFilter === 'all' ||
      order.supplierName === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Get unique suppliers for filter dropdown
  const uniqueSuppliers = Array.from(
    new Set(purchaseOrders.map(order => order.supplierName))
  ).sort();

  // Get status options
  const statusOptions = [
    'DRAFT',
    'SENT',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Purchase Orders</h1>
          <p className='text-muted-foreground'>
            Manage and track purchase orders
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => setIsAddOrderOpen(true)}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <PurchaseOrderStats />

      {/* Import/Export Success Messages */}
      {importSuccess && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertTitle>Import Successful</AlertTitle>
          <AlertDescription>{importSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='search'>Search</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  id='search'
                  placeholder='Search orders...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status-filter'>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All statuses</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='supplier-filter'>Supplier</Label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All suppliers' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All suppliers</SelectItem>
                  {uniqueSuppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Actions</Label>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleDownloadTemplate}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  Template
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  {exporting ? 'Exporting...' : 'Export Excel'}
                </Button>
                <label className='cursor-pointer'>
                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                    className='flex items-center gap-2'
                  >
                    <span>
                      <Upload className='h-4 w-4' />
                      {importing ? 'Importing...' : 'Import'}
                    </span>
                  </Button>
                  <input
                    type='file'
                    accept='.csv'
                    onChange={handleImport}
                    className='hidden'
                    disabled={importing}
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} of {purchaseOrders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='text-lg'>Loading purchase orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className='text-center py-8'>
              <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                No purchase orders found
              </h3>
              <p className='text-muted-foreground mb-4'>
                {purchaseOrders.length === 0
                  ? 'Get started by creating your first purchase order.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {purchaseOrders.length === 0 && (
                <Button onClick={() => setIsAddOrderOpen(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Purchase Order
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredOrders.map(order => {
                const total = orderTotals.get(order.id) || 0;
                const statusColorMap = {
                  DRAFT: 'bg-gray-100 text-gray-800',
                  SENT: 'bg-blue-100 text-blue-800',
                  CONFIRMED: 'bg-yellow-100 text-yellow-800',
                  SHIPPED: 'bg-purple-100 text-purple-800',
                  DELIVERED: 'bg-green-100 text-green-800',
                  CANCELLED: 'bg-red-100 text-red-800',
                };
                const statusColor =
                  statusColorMap[order.status as keyof typeof statusColorMap] ||
                  'bg-gray-100 text-gray-800';

                return (
                  <div
                    key={order.id}
                    className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='font-semibold text-lg'>
                            Order #{order.id}
                          </h3>
                          <Badge className={statusColor}>{order.status}</Badge>
                          {loadingTotals ? (
                            <div className='text-sm text-muted-foreground'>
                              Loading total...
                            </div>
                          ) : (
                            <div className='text-sm font-medium'>
                              Total: ${total.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4' />
                            <span>{order.supplierName}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Package className='h-4 w-4' />
                            <span>{order.itemCount} items</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewOrder(order.id)}
                          disabled={loadingOrderDetails}
                        >
                          <Eye className='h-4 w-4 mr-1' />
                          View
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditOrder(order.id)}
                          disabled={loadingOrderDetails}
                        >
                          <Edit className='h-4 w-4 mr-1' />
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                        >
                          {deletingOrderId === order.id ? (
                            <div className='h-4 w-4 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
                          ) : (
                            <Trash2 className='h-4 w-4 mr-1' />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Sheet */}
      {selectedPurchaseOrder && (
        <Sheet open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
          <SheetContent className='w-full sm:max-w-2xl overflow-y-auto'>
            <SheetHeader>
              <SheetTitle>
                Purchase Order #{selectedPurchaseOrder.id}
              </SheetTitle>
              <SheetDescription>
                View and manage purchase order details
              </SheetDescription>
            </SheetHeader>

            <div className='space-y-6 mt-6'>
              {/* Order Details */}
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <Label>Supplier Name</Label>
                  <div className='text-sm font-medium'>
                    {selectedPurchaseOrder.supplierName}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className='text-sm font-medium'>
                    {selectedPurchaseOrder.status}
                  </div>
                </div>
                <div>
                  <Label>Date</Label>
                  <div className='text-sm font-medium'>
                    {new Date(selectedPurchaseOrder.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Additional Information Tabs */}
              <div className='mt-6'>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-semibold mb-2'>
                      Notes ({orderNotes.length})
                    </h4>
                    <div className='space-y-2'>
                      {orderNotes.map(note => (
                        <div key={note.id} className='p-3 border rounded-lg'>
                          <div className='flex justify-between items-start mb-2'>
                            <span className='text-sm font-medium'>
                              {note.createdBy || 'Unknown'}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className='text-sm'>{note.text || 'No content'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-semibold mb-2'>
                      Attachments ({orderAttachments.length})
                    </h4>
                    <div className='space-y-2'>
                      {orderAttachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between p-3 border rounded-lg'
                        >
                          <div className='flex items-center gap-2'>
                            <Paperclip className='h-4 w-4' />
                            <span className='text-sm'>
                              {attachment.filename}
                            </span>
                          </div>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleDownloadAttachment(
                                attachment.id,
                                attachment.filename
                              )
                            }
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-semibold mb-2'>
                      Audit Log ({orderAudit.length})
                    </h4>
                    <div className='space-y-2'>
                      {orderAudit.map((audit, index) => (
                        <div key={index} className='p-3 border rounded-lg'>
                          <div className='flex justify-between items-start mb-2'>
                            <span className='text-sm font-medium'>
                              {audit.action}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {new Date(audit.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {audit.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return <PurchaseOrdersPageContent />;
}
