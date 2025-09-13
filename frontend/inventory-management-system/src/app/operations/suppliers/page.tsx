'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { getDistinctColor } from '@/lib/utils/colorUtils';

// Define DeliveryLogCreateRequest to match the imported type
interface DeliveryLogCreateRequest {
  poId: number;
  itemID: number;
  receivedDate: string;
  receivedQuantity: number;
}

// Main component wrapped with authentication
function SuppliersPageContent() {
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddPurchaseOrderOpen, setIsAddPurchaseOrderOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { isAuthenticated, isLoading } = useAuth();

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsSheetOpen(true);
  };

  // Remove handleLoginClick as authentication is now handled by middleware

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Supplier Management
          </h1>
          <p className='text-muted-foreground'>
            Manage suppliers, purchase orders, and delivery logistics
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            disabled={!isAuthenticated}
            onClick={() => setIsAddPurchaseOrderOpen(true)}
          >
            <Plus className='mr-2 h-4 w-4' />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <SupplierPageStats refreshTrigger={refreshTrigger} />

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='purchase-orders'>Purchase Orders</TabsTrigger>
          <TabsTrigger value='suppliers'>Suppliers</TabsTrigger>
          <TabsTrigger value='delivery-logs'>Delivery Logs</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='purchase-orders' className='space-y-4'>
          <PurchaseOrdersTab refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value='suppliers' className='space-y-4'>
          <SuppliersTab
            onViewSupplier={handleViewSupplier}
            onAddSupplier={() => setIsAddSupplierOpen(true)}
            onAddCategory={() => setIsAddCategoryOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value='delivery-logs' className='space-y-4'>
          <DeliveryLogsTab />
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      {/* Supplier Details Sheet */}
      <SupplierDetailsSheet
        supplier={selectedSupplier}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      {/* Add Supplier Sheet */}
      <AddSupplierSheet
        isOpen={isAddSupplierOpen}
        onOpenChange={setIsAddSupplierOpen}
        onSupplierAdded={() => {
          // Trigger refresh of suppliers list
          setRefreshTrigger(prev => prev + 1);
          setIsAddSupplierOpen(false);
        }}
      />

      {/* Add Purchase Order Sheet */}
      <AddPurchaseOrderSheet
        isOpen={isAddPurchaseOrderOpen}
        onOpenChange={setIsAddPurchaseOrderOpen}
        onPurchaseOrderAdded={() => {
          // Trigger refresh of purchase orders
          setRefreshTrigger(prev => prev + 1);
          setIsAddPurchaseOrderOpen(false);
        }}
      />

      {/* Add Category Sheet */}
      <AddCategorySheet
        isOpen={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onCategoryAdded={() => {
          // Trigger refresh of categories in AddSupplier sheet
          setRefreshTrigger(prev => prev + 1);
          setIsAddCategoryOpen(false);
        }}
      />
    </div>
  );
}

// Export the main component - authentication is handled by Next.js middleware
export default function SuppliersPage() {
  return <SuppliersPageContent />;
}

// Purchase Orders Tab Component
function PurchaseOrdersTab({ refreshTrigger }: { refreshTrigger?: number }) {
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
      console.error('Failed to load purchase order details:', error);
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
      console.error('Failed to download attachment:', error);
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
      console.log('Purchase order deleted successfully');
    } catch (error) {
      console.error('Failed to delete purchase order:', error);
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
    console.log(
      '🔍 File content preview (first 200 chars):',
      JSON.stringify(text.substring(0, 200))
    );
    console.log(
      '🔍 File first line bytes:',
      Array.from(text.split('\n')[0]).map(c => c.charCodeAt(0))
    );
    console.log(
      '🔍 Expected header bytes:',
      Array.from(
        'tempKey,supplierId,date,status,itemId,quantity,unitPrice'
      ).map(c => c.charCodeAt(0))
    );

    // Reset any previous success message
    setImportSuccess(null);

    try {
      setImporting(true);
      const result = await purchaseOrderService.importPurchaseOrders(file);

      console.log('📊 Import result details:', {
        created: result.created,
        failed: result.failed,
        hasErrors: result.errors && result.errors.length > 0,
        errors: result.errors,
        errorCount: result.errors?.length || 0,
      });

      // Show success if any orders were created
      if (result.created > 0) {
        setImportSuccess(
          `Successfully imported ${result.created} purchase orders${result.failed ? ` (${result.failed} failed)` : ''}`
        );
        // Refresh the purchase orders list
        await loadPurchaseOrders();
      } else {
        console.warn('⚠️ No orders were created during import');
        setError(
          `Import failed: No orders were created. ${result.failed ? `${result.failed} rows failed validation.` : ''}`
        );
      }

      // Show errors/warnings if any
      if (result.errors && result.errors.length > 0) {
        console.warn('Import errors/warnings:', result.errors);
        console.warn('🔍 Detailed error analysis:');
        result.errors.forEach((error, index) => {
          console.warn(`   Error ${index + 1}: "${error}"`);
        });

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
          console.info(`Import completed with warnings: ${errorMessages}`);
        }
      }
    } catch (error) {
      console.error('Failed to import purchase orders:', error);
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

      console.log('Purchase orders exported successfully');
    } catch (error) {
      console.error('Failed to export purchase orders:', error);
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
      console.error('Failed to load purchase order for editing:', error);
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
      console.error('Failed to load purchase orders:', error);
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
  }, [isAuthenticated, refreshTrigger, loadPurchaseOrders]);

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

      // Fetch totals for all orders in parallel
      const totalPromises = orders.map(async order => {
        try {
          const totalResponse =
            await purchaseOrderService.getPurchaseOrderTotal(order.id);
          return { id: order.id, total: totalResponse.total };
        } catch (error) {
          console.error(`Failed to fetch total for order ${order.id}:`, error);
          // Return the existing total from the order if API call fails
          return { id: order.id, total: order.total || 0 };
        }
      });

      const results = await Promise.all(totalPromises);

      results.forEach(({ id, total }) => {
        totalsMap.set(id, total);
      });

      setOrderTotals(totalsMap);
    } catch (error) {
      console.error('Failed to load order totals:', error);
      // If loading totals fails, use the totals from the original orders
      const fallbackTotals = new Map<number, number>();
      orders.forEach(order => {
        fallbackTotals.set(order.id, order.total || 0);
      });
      setOrderTotals(fallbackTotals);
    } finally {
      setLoadingTotals(false);
    }
  };

  // Filter purchase orders based on search and filters
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch =
      searchTerm === '' ||
      order.id.toString().includes(searchTerm) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === '' ||
      statusFilter === 'all' ||
      order.status === statusFilter;

    const matchesSupplier =
      supplierFilter === '' ||
      order.supplierName.toLowerCase().includes(supplierFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const getStatusBadgeVariant = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return 'secondary';
      case PurchaseOrderStatus.SENT:
        return 'default';
      case PurchaseOrderStatus.PENDING:
        return 'outline';
      case PurchaseOrderStatus.RECEIVED:
        return 'secondary';
      case PurchaseOrderStatus.CANCELLED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <p className='text-muted-foreground'>
              Please log in to view purchase orders.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Purchase Order Statistics */}
      <PurchaseOrderStats refreshTrigger={refreshTrigger} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find specific purchase orders</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='search'>Search</Label>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Search orders...'
                  className='pl-8'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.DRAFT}>
                    Draft
                  </SelectItem>
                  <SelectItem value={PurchaseOrderStatus.SENT}>Sent</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.PENDING}>
                    Pending
                  </SelectItem>
                  <SelectItem value={PurchaseOrderStatus.RECEIVED}>
                    Received
                  </SelectItem>
                  <SelectItem value={PurchaseOrderStatus.CANCELLED}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='supplier'>Supplier</Label>
              <Input
                id='supplier'
                placeholder='Filter by supplier...'
                value={supplierFilter}
                onChange={e => setSupplierFilter(e.target.value)}
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setSupplierFilter('');
              }}
            >
              <X className='mr-2 h-4 w-4' />
              Clear Filters
            </Button>
            <Button
              variant='outline'
              onClick={loadPurchaseOrders}
              disabled={loading}
            >
              <Filter className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                {loading
                  ? 'Loading purchase orders...'
                  : `${filteredOrders.length} purchase order(s) found`}
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              {importSuccess && (
                <div className='text-sm text-green-600 mr-2'>
                  {importSuccess}
                </div>
              )}

              {/* Import Button */}
              <div className='relative'>
                <input
                  type='file'
                  accept='.csv,.xlsx,.xls'
                  onChange={handleImport}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  disabled={importing}
                />
                <Button
                  variant='outline'
                  size='sm'
                  disabled={importing}
                  title='Import purchase orders from CSV file. Required format: tempKey,supplierId,date,status,itemId,quantity,unitPrice'
                >
                  <Upload className='h-4 w-4 mr-1' />
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </div>

              {/* Download Template Button */}
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDownloadTemplate}
                title='Download CSV template for importing purchase orders'
              >
                <Download className='h-4 w-4 mr-1' />
                Template
              </Button>

              {/* Export Button */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleExport('csv')}
                disabled={exporting}
                title='Export purchase orders to CSV file'
              >
                <Download className='h-4 w-4 mr-1' />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>

              {/* Add Purchase Order Button */}
              <Button onClick={() => setIsAddOrderOpen(true)} size='sm'>
                <Plus className='h-4 w-4 mr-1' />
                Add Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>
                Loading purchase orders...
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>
                {purchaseOrders.length === 0
                  ? 'No purchase orders found.'
                  : 'No purchase orders match your filters.'}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        PO-{order.id.toString().padStart(3, '0')}
                      </span>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {order.supplierName} • {order.itemCount || 0} items
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Date: {formatDate(order.date)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='text-right'>
                      {loadingTotals ? (
                        <div className='text-sm text-muted-foreground'>
                          Loading...
                        </div>
                      ) : (
                        <span className='font-semibold'>
                          {formatCurrency(
                            orderTotals.get(order.id) || order.total || 0
                          )}
                        </span>
                      )}
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      title='View Details'
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      title='Edit Order'
                      onClick={() => handleEditOrder(order.id)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      title='Delete Order'
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deletingOrderId === order.id}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Purchase Order Details Sheet */}
      <Sheet open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
        <SheetContent className='sm:max-w-2xl overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>
              Purchase Order Details - PO-
              {selectedPurchaseOrder?.id?.toString().padStart(3, '0')}
            </SheetTitle>
            <SheetDescription>
              View purchase order information and items
            </SheetDescription>
          </SheetHeader>

          {selectedPurchaseOrder && (
            <div className='space-y-6 mt-6 pb-6'>
              {/* Order Information */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Supplier</Label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedPurchaseOrder.supplierName}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Status</Label>
                  <div className='mt-1'>
                    <Badge
                      variant={getStatusBadgeVariant(
                        selectedPurchaseOrder.status
                      )}
                    >
                      {selectedPurchaseOrder.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Order Date</Label>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(selectedPurchaseOrder.date)}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Total Amount</Label>
                  <p className='text-sm font-semibold'>
                    {formatCurrency(selectedPurchaseOrder.total || 0)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Label className='text-sm font-medium mb-2 block'>Items</Label>
                <div className='space-y-2'>
                  {selectedPurchaseOrder.items &&
                  selectedPurchaseOrder.items.length > 0 ? (
                    selectedPurchaseOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center p-3 border rounded-lg'
                      >
                        <div>
                          <p className='font-medium'>Item ID: {item.itemId}</p>
                          <p className='text-sm text-muted-foreground'>
                            Quantity: {item.quantity} | Unit Price:{' '}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(
                              item.lineTotal || item.quantity * item.unitPrice
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No items found for this order.
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information Tabs */}
              <div className='mt-6'>
                <Tabs defaultValue='notes' className='w-full'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='notes'>
                      Notes ({orderNotes.length})
                    </TabsTrigger>
                    <TabsTrigger value='attachments'>
                      Attachments ({orderAttachments.length})
                    </TabsTrigger>
                    <TabsTrigger value='audit'>
                      Audit Log ({orderAudit.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value='notes'
                    className='space-y-2 mt-4 max-h-80 overflow-y-auto'
                  >
                    {loadingOrderDetails ? (
                      <div className='text-sm text-muted-foreground'>
                        Loading notes...
                      </div>
                    ) : orderNotes.length > 0 ? (
                      <div className='space-y-3'>
                        {orderNotes.map(note => (
                          <div key={note.id} className='p-3 border rounded-lg'>
                            <div className='flex justify-between items-start mb-2'>
                              <span className='text-sm font-medium'>
                                {note.createdBy}
                              </span>
                              <span className='text-xs text-muted-foreground'>
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className='text-sm'>{note.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No notes found for this order.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent
                    value='attachments'
                    className='space-y-2 mt-4 max-h-80 overflow-y-auto'
                  >
                    {loadingOrderDetails ? (
                      <div className='text-sm text-muted-foreground'>
                        Loading attachments...
                      </div>
                    ) : orderAttachments.length > 0 ? (
                      <div className='space-y-3'>
                        {orderAttachments.map(attachment => (
                          <div
                            key={attachment.id}
                            className='p-3 border rounded-lg flex justify-between items-center'
                          >
                            <div className='flex-1'>
                              <p className='text-sm font-medium'>
                                {attachment.filename}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {(attachment.sizeBytes / 1024).toFixed(1)} KB •{' '}
                                {attachment.contentType}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                Uploaded by {attachment.uploadedBy} on{' '}
                                {new Date(
                                  attachment.uploadedAt
                                ).toLocaleDateString()}
                              </p>
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
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No attachments found for this order.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent
                    value='audit'
                    className='space-y-2 mt-4 max-h-80 overflow-y-auto'
                  >
                    {loadingOrderDetails ? (
                      <div className='text-sm text-muted-foreground'>
                        Loading audit log...
                      </div>
                    ) : orderAudit.length > 0 ? (
                      <div className='space-y-3'>
                        {orderAudit.map((audit, i) => (
                          <div key={i} className='p-3 border rounded-lg'>
                            <div className='flex justify-between items-start mb-2'>
                              <span className='text-sm font-medium'>
                                {audit.action}
                              </span>
                              <span className='text-xs text-muted-foreground'>
                                {new Date(audit.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              By: {audit.createdBy}
                            </p>
                            {audit.details && (
                              <p className='text-sm mt-1'>{audit.details}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No audit log entries found for this order.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Purchase Order Sheet */}
      <Sheet open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
        <SheetContent className='w-[800px] sm:w-[800px] overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>Edit Purchase Order</SheetTitle>
            <SheetDescription>
              {editingPurchaseOrder &&
                `Modify details for PO-${editingPurchaseOrder.id.toString().padStart(3, '0')}`}
            </SheetDescription>
          </SheetHeader>
          {editingPurchaseOrder && (
            <div className='pb-6'>
              <EditPurchaseOrderForm
                purchaseOrder={editingPurchaseOrder}
                onSave={loadPurchaseOrders}
                onClose={() => setIsEditOrderOpen(false)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Purchase Order Sheet */}
      <AddPurchaseOrderSheet
        isOpen={isAddOrderOpen}
        onOpenChange={setIsAddOrderOpen}
        onPurchaseOrderAdded={() => {
          loadPurchaseOrders();
          setImportSuccess(null); // Clear any previous import success message
        }}
      />
    </div>
  );
}

// Edit Purchase Order Form Component
function EditPurchaseOrderForm({
  purchaseOrder,
  onSave,
  onClose,
}: {
  purchaseOrder: PurchaseOrder;
  onSave: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth(); // Get current user information
  const [formData, setFormData] = useState({
    supplierName: purchaseOrder.supplierName || '',
    date: purchaseOrder.date || '',
    status: purchaseOrder.status || PurchaseOrderStatus.DRAFT,
  });
  const [items, setItems] = useState<PurchaseOrderItem[]>(
    purchaseOrder.items || []
  );
  const [notes, setNotes] = useState<PurchaseOrderNote[]>([]);
  const [attachments, setAttachments] = useState<PurchaseOrderAttachment[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState(
    user?.fullName || user?.username || 'Unknown User'
  );
  const [saving, setSaving] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const loadNotesAndAttachments = useCallback(async () => {
    try {
      setLoadingNotes(true);
      setLoadingAttachments(true);

      console.log(
        `🔄 Loading notes and attachments for Purchase Order #${purchaseOrder.id}`
      );

      const [notesData, attachmentsData] = await Promise.all([
        purchaseOrderService.getPurchaseOrderNotes(purchaseOrder.id),
        purchaseOrderService.getPurchaseOrderAttachments(purchaseOrder.id),
      ]);

      console.log(
        `📝 Loaded ${notesData.length} notes for PO #${purchaseOrder.id}:`,
        notesData
      );
      console.log(
        `📎 Loaded ${attachmentsData.length} attachments for PO #${purchaseOrder.id}:`,
        attachmentsData
      );

      setNotes(notesData);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Failed to load notes and attachments:', error);
    } finally {
      setLoadingNotes(false);
      setLoadingAttachments(false);
    }
  }, [purchaseOrder.id]); // Only depend on the ID, not the entire object

  // Update uploadedBy when user information changes
  useEffect(() => {
    const newUploadedBy = user?.fullName || user?.username || 'Unknown User';
    console.log('👤 User info changed:', {
      user,
      newUploadedBy,
      fullName: user?.fullName,
      username: user?.username,
      id: user?.id,
    });
    setUploadedBy(newUploadedBy);
  }, [user]);

  // Load notes and attachments on component mount
  useEffect(() => {
    loadNotesAndAttachments();
  }, [loadNotesAndAttachments]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        date: formData.date,
        status: formData.status.toString(),
      };

      console.log('💾 Saving purchase order with data:', {
        purchaseOrderId: purchaseOrder.id,
        updateData,
        originalFormData: formData,
      });

      // Update purchase order details
      await purchaseOrderService.updatePurchaseOrder(
        purchaseOrder.id,
        updateData
      );

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save purchase order:', error);
      alert(
        'Failed to save purchase order. Please check the console for details.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleItemUpdate = async (
    itemId: number,
    updates: Partial<PurchaseOrderItem>
  ) => {
    try {
      await purchaseOrderService.updatePurchaseOrderItem(
        purchaseOrder.id,
        itemId,
        updates as PurchaseOrderItem
      );

      // Update local state
      setItems(
        items.map(item =>
          item.itemId === itemId ? { ...item, ...updates } : item
        )
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleItemDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await purchaseOrderService.deletePurchaseOrderItem(
        purchaseOrder.id,
        itemId
      );
      setItems(items.filter(item => item.itemId !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleQuantityUpdate = async (itemId: number, quantity: number) => {
    try {
      await purchaseOrderService.updateItemQuantity(
        purchaseOrder.id,
        itemId,
        quantity
      );
      setItems(
        items.map(item =>
          item.itemId === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      console.log(
        'Updating status to:',
        status,
        'for order:',
        purchaseOrder.id
      );
      const updatedOrder = await purchaseOrderService.updatePurchaseOrderStatus(
        purchaseOrder.id,
        { status }
      );
      setFormData({ ...formData, status: status as PurchaseOrderStatus });
      console.log('Status updated successfully:', updatedOrder);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Show user-friendly error
      alert('Failed to update status. Please check the console for details.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const userInfo = user?.fullName || user?.username || 'Unknown User';
      console.log('🔍 Creating note with user info:', {
        user,
        userInfo,
        fullName: user?.fullName,
        username: user?.username,
      });

      const noteRequest: NoteCreateRequest = {
        text: newNote.trim(), // Backend expects 'text' property
        createdBy: userInfo,
      };

      console.log('📝 Sending note request:', noteRequest);

      const createdNote = await purchaseOrderService.addNote(
        purchaseOrder.id,
        noteRequest
      );
      console.log('✅ Note created successfully:', createdNote);
      setNotes([...notes, createdNote]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleAddAttachment = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploadingFile(true);
      console.log('📎 Uploading attachment with user info:', {
        user,
        uploadedBy,
        fullName: user?.fullName,
        username: user?.username,
      });

      const createdAttachment = await purchaseOrderService.addAttachment(
        purchaseOrder.id,
        selectedFile,
        uploadedBy
      );
      console.log('✅ Attachment uploaded successfully:', createdAttachment);
      setAttachments([...attachments, createdAttachment]);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        'attachment-file'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      alert('Failed to upload attachment. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadAttachment = async (
    attachmentId: number,
    filename: string
  ) => {
    try {
      await purchaseOrderService.downloadAttachment(
        purchaseOrder.id,
        attachmentId,
        filename
      );
    } catch (error) {
      console.error('Failed to download attachment:', error);
      alert('Failed to download attachment. Please try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='space-y-6 mt-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='details'>Order Details</TabsTrigger>
          <TabsTrigger value='items'>Items ({items.length})</TabsTrigger>
          <TabsTrigger value='notes'>
            <FileText className='h-4 w-4 mr-1' />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value='attachments'>
            <Paperclip className='h-4 w-4 mr-1' />
            Attachments ({attachments.length})
          </TabsTrigger>
          <TabsTrigger value='actions'>Actions</TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            <div>
              <Label>Supplier Name</Label>
              <Input
                value={formData.supplierName}
                disabled
                placeholder='Supplier name (readonly)'
              />
            </div>

            <div>
              <Label htmlFor='date'>Order Date</Label>
              <Input
                id='date'
                type='date'
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => handleStatusUpdate(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DRAFT'>Draft</SelectItem>
                  <SelectItem value='SENT'>Sent</SelectItem>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='RECEIVED'>Received</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='items' className='space-y-4'>
          <div className='space-y-2'>
            {items.map(item => (
              <div key={item.itemId} className='p-3 border rounded-lg'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <p className='font-medium'>Item ID: {item.itemId}</p>
                    <div className='grid grid-cols-2 gap-2 mt-2'>
                      <div>
                        <Label htmlFor={`quantity-${item.itemId}`}>
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${item.itemId}`}
                          type='number'
                          value={item.quantity}
                          onChange={e =>
                            handleQuantityUpdate(
                              item.itemId,
                              parseInt(e.target.value)
                            )
                          }
                          min='1'
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unitPrice-${item.itemId}`}>
                          Unit Price
                        </Label>
                        <Input
                          id={`unitPrice-${item.itemId}`}
                          type='number'
                          value={item.unitPrice}
                          onChange={e =>
                            handleItemUpdate(item.itemId, {
                              unitPrice: parseFloat(e.target.value),
                            })
                          }
                          step='0.01'
                          min='0'
                        />
                      </div>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleItemDelete(item.itemId)}
                    title='Delete Item'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className='text-center text-muted-foreground py-4'>
                No items in this order
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value='notes' className='space-y-4'>
          {/* Add New Note */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Add New Note
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='new-note'>Note Content</Label>
                <Textarea
                  id='new-note'
                  placeholder='Enter your note here...'
                  value={newNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewNote(e.target.value)
                  }
                  className='min-h-[100px]'
                />
              </div>
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                <Send className='h-4 w-4 mr-2' />
                Add Note
              </Button>
            </CardContent>
          </Card>

          {/* Existing Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes History</CardTitle>
              <CardDescription>
                {loadingNotes
                  ? 'Loading notes...'
                  : `${notes.length} note(s) found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNotes ? (
                <div className='text-center py-4'>
                  <div className='animate-pulse'>Loading notes...</div>
                </div>
              ) : notes.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  <FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>No notes added yet</p>
                  <p className='text-xs'>Add your first note above</p>
                </div>
              ) : (
                <div className='space-y-3 max-h-64 overflow-y-auto pr-2'>
                  {notes.map(note => (
                    <div
                      key={note.id}
                      className='p-4 border rounded-lg bg-gray-50'
                    >
                      <div className='flex justify-between items-start mb-3'>
                        <div className='flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-blue-500' />
                          <span className='text-sm font-medium'>
                            Note #{note.id}
                          </span>
                          {note.createdBy && (
                            <Badge variant='outline' className='text-xs'>
                              by {note.createdBy}
                            </Badge>
                          )}
                        </div>
                        <span className='text-xs text-muted-foreground'>
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className='text-sm whitespace-pre-wrap bg-white p-3 rounded border'>
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='attachments' className='space-y-4'>
          {/* Add New Attachment */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Paperclip className='h-5 w-5' />
                Add New Attachment
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <Label htmlFor='attachment-file'>Select File</Label>
                  <Input
                    id='attachment-file'
                    type='file'
                    onChange={handleFileSelect}
                    className='cursor-pointer'
                  />
                  {selectedFile && (
                    <div className='mt-2 text-sm text-muted-foreground'>
                      Selected: {selectedFile.name} (
                      {formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor='uploaded-by'>Uploaded By</Label>
                  <Input
                    id='uploaded-by'
                    placeholder='Current user'
                    value={uploadedBy}
                    readOnly
                    className='bg-muted'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Automatically filled with your user information
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAddAttachment}
                disabled={!selectedFile || uploadingFile}
              >
                <Paperclip className='h-4 w-4 mr-2' />
                {uploadingFile ? 'Uploading...' : 'Upload Attachment'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                {loadingAttachments
                  ? 'Loading attachments...'
                  : `${attachments.length} attachment(s) found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAttachments ? (
                <div className='text-center py-4'>
                  <div className='animate-pulse'>Loading attachments...</div>
                </div>
              ) : attachments.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  <Paperclip className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>No attachments uploaded yet</p>
                  <p className='text-xs'>Upload your first file above</p>
                </div>
              ) : (
                <div className='space-y-3 max-h-64 overflow-y-auto pr-2'>
                  {attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className='p-4 border rounded-lg bg-gray-50'
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-3'>
                            <div className='h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                              <Paperclip className='h-5 w-5 text-blue-600' />
                            </div>
                            <div>
                              <h4 className='font-medium text-sm'>
                                {attachment.filename}
                              </h4>
                              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                <span>#{attachment.id}</span>
                                {attachment.uploadedBy && (
                                  <>
                                    <span>•</span>
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      by {attachment.uploadedBy}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-4 text-xs text-muted-foreground bg-white p-3 rounded border'>
                            <div>
                              <strong>Type:</strong>{' '}
                              {attachment.contentType || 'Unknown'}
                            </div>
                            <div>
                              <strong>Size:</strong>{' '}
                              {formatFileSize(attachment.sizeBytes || 0)}
                            </div>
                            <div>
                              <strong>Uploaded:</strong>{' '}
                              {new Date(
                                attachment.uploadedAt
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Time:</strong>{' '}
                              {new Date(
                                attachment.uploadedAt
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-2 ml-4'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleDownloadAttachment(
                                attachment.id,
                                attachment.filename
                              )
                            }
                            title='View/Download file'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='actions' className='space-y-4'>
          <div className='space-y-2'>
            <Button
              onClick={() =>
                purchaseOrderService.receivePurchaseOrder(purchaseOrder.id, {})
              }
              className='w-full'
            >
              Mark as Received
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className='flex gap-2 pt-4 border-t'>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Suppliers Tab Component
function SuppliersTab({
  onViewSupplier,
  onAddSupplier,
  onAddCategory,
  refreshTrigger,
}: {
  onViewSupplier: (supplier: Supplier) => void;
  onAddSupplier: () => void;
  onAddCategory: () => void;
  refreshTrigger: number;
}) {
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<EnhancedSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load suppliers on component mount and when refresh is triggered
  useEffect(() => {
    loadSuppliers();
  }, [refreshTrigger]);

  const loadSuppliers = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const enhancedSuppliers =
        await enhancedSupplierService.getAllSuppliersWithUserDetails();
      setSuppliers(enhancedSuppliers);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load suppliers:', errorMessage);

      // Check if it's an authentication error that requires re-login
      if (
        errorMessage.includes('login') ||
        errorMessage.includes('Authentication') ||
        errorMessage.includes('token')
      ) {
        setApiError(
          'Authentication expired. Please log in again to access suppliers.'
        );
        // Trigger login modal or redirect to login
        // You could add logic here to automatically open login modal
      } else {
        setApiError(errorMessage);
      }

      // Fall back to empty list for authentication errors, sample data for others
      if (
        errorMessage.includes('login') ||
        errorMessage.includes('Authentication') ||
        errorMessage.includes('token')
      ) {
        setSuppliers([]);
      } else {
        setSuppliers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const convertToDisplaySupplier = (
    enhancedSupplier: EnhancedSupplier
  ): Supplier => ({
    id: enhancedSupplier.supplierId,
    name:
      enhancedSupplier.userName || `Supplier ${enhancedSupplier.supplierId}`,
    category: enhancedSupplier.categoryName || 'Unknown',
    email: enhancedSupplier.userDetails?.email || 'N/A',
    phone: enhancedSupplier.userDetails?.phoneNumber || 'N/A',
    status: 'active', // Default since backend doesn't have this field
    orders: 0, // Backend doesn't track order count in supplier entity
    address: enhancedSupplier.userDetails?.formattedAddress || 'N/A',
    contactPerson:
      enhancedSupplier.userDetails?.fullName ||
      enhancedSupplier.userName ||
      'Unknown',
  });

  // If not authenticated, show sample data
  const displaySuppliers =
    isAuthenticated && suppliers.length > 0
      ? suppliers.map(convertToDisplaySupplier)
      : sampleSuppliers;

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Suppliers Directory</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? 'Manage supplier information and contacts'
                : 'Please log in to view real supplier data'}
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={!isAuthenticated}
              onClick={onAddCategory}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Category
            </Button>
            <Button disabled={!isAuthenticated} onClick={onAddSupplier}>
              <Plus className='mr-2 h-4 w-4' />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-8'>
              <div className='text-lg'>Loading suppliers...</div>
            </div>
          ) : apiError ? (
            <div className='space-y-4'>
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>API Error</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
              <div className='text-sm text-muted-foreground'>
                Showing sample data instead:
              </div>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {sampleSuppliers.map(supplier => (
                  <Card
                    key={supplier.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <CardTitle className='text-lg'>{supplier.name}</CardTitle>
                      <CardDescription>{supplier.category}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Mail className='h-4 w-4 text-muted-foreground' />
                        <p className='text-sm'>{supplier.email}</p>
                      </div>
                      {supplier.phone && (
                        <div className='flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-muted-foreground' />
                          <p className='text-sm'>{supplier.phone}</p>
                        </div>
                      )}
                      {supplier.address && (
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-muted-foreground' />
                          <p className='text-sm text-muted-foreground'>
                            {supplier.address}
                          </p>
                        </div>
                      )}
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm text-muted-foreground'>
                          Contact: {supplier.contactPerson}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 pt-2'>
                        <Badge variant='default'>{supplier.status}</Badge>
                        <span className='text-sm text-muted-foreground'>
                          {supplier.orders} orders
                        </span>
                      </div>
                      <div className='flex gap-2 pt-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => onViewSupplier(supplier)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View
                        </Button>
                        <Button variant='outline' size='sm' className='flex-1'>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {displaySuppliers.map(supplier => (
                <Card
                  key={supplier.id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardHeader>
                    <CardTitle className='text-lg'>{supplier.name}</CardTitle>
                    <CardDescription>{supplier.category}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm'>{supplier.email}</p>
                    </div>
                    {supplier.phone && supplier.phone !== 'N/A' && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <p className='text-sm'>{supplier.phone}</p>
                      </div>
                    )}
                    {supplier.address && supplier.address !== 'N/A' && (
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                        <p className='text-sm text-muted-foreground'>
                          {supplier.address}
                        </p>
                      </div>
                    )}
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        Contact: {supplier.contactPerson}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 pt-2'>
                      <Badge variant='default'>{supplier.status}</Badge>
                      {!isAuthenticated && (
                        <span className='text-sm text-muted-foreground'>
                          {supplier.orders} orders
                        </span>
                      )}
                    </div>
                    <div className='flex gap-2 pt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1'
                        onClick={() => onViewSupplier(supplier)}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        View
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1'
                        disabled={!isAuthenticated}
                      >
                        <Edit className='mr-2 h-4 w-4' />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Delivery Logs Tab Component
function DeliveryLogsTab() {
  const { isAuthenticated, canAccessSupplierService } = useAuth();
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [poFilter, setPoFilter] = useState('');
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [newDeliveryLog, setNewDeliveryLog] =
    useState<DeliveryLogCreateRequest>({
      poId: 0,
      itemID: 0,
      receivedDate: '',
      receivedQuantity: 0,
    });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDeliveryLogs = useCallback(async () => {
    console.log('Loading delivery logs... isAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
      // No data when not authenticated
      console.log('User not authenticated, setting empty arrays');
      setDeliveryLogs([]);
      setFilteredLogs([]);
      return;
    }

    setLoading(true);
    setApiError(null);
    console.log('Making API call to fetch delivery logs...');

    try {
      // Fetch from the actual API with authentication
      const apiLogs = await deliveryLogService.getAllDeliveryLogs();
      console.log('API response received:', apiLogs);
      setDeliveryLogs(apiLogs);
      setFilteredLogs(apiLogs);
    } catch (apiError) {
      const errorMessage =
        apiError instanceof Error ? apiError.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      setApiError(errorMessage);

      // Set empty arrays on API failure
      setDeliveryLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load delivery logs on component mount and when authentication changes
  useEffect(() => {
    loadDeliveryLogs();
  }, [loadDeliveryLogs]);

  // Filter delivery logs by PO ID
  useEffect(() => {
    if (!poFilter) {
      setFilteredLogs(deliveryLogs);
    } else {
      const filtered = deliveryLogs.filter(
        log =>
          log.purchaseOrderId !== undefined &&
          log.purchaseOrderId.toString().includes(poFilter)
      );
      setFilteredLogs(filtered);
    }
  }, [poFilter, deliveryLogs]);

  const handleCreateDeliveryLog = async () => {
    if (
      !newDeliveryLog.poId ||
      !newDeliveryLog.receivedDate ||
      !newDeliveryLog.receivedQuantity
    ) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await deliveryLogService.logDelivery(newDeliveryLog);

      // Show success message from backend response
      setSuccessMessage(response.message);

      // Reload the delivery logs
      await loadDeliveryLogs();

      // Reset form
      setNewDeliveryLog({
        poId: 0,
        itemID: 0,
        receivedDate: '',
        receivedQuantity: 0,
      });

      setIsCreateSheetOpen(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Failed to create delivery log:', error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Failed to create delivery log';
      setErrorMessage(errorMsg);

      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilter = () => {
    setPoFilter('');
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Delivery Tracking</CardTitle>
              <CardDescription>
                Monitor recent shipment status and delivery progress
              </CardDescription>
            </div>
            <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  disabled={!isAuthenticated || !canAccessSupplierService()}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  New Delivery Log
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Create Delivery Log</SheetTitle>
                  <SheetDescription>
                    Record a new delivery for a purchase order
                  </SheetDescription>
                </SheetHeader>
                <div className='grid gap-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='poId'>Purchase Order ID</Label>
                    <Input
                      id='poId'
                      type='number'
                      placeholder='Enter PO ID'
                      value={newDeliveryLog.poId || ''}
                      onChange={e =>
                        setNewDeliveryLog(prev => ({
                          ...prev,
                          poId: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='itemID'>Item ID</Label>
                    <Input
                      id='itemID'
                      type='number'
                      placeholder='Enter Item ID'
                      value={newDeliveryLog.itemID || ''}
                      onChange={e =>
                        setNewDeliveryLog(prev => ({
                          ...prev,
                          itemID: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='receivedDate'>Received Date</Label>
                    <Input
                      id='receivedDate'
                      type='date'
                      value={newDeliveryLog.receivedDate}
                      onChange={e =>
                        setNewDeliveryLog(prev => ({
                          ...prev,
                          receivedDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='receivedQuantity'>Received Quantity</Label>
                    <Input
                      id='receivedQuantity'
                      type='number'
                      placeholder='Enter quantity received'
                      value={newDeliveryLog.receivedQuantity || ''}
                      onChange={e =>
                        setNewDeliveryLog(prev => ({
                          ...prev,
                          receivedQuantity: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleCreateDeliveryLog}
                    disabled={submitting}
                    className='flex-1'
                  >
                    {submitting ? 'Creating...' : 'Create Delivery Log'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreateSheetOpen(false)}
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {/* Success Message */}
          {successMessage && (
            <Alert className='mb-4 border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>Success</AlertTitle>
              <AlertDescription className='text-green-700'>
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Authentication Status */}
          {!isAuthenticated && (
            <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-2 bg-yellow-500 rounded-full'></div>
                <span className='text-sm font-medium text-yellow-800'>
                  Authentication Required
                </span>
              </div>
              <p className='text-sm text-yellow-700 mt-1'>
                Please login to access delivery logs and create new delivery
                entries.
              </p>
            </div>
          )}

          {isAuthenticated && apiError && (
            <div className='mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-2 bg-orange-500 rounded-full'></div>
                <span className='text-sm font-medium text-orange-800'>
                  API Connection Issue
                </span>
              </div>
              <p className='text-sm text-orange-700 mt-1'>
                Using cached data. Some features may be limited. Error:{' '}
                {apiError}
              </p>
            </div>
          )}

          {/* Filter Section */}
          <div className='flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg'>
            <div className='flex-1'>
              <Label htmlFor='poFilter' className='text-sm font-medium'>
                Filter by Purchase Order ID
              </Label>
              <div className='flex gap-2 mt-1'>
                <Input
                  id='poFilter'
                  placeholder='Enter PO ID to filter...'
                  value={poFilter}
                  onChange={e => setPoFilter(e.target.value)}
                  className='flex-1'
                />
                {poFilter && (
                  <Button variant='outline' size='sm' onClick={clearFilter}>
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
            <div className='text-sm text-muted-foreground'>
              Showing {filteredLogs.length} of {deliveryLogs.length} recent logs
            </div>
          </div>

          {/* Delivery Logs List */}
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>
                Loading delivery logs...
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-center'>
                <Package className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
                <div className='text-muted-foreground'>
                  {poFilter
                    ? 'No delivery logs found for the specified PO ID'
                    : 'No recent delivery logs'}
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredLogs.map((log, index) => (
                <div
                  key={`${log.purchaseOrderId}-${log.receivedDate}-${index}`}
                  className='flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow'
                >
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        PO #{log.purchaseOrderId}
                      </span>
                      <Badge
                        variant={getDeliveryStatusVariant(
                          log.status || 'delivered'
                        )}
                      >
                        {log.status || 'delivered'}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Delivery Date:{' '}
                      {new Date(log.receivedDate).toLocaleDateString()}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Item ID: {log.itemId} • Quantity: {log.receivedQuantity}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='sm' title='View Details'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' title='Track Delivery'>
                      <Truck className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  const [supplierCategoryData, setSupplierCategoryData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [supplierSpendData, setSupplierSpendData] = useState<
    Array<{ supplierName: string; spend: number; orders: number }>
  >([]);
  const [poStatusData, setPoStatusData] = useState<
    Array<{ name: string; value: number; color: string; percentage: number }>
  >([]);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState<
    Array<{ month: string; orders: number; spend: number }>
  >([]);
  const [topItemsData, setTopItemsData] = useState<
    Array<{
      itemName: string;
      itemId: number;
      frequency: number;
      totalQuantity: number;
      totalValue: number;
    }>
  >([]);
  const [spendOverTimeData, setSpendOverTimeData] = useState<
    Array<{
      month: string;
      totalSpend: number;
      orderCount: number;
      avgOrderValue: number;
    }>
  >([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingSpend, setLoadingSpend] = useState(true);
  const [loadingPoStatus, setLoadingPoStatus] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingTopItems, setLoadingTopItems] = useState(true);
  const [loadingSpendOverTime, setLoadingSpendOverTime] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalPurchaseOrders, setTotalPurchaseOrders] = useState(0);
  const { isAuthenticated } = useAuth();

  // Load supplier category breakdown
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSupplierCategoryData = async () => {
      try {
        setLoadingCategory(true);
        const [suppliers, categories] = await Promise.all([
          enhancedSupplierService.getAllSuppliersWithUserDetails(),
          supplierCategoryService.getAllCategories(),
        ]);

        // Count suppliers by category with distinct colors using utility function
        // The getDistinctColor function automatically handles any number of categories:
        // - Uses predefined palette for first 40 colors
        // - Generates mathematically distinct colors using golden angle for additional categories
        // - Ensures good contrast and visual distinction even with 100+ categories
        const categoryCounts = categories
          .map((category: SupplierCategory, index: number) => {
            const count = suppliers.filter(
              (supplier: EnhancedSupplier) =>
                supplier.categoryId === category.categoryId
            ).length;
            return {
              name: category.name,
              value: count,
              color: getDistinctColor(index),
            };
          })
          .filter(
            (item: { name: string; value: number; color: string }) =>
              item.value > 0
          );

        // Add uncategorized suppliers
        const uncategorizedCount = suppliers.filter(
          (supplier: EnhancedSupplier) => !supplier.categoryId
        ).length;
        if (uncategorizedCount > 0) {
          categoryCounts.push({
            name: 'Uncategorized',
            value: uncategorizedCount,
            color: getDistinctColor(categoryCounts.length),
          });
        }

        setSupplierCategoryData(categoryCounts);
        setTotalSuppliers(suppliers.length);
      } catch (error) {
        console.error('Failed to load supplier category data:', error);
      } finally {
        setLoadingCategory(false);
      }
    };

    loadSupplierCategoryData();
  }, [isAuthenticated]);

  // Load supplier spend data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSupplierSpendData = async () => {
      try {
        setLoadingSpend(true);
        const [suppliers, allPurchaseOrders] = await Promise.all([
          enhancedSupplierService.getAllSuppliersWithUserDetails(),
          purchaseOrderService.getAllPurchaseOrders(),
        ]);

        // Filter purchase orders by time range
        let purchaseOrders = allPurchaseOrders;
        if (timeRange !== 'all') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
          purchaseOrders = allPurchaseOrders.filter(
            (order: PurchaseOrderSummary) => new Date(order.date) >= cutoffDate
          );
        }

        // Calculate spend by supplier
        const spendBySupplier = new Map<
          number,
          { supplierName: string; totalSpend: number; orderCount: number }
        >();

        // Initialize all suppliers with zero spend
        suppliers.forEach((supplier: EnhancedSupplier) => {
          spendBySupplier.set(supplier.supplierId, {
            supplierName:
              supplier.userDetails?.fullName ||
              supplier.userName ||
              `Supplier ${supplier.supplierId}`,
            totalSpend: 0,
            orderCount: 0,
          });
        });

        // Calculate totals for each purchase order and aggregate by supplier
        const spendPromises = purchaseOrders.map(
          async (order: PurchaseOrderSummary) => {
            try {
              const totalResponse =
                await purchaseOrderService.getPurchaseOrderTotal(order.id);
              return {
                supplierId: order.supplierId,
                total: totalResponse.total,
              };
            } catch (error) {
              console.error(
                `Failed to fetch total for order ${order.id}:`,
                error
              );
              return {
                supplierId: order.supplierId,
                total: order.total || 0,
              };
            }
          }
        );

        const spendResults = await Promise.all(spendPromises);

        spendResults.forEach(
          ({ supplierId, total }: { supplierId: number; total: number }) => {
            const supplierData = spendBySupplier.get(supplierId);
            if (supplierData) {
              supplierData.totalSpend += total;
              supplierData.orderCount += 1;
            }
          }
        );

        // Convert to array and sort by spend (top 10)
        const sortedSpendData = Array.from(spendBySupplier.values())
          .filter(data => data.totalSpend > 0)
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .slice(0, 10)
          .map(data => ({
            supplierName: data.supplierName,
            spend: data.totalSpend,
            orders: data.orderCount,
          }));

        setSupplierSpendData(sortedSpendData);
        setTotalSpend(
          sortedSpendData.reduce((sum, supplier) => sum + supplier.spend, 0)
        );
      } catch (error) {
        console.error('Failed to load supplier spend data:', error);
      } finally {
        setLoadingSpend(false);
      }
    };

    loadSupplierSpendData();
  }, [isAuthenticated, timeRange]);

  // Load PO status data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPoStatusData = async () => {
      try {
        setLoadingPoStatus(true);
        const allPurchaseOrders =
          await purchaseOrderService.getAllPurchaseOrders();

        // Filter purchase orders by time range
        let purchaseOrders = allPurchaseOrders;
        if (timeRange !== 'all') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
          purchaseOrders = allPurchaseOrders.filter(
            (order: PurchaseOrderSummary) => new Date(order.date) >= cutoffDate
          );
        }

        // Count orders by status
        const statusCounts = new Map<string, number>();
        purchaseOrders.forEach((order: PurchaseOrderSummary) => {
          const status = order.status || 'DRAFT';
          statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
        });

        const totalOrders = purchaseOrders.length;
        setTotalPurchaseOrders(totalOrders);

        // Define status colors and display names
        const statusConfig = [
          { key: 'DRAFT', name: 'Draft', color: '#94a3b8' },
          { key: 'SENT', name: 'Sent', color: '#3b82f6' },
          { key: 'PENDING', name: 'Pending', color: '#f59e0b' },
          { key: 'RECEIVED', name: 'Received', color: '#10b981' },
          { key: 'CANCELLED', name: 'Cancelled', color: '#ef4444' },
        ];

        // Convert to chart data with percentages
        const chartData = statusConfig
          .map(config => {
            const count = statusCounts.get(config.key) || 0;
            const percentage =
              totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            return {
              name: config.name,
              value: count,
              color: config.color,
              percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
            };
          })
          .filter(item => item.value > 0); // Only show statuses that have orders

        setPoStatusData(chartData);
      } catch (error) {
        console.error('Failed to load PO status data:', error);
      } finally {
        setLoadingPoStatus(false);
      }
    };

    loadPoStatusData();
  }, [isAuthenticated, timeRange]);

  // Load monthly trends data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadMonthlyTrendsData = async () => {
      try {
        setLoadingTrends(true);
        const allPurchaseOrders =
          await purchaseOrderService.getAllPurchaseOrders();

        // Filter purchase orders by time range (default to last 12 months for trends)
        const trendsTimeRange = timeRange === 'all' ? '365' : timeRange;
        let purchaseOrders = allPurchaseOrders;
        if (trendsTimeRange !== 'all') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(trendsTimeRange));
          purchaseOrders = allPurchaseOrders.filter(
            (order: PurchaseOrderSummary) => new Date(order.date) >= cutoffDate
          );
        }

        // Group orders by month
        const monthlyData = new Map<
          string,
          { orders: number; totalSpend: number }
        >();

        // Generate last 12 months for consistent chart
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
          const monthName = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          });
          months.push({ key: monthKey, name: monthName });
          monthlyData.set(monthKey, { orders: 0, totalSpend: 0 });
        }

        // Process purchase orders and get their totals
        const orderPromises = purchaseOrders.map(
          async (order: PurchaseOrderSummary) => {
            const orderDate = new Date(order.date);
            const monthKey = orderDate.toISOString().slice(0, 7);

            try {
              const totalResponse =
                await purchaseOrderService.getPurchaseOrderTotal(order.id);
              return {
                monthKey,
                total: totalResponse.total,
              };
            } catch (error) {
              console.error(
                `Failed to fetch total for order ${order.id}:`,
                error
              );
              return {
                monthKey,
                total: order.total || 0,
              };
            }
          }
        );

        const orderResults = await Promise.all(orderPromises);

        // Aggregate data by month
        orderResults.forEach(({ monthKey, total }) => {
          const existing = monthlyData.get(monthKey);
          if (existing) {
            existing.orders += 1;
            existing.totalSpend += total;
          }
        });

        // Convert to chart data
        const chartData = months.map(({ key, name }) => {
          const data = monthlyData.get(key) || { orders: 0, totalSpend: 0 };
          return {
            month: name,
            orders: data.orders,
            spend: Math.round(data.totalSpend),
          };
        });

        setMonthlyTrendsData(chartData);
      } catch (error) {
        console.error('Failed to load monthly trends data:', error);
      } finally {
        setLoadingTrends(false);
      }
    };

    loadMonthlyTrendsData();
  }, [isAuthenticated, timeRange]);

  // Load top ordered items data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadTopItemsData = async () => {
      try {
        setLoadingTopItems(true);
        const allPurchaseOrders =
          await purchaseOrderService.getAllPurchaseOrders();

        // Filter purchase orders by time range
        let purchaseOrders = allPurchaseOrders;
        if (timeRange !== 'all') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
          purchaseOrders = allPurchaseOrders.filter(
            (order: PurchaseOrderSummary) => new Date(order.date) >= cutoffDate
          );
        }

        // Collect all items from purchase orders
        const itemStats = new Map<
          number,
          {
            itemName: string;
            frequency: number;
            totalQuantity: number;
            totalValue: number;
          }
        >();

        console.log(
          '🔍 Processing',
          purchaseOrders.length,
          'purchase orders for items data'
        );

        // Process each purchase order to get items
        const itemPromises = purchaseOrders.map(
          async (order: PurchaseOrderSummary) => {
            try {
              const orderDetails =
                await purchaseOrderService.getPurchaseOrderById(order.id);
              console.log(
                `📦 Order ${order.id} has ${orderDetails.items?.length || 0} items`
              );
              return orderDetails.items || [];
            } catch (error) {
              console.error(
                `Failed to fetch items for order ${order.id}:`,
                error
              );
              return [];
            }
          }
        );

        const allOrderItems = await Promise.all(itemPromises);
        const flattenedItems = allOrderItems.flat();
        console.log('📊 Total items found:', flattenedItems.length);

        // Flatten and aggregate item data
        flattenedItems.forEach((item: PurchaseOrderItem) => {
          const itemId = item.itemId;
          const existing = itemStats.get(itemId);

          if (existing) {
            existing.frequency += 1;
            existing.totalQuantity += item.quantity;
            existing.totalValue += item.quantity * item.unitPrice;
          } else {
            itemStats.set(itemId, {
              itemName: `Item #${itemId}`,
              frequency: 1,
              totalQuantity: item.quantity,
              totalValue: item.quantity * item.unitPrice,
            });
          }
        });

        // Convert to array and sort by total quantity (top 15 items)
        const sortedItems = Array.from(itemStats.entries())
          .map(([itemId, stats]) => ({
            itemId,
            itemName: stats.itemName,
            frequency: stats.frequency,
            totalQuantity: stats.totalQuantity,
            totalValue: Math.round(stats.totalValue),
          }))
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 15);

        console.log('📈 Top items data:', sortedItems);

        // If no real data, use sample data for demonstration (sorted by quantity)
        if (sortedItems.length === 0) {
          console.log(
            '🎭 No real data found, using sample data for demonstration'
          );
          const sampleData = [
            {
              itemId: 1003,
              itemName: 'Printer Paper',
              frequency: 15,
              totalQuantity: 1500,
              totalValue: 3000,
            },
            {
              itemId: 1004,
              itemName: 'USB Cables',
              frequency: 6,
              totalQuantity: 300,
              totalValue: 1200,
            },
            {
              itemId: 1001,
              itemName: 'Office Chairs',
              frequency: 12,
              totalQuantity: 120,
              totalValue: 12000,
            },
            {
              itemId: 1007,
              itemName: 'Mouse Pads',
              frequency: 4,
              totalQuantity: 80,
              totalValue: 400,
            },
            {
              itemId: 1006,
              itemName: 'Keyboards',
              frequency: 7,
              totalQuantity: 35,
              totalValue: 2100,
            },
            {
              itemId: 1002,
              itemName: 'Laptop Computers',
              frequency: 8,
              totalQuantity: 24,
              totalValue: 32000,
            },
            {
              itemId: 1005,
              itemName: 'Monitors',
              frequency: 5,
              totalQuantity: 15,
              totalValue: 5000,
            },
          ];
          setTopItemsData(sampleData);
        } else {
          setTopItemsData(sortedItems);
        }
      } catch (error) {
        console.error('Failed to load top items data:', error);
        // Fallback to sample data on error (sorted by quantity)
        console.log(
          '🎭 Error loading data, using sample data for demonstration'
        );
        const sampleData = [
          {
            itemId: 1003,
            itemName: 'Printer Paper',
            frequency: 15,
            totalQuantity: 1500,
            totalValue: 3000,
          },
          {
            itemId: 1004,
            itemName: 'USB Cables',
            frequency: 6,
            totalQuantity: 300,
            totalValue: 1200,
          },
          {
            itemId: 1001,
            itemName: 'Office Chairs',
            frequency: 12,
            totalQuantity: 120,
            totalValue: 12000,
          },
          {
            itemId: 1007,
            itemName: 'Mouse Pads',
            frequency: 4,
            totalQuantity: 80,
            totalValue: 400,
          },
          {
            itemId: 1002,
            itemName: 'Laptop Computers',
            frequency: 8,
            totalQuantity: 24,
            totalValue: 32000,
          },
        ];
        setTopItemsData(sampleData);
      } finally {
        setLoadingTopItems(false);
      }
    };

    loadTopItemsData();
  }, [isAuthenticated, timeRange]);

  // Load spend over time data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSpendOverTimeData = async () => {
      try {
        setLoadingSpendOverTime(true);
        const allPurchaseOrders =
          await purchaseOrderService.getAllPurchaseOrders();

        // Always show last 12 months for spend tracking regardless of filter
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
          const monthName = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          });
          months.push({ key: monthKey, name: monthName });
        }

        // Group orders by month and calculate spend
        const monthlySpendData = new Map<
          string,
          { totalSpend: number; orderCount: number }
        >();

        // Initialize all months with zero
        months.forEach(({ key }) => {
          monthlySpendData.set(key, { totalSpend: 0, orderCount: 0 });
        });

        console.log(
          '💰 Processing',
          allPurchaseOrders.length,
          'purchase orders for spend over time'
        );

        // Process each purchase order to get total spend
        const spendPromises = allPurchaseOrders.map(
          async (order: PurchaseOrderSummary) => {
            const orderDate = new Date(order.date);
            const monthKey = orderDate.toISOString().slice(0, 7);

            // Only include orders from the last 12 months
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - 12);

            if (orderDate < cutoffDate) {
              return { monthKey: null, total: 0 };
            }

            try {
              const totalResponse =
                await purchaseOrderService.getPurchaseOrderTotal(order.id);
              return {
                monthKey,
                total: totalResponse.total,
              };
            } catch (error) {
              console.error(
                `Failed to fetch total for order ${order.id}:`,
                error
              );
              return {
                monthKey,
                total: order.total || 0,
              };
            }
          }
        );

        const spendResults = await Promise.all(spendPromises);

        // Aggregate spend by month
        spendResults.forEach(({ monthKey, total }) => {
          if (monthKey) {
            const existing = monthlySpendData.get(monthKey);
            if (existing) {
              existing.totalSpend += total;
              existing.orderCount += 1;
            }
          }
        });

        // Convert to chart data
        const chartData = months.map(({ key, name }) => {
          const data = monthlySpendData.get(key) || {
            totalSpend: 0,
            orderCount: 0,
          };
          return {
            month: name,
            totalSpend: Math.round(data.totalSpend),
            orderCount: data.orderCount,
            avgOrderValue:
              data.orderCount > 0
                ? Math.round(data.totalSpend / data.orderCount)
                : 0,
          };
        });

        console.log('💰 Spend over time data:', chartData);

        // If no real data, use sample data for demonstration
        if (chartData.every(item => item.totalSpend === 0)) {
          console.log(
            '🎭 No real spend data found, using sample data for demonstration'
          );
          const sampleData = [
            {
              month: 'Jan 2025',
              totalSpend: 45000,
              orderCount: 12,
              avgOrderValue: 3750,
            },
            {
              month: 'Feb 2025',
              totalSpend: 52000,
              orderCount: 15,
              avgOrderValue: 3467,
            },
            {
              month: 'Mar 2025',
              totalSpend: 38000,
              orderCount: 10,
              avgOrderValue: 3800,
            },
            {
              month: 'Apr 2025',
              totalSpend: 61000,
              orderCount: 18,
              avgOrderValue: 3389,
            },
            {
              month: 'May 2025',
              totalSpend: 47000,
              orderCount: 13,
              avgOrderValue: 3615,
            },
            {
              month: 'Jun 2025',
              totalSpend: 55000,
              orderCount: 16,
              avgOrderValue: 3438,
            },
            {
              month: 'Jul 2025',
              totalSpend: 42000,
              orderCount: 11,
              avgOrderValue: 3818,
            },
            {
              month: 'Aug 2025',
              totalSpend: 58000,
              orderCount: 17,
              avgOrderValue: 3412,
            },
            {
              month: 'Sep 2025',
              totalSpend: 49000,
              orderCount: 14,
              avgOrderValue: 3500,
            },
            {
              month: 'Oct 2025',
              totalSpend: 0,
              orderCount: 0,
              avgOrderValue: 0,
            },
            {
              month: 'Nov 2025',
              totalSpend: 0,
              orderCount: 0,
              avgOrderValue: 0,
            },
            {
              month: 'Dec 2025',
              totalSpend: 0,
              orderCount: 0,
              avgOrderValue: 0,
            },
          ];
          setSpendOverTimeData(sampleData);
        } else {
          setSpendOverTimeData(chartData);
        }
      } catch (error) {
        console.error('Failed to load spend over time data:', error);
        // Fallback to sample data on error
        const sampleData = [
          {
            month: 'Jan 2025',
            totalSpend: 45000,
            orderCount: 12,
            avgOrderValue: 3750,
          },
          {
            month: 'Feb 2025',
            totalSpend: 52000,
            orderCount: 15,
            avgOrderValue: 3467,
          },
          {
            month: 'Mar 2025',
            totalSpend: 38000,
            orderCount: 10,
            avgOrderValue: 3800,
          },
          {
            month: 'Apr 2025',
            totalSpend: 61000,
            orderCount: 18,
            avgOrderValue: 3389,
          },
          {
            month: 'May 2025',
            totalSpend: 47000,
            orderCount: 13,
            avgOrderValue: 3615,
          },
          {
            month: 'Jun 2025',
            totalSpend: 55000,
            orderCount: 16,
            avgOrderValue: 3438,
          },
        ];
        setSpendOverTimeData(sampleData);
      } finally {
        setLoadingSpendOverTime(false);
      }
    };

    loadSpendOverTimeData();
  }, [isAuthenticated]); // Don't depend on timeRange for budget tracking

  return (
    <div className='space-y-6'>
      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-5'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <Building2 className='h-4 w-4 text-muted-foreground' />
              <div className='ml-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Suppliers
                </p>
                <p className='text-2xl font-bold'>{totalSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <div className='ml-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Categories
                </p>
                <p className='text-2xl font-bold'>
                  {supplierCategoryData.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <Package className='h-4 w-4 text-muted-foreground' />
              <div className='ml-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Purchase Orders
                </p>
                <p className='text-2xl font-bold'>{totalPurchaseOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <Package className='h-4 w-4 text-muted-foreground' />
              <div className='ml-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Active Suppliers
                </p>
                <p className='text-2xl font-bold'>{supplierSpendData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <div className='h-4 w-4 text-muted-foreground'>$</div>
              <div className='ml-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Spend
                </p>
                <p className='text-2xl font-bold'>
                  ${totalSpend.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Category Breakdown</CardTitle>
          <CardDescription>
            Distribution of suppliers across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCategory ? (
            <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
              Loading category data...
            </div>
          ) : supplierCategoryData.length > 0 ? (
            <div className='space-y-4'>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={supplierCategoryData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {supplierCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} suppliers`,
                        'Count',
                      ]}
                      labelFormatter={label => `Category: ${label}`}
                    />
                    <Legend
                      verticalAlign='bottom'
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color || '#000' }}>
                          {value} ({entry.payload?.value || 0})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown table for many categories */}
              {supplierCategoryData.length > 10 && (
                <div className='mt-4'>
                  <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                    Category Breakdown ({supplierCategoryData.length}{' '}
                    categories)
                  </h4>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs'>
                    {supplierCategoryData.map((item, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div
                          className='w-3 h-3 rounded-full flex-shrink-0'
                          style={{ backgroundColor: item.color }}
                        />
                        <span className='truncate'>
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
              No supplier category data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* PO Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Status Distribution</CardTitle>
          <CardDescription>
            Pipeline health check - breakdown of orders by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPoStatus ? (
            <div className='h-[350px] flex items-center justify-center text-muted-foreground'>
              Loading PO status data...
            </div>
          ) : poStatusData.length > 0 ? (
            <div className='space-y-4'>
              <div className='h-[350px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={poStatusData}
                      cx='50%'
                      cy='50%'
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {poStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(
                        value: number,
                        name: string,
                        props: { payload?: { percentage?: number } }
                      ) => [
                        `${value} orders (${props.payload?.percentage || 0}%)`,
                        'Count',
                      ]}
                      labelFormatter={label => `Status: ${label}`}
                    />
                    <Legend
                      verticalAlign='bottom'
                      height={36}
                      formatter={(
                        value: number,
                        entry: {
                          color?: string;
                          payload?: { value?: number; percentage?: number };
                        }
                      ) => (
                        <span style={{ color: entry.color || '#000' }}>
                          {value} ({entry.payload?.value || 0} -{' '}
                          {entry.payload?.percentage || 0}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status breakdown summary */}
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t'>
                {poStatusData.map((item, index) => (
                  <div key={index} className='text-center'>
                    <div className='flex items-center justify-center space-x-2 mb-1'>
                      <div
                        className='w-3 h-3 rounded-full flex-shrink-0'
                        style={{ backgroundColor: item.color }}
                      />
                      <span className='text-sm font-medium'>{item.name}</span>
                    </div>
                    <div className='text-2xl font-bold text-muted-foreground'>
                      {item.value}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline health indicator */}
              <div className='mt-4 p-4 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>Pipeline Health:</span>
                  <span>
                    {(() => {
                      const draftPercent =
                        poStatusData.find(item => item.name === 'Draft')
                          ?.percentage || 0;
                      const cancelledPercent =
                        poStatusData.find(item => item.name === 'Cancelled')
                          ?.percentage || 0;
                      const completedPercent =
                        poStatusData.find(item => item.name === 'Received')
                          ?.percentage || 0;

                      if (completedPercent >= 60)
                        return (
                          <span className='text-green-600 font-medium'>
                            Excellent
                          </span>
                        );
                      if (completedPercent >= 40)
                        return (
                          <span className='text-blue-600 font-medium'>
                            Good
                          </span>
                        );
                      if (draftPercent >= 50)
                        return (
                          <span className='text-yellow-600 font-medium'>
                            Needs Attention
                          </span>
                        );
                      if (cancelledPercent >= 20)
                        return (
                          <span className='text-red-600 font-medium'>Poor</span>
                        );
                      return (
                        <span className='text-gray-600 font-medium'>Fair</span>
                      );
                    })()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className='h-[350px] flex items-center justify-center text-muted-foreground'>
              No purchase order data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Purchase Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Purchase Trends</CardTitle>
          <CardDescription>
            Purchase order volume and spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTrends ? (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              Loading trends data...
            </div>
          ) : monthlyTrendsData.length > 0 ? (
            <div className='space-y-4'>
              <div className='h-[400px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={monthlyTrendsData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#e0e4e7' />
                    <XAxis
                      dataKey='month'
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e4e7' }}
                      tickLine={{ stroke: '#e0e4e7' }}
                    />
                    <YAxis
                      yAxisId='orders'
                      orientation='left'
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e4e7' }}
                      tickLine={{ stroke: '#e0e4e7' }}
                      label={{
                        value: 'Number of Orders',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <YAxis
                      yAxisId='spend'
                      orientation='right'
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e4e7' }}
                      tickLine={{ stroke: '#e0e4e7' }}
                      label={{
                        value: 'Total Spend ($)',
                        angle: 90,
                        position: 'insideRight',
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'orders')
                          return [`${value} orders`, 'Orders Created'];
                        if (name === 'spend')
                          return [`$${value.toLocaleString()}`, 'Total Spend'];
                        return [value, name];
                      }}
                      labelFormatter={label => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e4e7',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId='orders'
                      type='monotone'
                      dataKey='orders'
                      stroke='#3b82f6'
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      name='Orders Created'
                    />
                    <Line
                      yAxisId='spend'
                      type='monotone'
                      dataKey='spend'
                      stroke='#10b981'
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      name='Total Spend ($)'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trend insights */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t'>
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {monthlyTrendsData.reduce(
                      (sum, month) => sum + month.orders,
                      0
                    )}
                  </div>
                  <div className='text-sm text-blue-700'>
                    Total Orders (12 months)
                  </div>
                </div>
                <div className='text-center p-4 bg-green-50 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>
                    $
                    {monthlyTrendsData
                      .reduce((sum, month) => sum + month.spend, 0)
                      .toLocaleString()}
                  </div>
                  <div className='text-sm text-green-700'>
                    Total Spend (12 months)
                  </div>
                </div>
                <div className='text-center p-4 bg-purple-50 rounded-lg'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {monthlyTrendsData.length > 0
                      ? Math.round(
                          monthlyTrendsData.reduce(
                            (sum, month) => sum + month.orders,
                            0
                          ) / monthlyTrendsData.length
                        )
                      : 0}
                  </div>
                  <div className='text-sm text-purple-700'>
                    Avg Orders/Month
                  </div>
                </div>
              </div>

              {/* Seasonality insights */}
              <div className='mt-4 p-4 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>Trend Analysis:</span>
                  <span>
                    {(() => {
                      if (monthlyTrendsData.length < 2)
                        return (
                          <span className='text-gray-600'>
                            Insufficient data
                          </span>
                        );

                      const recentMonths = monthlyTrendsData.slice(-3);
                      const earlierMonths = monthlyTrendsData.slice(-6, -3);

                      const recentAvg =
                        recentMonths.reduce(
                          (sum, month) => sum + month.orders,
                          0
                        ) / recentMonths.length;
                      const earlierAvg =
                        earlierMonths.reduce(
                          (sum, month) => sum + month.orders,
                          0
                        ) / earlierMonths.length;

                      const trend = recentAvg - earlierAvg;

                      if (trend > 2)
                        return (
                          <span className='text-green-600 font-medium'>
                            📈 Strong Growth
                          </span>
                        );
                      if (trend > 0.5)
                        return (
                          <span className='text-blue-600 font-medium'>
                            📊 Growing
                          </span>
                        );
                      if (trend > -0.5)
                        return (
                          <span className='text-gray-600 font-medium'>
                            ➡️ Stable
                          </span>
                        );
                      if (trend > -2)
                        return (
                          <span className='text-orange-600 font-medium'>
                            📉 Declining
                          </span>
                        );
                      return (
                        <span className='text-red-600 font-medium'>
                          ⚠️ Significant Decline
                        </span>
                      );
                    })()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              No monthly trends data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Ordered Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Ordered Items by Quantity</CardTitle>
          <CardDescription>
            Items ranked by total quantity ordered (shows actual demand volume)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTopItems ? (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              Loading top items data...
            </div>
          ) : topItemsData.length > 0 ? (
            <div className='space-y-6'>
              {/* Debug info */}
              <div className='text-sm text-muted-foreground'>
                Found {topItemsData.length} items with orders
              </div>

              {/* Simple vertical bar chart */}
              <div className='h-[400px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={topItemsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 40,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='itemName'
                      angle={-45}
                      textAnchor='end'
                      height={80}
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      label={{
                        value: 'Total Quantity Ordered',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'totalQuantity')
                          return [`${value} units`, 'Total Quantity'];
                        if (name === 'frequency')
                          return [`${value} orders`, 'Number of Orders'];
                        return [value, name];
                      }}
                      labelFormatter={(label: string) => `${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey='totalQuantity'
                      fill='#10b981'
                      name='Total Quantity'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary stats */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {topItemsData.length}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Different Items
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {topItemsData.reduce(
                      (sum, item) => sum + item.frequency,
                      0
                    )}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Orders
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {topItemsData
                      .reduce((sum, item) => sum + item.totalQuantity, 0)
                      .toLocaleString()}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Units
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>
                    $
                    {topItemsData
                      .reduce((sum, item) => sum + item.totalValue, 0)
                      .toLocaleString()}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Value
                  </div>
                </div>
              </div>

              {/* Top 5 list */}
              <div>
                <h4 className='text-lg font-semibold mb-4'>
                  Highest Volume Items
                </h4>
                <div className='space-y-2'>
                  {topItemsData.slice(0, 5).map((item, index) => (
                    <div
                      key={item.itemId}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                          {index + 1}
                        </div>
                        <div>
                          <span className='font-medium'>{item.itemName}</span>
                          <span className='text-sm text-muted-foreground ml-2'>
                            (ID: {item.itemId})
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center space-x-4 text-sm'>
                        <span className='font-medium text-green-600'>
                          {item.totalQuantity} units
                        </span>
                        <span className='text-blue-600'>
                          {item.frequency} orders
                        </span>
                        <span className='text-purple-600'>
                          ${item.totalValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <Package className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>No item order data available</p>
                <p className='text-sm'>
                  Items will appear here once purchase orders contain item
                  details
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spend Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Spend Over Time</CardTitle>
          <CardDescription>
            Monthly purchase spending trends for budget tracking and forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSpendOverTime ? (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              Loading spend over time data...
            </div>
          ) : spendOverTimeData.length > 0 ? (
            <div className='space-y-6'>
              {/* Debug info */}
              <div className='text-sm text-muted-foreground'>
                Showing spend trends for the last 12 months
              </div>

              {/* Main line chart */}
              <div className='h-[400px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={spendOverTimeData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#e0e4e7' />
                    <XAxis
                      dataKey='month'
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e4e7' }}
                      tickLine={{ stroke: '#e0e4e7' }}
                    />
                    <YAxis
                      yAxisId='spend'
                      orientation='left'
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e4e7' }}
                      tickLine={{ stroke: '#e0e4e7' }}
                      label={{
                        value: 'Total Spend ($)',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                      tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId='orders'
                      orientation='right'
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e4e7' }}
                      tickLine={{ stroke: '#e0e4e7' }}
                      label={{
                        value: 'Order Count',
                        angle: 90,
                        position: 'insideRight',
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'totalSpend')
                          return [`$${value.toLocaleString()}`, 'Total Spend'];
                        if (name === 'orderCount')
                          return [`${value} orders`, 'Order Count'];
                        if (name === 'avgOrderValue')
                          return [
                            `$${value.toLocaleString()}`,
                            'Avg Order Value',
                          ];
                        return [value, name];
                      }}
                      labelFormatter={label => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e4e7',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId='spend'
                      type='monotone'
                      dataKey='totalSpend'
                      stroke='#ef4444'
                      strokeWidth={4}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                      name='Total Spend ($)'
                    />
                    <Line
                      yAxisId='orders'
                      type='monotone'
                      dataKey='orderCount'
                      stroke='#6366f1'
                      strokeWidth={3}
                      strokeDasharray='5 5'
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                      name='Order Count'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly budget insights */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-red-50 rounded-lg border border-red-100'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-red-600'>
                    $
                    {spendOverTimeData
                      .reduce((sum, month) => sum + month.totalSpend, 0)
                      .toLocaleString()}
                  </div>
                  <div className='text-sm text-red-700'>
                    Total Spend (12 months)
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    $
                    {spendOverTimeData.length > 0
                      ? Math.round(
                          spendOverTimeData.reduce(
                            (sum, month) => sum + month.totalSpend,
                            0
                          ) / 12
                        ).toLocaleString()
                      : 0}
                  </div>
                  <div className='text-sm text-blue-700'>Monthly Average</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    $
                    {Math.max(
                      ...spendOverTimeData.map(m => m.totalSpend)
                    ).toLocaleString()}
                  </div>
                  <div className='text-sm text-green-700'>Highest Month</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    $
                    {spendOverTimeData.length > 0
                      ? Math.round(
                          spendOverTimeData.reduce(
                            (sum, month) =>
                              sum + month.avgOrderValue * month.orderCount,
                            0
                          ) /
                            spendOverTimeData.reduce(
                              (sum, month) => sum + month.orderCount,
                              0
                            ) || 0
                        ).toLocaleString()
                      : 0}
                  </div>
                  <div className='text-sm text-purple-700'>Avg Order Value</div>
                </div>
              </div>

              {/* Budget trend analysis */}
              <div className='p-4 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-between text-sm mb-2'>
                  <span className='font-medium'>Budget Trend Analysis:</span>
                  <span>
                    {(() => {
                      if (spendOverTimeData.length < 3)
                        return (
                          <span className='text-gray-600'>
                            Insufficient data
                          </span>
                        );

                      const recentMonths = spendOverTimeData
                        .slice(-3)
                        .filter(m => m.totalSpend > 0);
                      const earlierMonths = spendOverTimeData
                        .slice(-6, -3)
                        .filter(m => m.totalSpend > 0);

                      if (
                        recentMonths.length === 0 ||
                        earlierMonths.length === 0
                      ) {
                        return (
                          <span className='text-gray-600'>
                            Insufficient data
                          </span>
                        );
                      }

                      const recentAvg =
                        recentMonths.reduce(
                          (sum, month) => sum + month.totalSpend,
                          0
                        ) / recentMonths.length;
                      const earlierAvg =
                        earlierMonths.reduce(
                          (sum, month) => sum + month.totalSpend,
                          0
                        ) / earlierMonths.length;

                      const trendPercent =
                        ((recentAvg - earlierAvg) / earlierAvg) * 100;

                      if (trendPercent > 20)
                        return (
                          <span className='text-red-600 font-medium'>
                            📈 Spending Increasing (+{trendPercent.toFixed(1)}%)
                          </span>
                        );
                      if (trendPercent > 5)
                        return (
                          <span className='text-orange-600 font-medium'>
                            📊 Slight Increase (+{trendPercent.toFixed(1)}%)
                          </span>
                        );
                      if (trendPercent > -5)
                        return (
                          <span className='text-blue-600 font-medium'>
                            ➡️ Stable ({trendPercent > 0 ? '+' : ''}
                            {trendPercent.toFixed(1)}%)
                          </span>
                        );
                      if (trendPercent > -20)
                        return (
                          <span className='text-green-600 font-medium'>
                            📉 Spending Decreasing ({trendPercent.toFixed(1)}%)
                          </span>
                        );
                      return (
                        <span className='text-green-700 font-medium'>
                          💰 Significant Savings ({trendPercent.toFixed(1)}%)
                        </span>
                      );
                    })()}
                  </span>
                </div>
                <div className='text-xs text-muted-foreground'>
                  Compare recent 3-month average with previous 3-month average
                  to identify spending trends
                </div>
              </div>

              {/* Monthly breakdown table */}
              <div>
                <h4 className='text-lg font-semibold mb-4'>
                  Monthly Spending Breakdown
                </h4>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left p-2'>Month</th>
                        <th className='text-right p-2'>Total Spend</th>
                        <th className='text-right p-2'>Orders</th>
                        <th className='text-right p-2'>Avg Order Value</th>
                        <th className='text-right p-2'>vs Previous Month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spendOverTimeData.map((month, index) => {
                        const prevMonth =
                          index > 0 ? spendOverTimeData[index - 1] : null;
                        const changePercent =
                          prevMonth && prevMonth.totalSpend > 0
                            ? ((month.totalSpend - prevMonth.totalSpend) /
                                prevMonth.totalSpend) *
                              100
                            : 0;

                        return (
                          <tr
                            key={month.month}
                            className='border-b hover:bg-muted/20'
                          >
                            <td className='p-2 font-medium'>{month.month}</td>
                            <td className='p-2 text-right'>
                              ${month.totalSpend.toLocaleString()}
                            </td>
                            <td className='p-2 text-right'>
                              {month.orderCount}
                            </td>
                            <td className='p-2 text-right'>
                              ${month.avgOrderValue.toLocaleString()}
                            </td>
                            <td className='p-2 text-right'>
                              {month.totalSpend === 0 ? (
                                <span className='text-gray-500'>-</span>
                              ) : changePercent === 0 ? (
                                <span className='text-gray-500'>-</span>
                              ) : changePercent > 0 ? (
                                <span className='text-red-600'>
                                  +{changePercent.toFixed(1)}%
                                </span>
                              ) : (
                                <span className='text-green-600'>
                                  {changePercent.toFixed(1)}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <div className='text-4xl mb-2'>💰</div>
                <p>No spending data available</p>
                <p className='text-sm'>
                  Spending trends will appear here once purchase orders are
                  processed
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spend by Supplier */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Top Suppliers by Spend</CardTitle>
            <CardDescription>
              Total spending and order count for top suppliers
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='30'>Last 30 Days</SelectItem>
              <SelectItem value='90'>Last 90 Days</SelectItem>
              <SelectItem value='365'>Last Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loadingSpend ? (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              Loading spend data...
            </div>
          ) : supplierSpendData.length > 0 ? (
            <div className='h-[400px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={supplierSpendData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='supplierName'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                    interval={0}
                  />
                  <YAxis yAxisId='spend' orientation='left' />
                  <YAxis yAxisId='orders' orientation='right' />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'spend'
                        ? `$${value.toLocaleString()}`
                        : `${value} orders`,
                      name === 'spend' ? 'Total Spend' : 'Order Count',
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId='spend'
                    dataKey='spend'
                    fill='#8884d8'
                    name='Total Spend ($)'
                  />
                  <Bar
                    yAxisId='orders'
                    dataKey='orders'
                    fill='#82ca9d'
                    name='Order Count'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='h-[400px] flex items-center justify-center text-muted-foreground'>
              No supplier spend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Analytics */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>
              On-time delivery rates and reliability metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[200px] flex items-center justify-center text-muted-foreground'>
              Chart placeholder - Coming soon: Supplier performance metrics
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>
              Price trends and cost optimization opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[200px] flex items-center justify-center text-muted-foreground'>
              Chart placeholder - Coming soon: Cost analysis and trends
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Supplier Details Sheet Component
function SupplierDetailsSheet({
  supplier,
  isOpen,
  onOpenChange,
}: {
  supplier: Supplier | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [supplierOrders, setSupplierOrders] = useState<PurchaseOrderSummary[]>(
    []
  );
  const [orderTotals, setOrderTotals] = useState<Map<number, number>>(
    new Map()
  );
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadSupplierOrders = useCallback(async (supplierId: number) => {
    try {
      setLoadingOrders(true);
      const allOrders = await purchaseOrderService.getAllPurchaseOrders();
      // Filter orders for this supplier
      const filteredOrders = allOrders.filter(
        order => order.supplierId === supplierId
      );
      setSupplierOrders(filteredOrders);

      // Load totals for filtered orders
      await loadOrderTotals(filteredOrders);
    } catch (error) {
      console.error('Failed to load supplier orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Load supplier-specific purchase orders when sheet opens
  useEffect(() => {
    if (supplier && isOpen && isAuthenticated) {
      loadSupplierOrders(supplier.id);
    }
  }, [supplier, isOpen, isAuthenticated, loadSupplierOrders]);

  const loadOrderTotals = async (orders: PurchaseOrderSummary[]) => {
    try {
      setLoadingTotals(true);
      const totalsMap = new Map<number, number>();

      const totalPromises = orders.map(async order => {
        try {
          const totalResponse =
            await purchaseOrderService.getPurchaseOrderTotal(order.id);
          return { id: order.id, total: totalResponse.total };
        } catch (error) {
          console.error(`Failed to fetch total for order ${order.id}:`, error);
          return { id: order.id, total: order.total || 0 };
        }
      });

      const results = await Promise.all(totalPromises);

      results.forEach(({ id, total }) => {
        totalsMap.set(id, total);
      });

      setOrderTotals(totalsMap);
    } catch (error) {
      console.error('Failed to load order totals:', error);
      const fallbackTotals = new Map<number, number>();
      orders.forEach(order => {
        fallbackTotals.set(order.id, order.total || 0);
      });
      setOrderTotals(fallbackTotals);
    } finally {
      setLoadingTotals(false);
    }
  };

  const getStatusBadgeVariant = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return 'secondary';
      case PurchaseOrderStatus.SENT:
        return 'outline';
      case PurchaseOrderStatus.PENDING:
        return 'default';
      case PurchaseOrderStatus.RECEIVED:
        return 'secondary';
      case PurchaseOrderStatus.CANCELLED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!supplier) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            {supplier.name}
          </SheetTitle>
          <SheetDescription>
            Detailed information about {supplier.name}
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Basic Info */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Basic Information</h3>
            <div className='grid gap-3'>
              <div className='flex items-center gap-3'>
                <Tag className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Category:</span>
                <Badge variant='outline'>{supplier.category}</Badge>
              </div>
              <div className='flex items-center gap-3'>
                <Badge className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Status:</span>
                <Badge
                  variant={
                    supplier.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {supplier.status}
                </Badge>
              </div>
              <div className='flex items-center gap-3'>
                <Package className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Total Orders:</span>
                <span className='text-sm'>{supplier.orders}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Contact Information</h3>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{supplier.email}</span>
              </div>
              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{supplier.phone}</span>
              </div>
              <div className='flex items-center gap-3'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{supplier.address}</span>
              </div>
              <div className='flex items-center gap-3'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{supplier.contactPerson}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Recent Orders</h3>
            <div className='space-y-2'>
              {loadingOrders ? (
                <div className='text-sm text-muted-foreground'>
                  Loading orders...
                </div>
              ) : supplierOrders.length === 0 ? (
                <div className='text-sm text-muted-foreground'>
                  No orders found for this supplier.
                </div>
              ) : (
                supplierOrders.slice(0, 3).map(order => (
                  <div
                    key={order.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div>
                      <p className='font-medium text-sm'>
                        PO-{order.id.toString().padStart(3, '0')}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(order.date)}
                      </p>
                    </div>
                    <div className='text-right'>
                      {loadingTotals ? (
                        <div className='text-xs text-muted-foreground'>
                          Loading...
                        </div>
                      ) : (
                        <p className='font-medium text-sm'>
                          {formatCurrency(
                            orderTotals.get(order.id) || order.total || 0
                          )}
                        </p>
                      )}
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className='text-xs'
                      >
                        {order.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-2 pt-4'>
            <Button className='flex-1'>
              <Edit className='mr-2 h-4 w-4' />
              Edit Supplier
            </Button>
            <Button variant='outline' className='flex-1'>
              <Plus className='mr-2 h-4 w-4' />
              New Order
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Add Supplier Sheet Component
function AddSupplierSheet({
  isOpen,
  onOpenChange,
  onSupplierAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierAdded: () => void;
}) {
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Get authentication context
  const { isAuthenticated } = useAuth();

  const loadCategories = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to access supplier categories');
      return;
    }

    setLoadingCategories(true);
    try {
      const categoriesData = await supplierCategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError(
        'Failed to load supplier categories. Please check if you are logged in and try again.'
      );
    } finally {
      setLoadingCategories(false);
    }
  }, [isAuthenticated]);

  // Load categories when sheet opens
  useEffect(() => {
    if (isOpen) {
      // Only load categories if user is authenticated
      if (isAuthenticated) {
        loadCategories();
      } else {
        setError('Please log in to access supplier categories');
      }
      setSelectedUserId('');
      setSelectedCategoryId('');
      setUserSearchTerm('');
      if (isAuthenticated) {
        setError(null);
      }
      setSuccess(null);
    }
  }, [isOpen, isAuthenticated, loadCategories]);

  // Search for users (now using real API)
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      console.log('🔍 Searching for users with term:', searchTerm);
      const searchResults = await userService.searchUsers(searchTerm);
      console.log('🔍 Search results:', searchResults);
      setUsers(searchResults);
    } catch (error) {
      console.error('Failed to search users:', error);

      // Check if it's a permission error
      if (error instanceof Error && error.message.includes('Access denied')) {
        console.log('🚫 Access denied, falling back to current user');
        // Fallback to current user only
        try {
          const currentUser = await userService.getCurrentUser();
          setUsers([currentUser]);
        } catch (currentUserError) {
          console.error(
            'Failed to get current user as fallback:',
            currentUserError
          );
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle user search input with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (userSearchTerm.length >= 2) {
        searchUsers(userSearchTerm);
      } else if (userSearchTerm.length === 0) {
        // Optionally load all users when search is cleared (for admins)
        loadAllUsersIfAllowed();
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [userSearchTerm]);

  // Load all users if user has permission (for admins/managers)
  const loadAllUsersIfAllowed = async () => {
    try {
      console.log('👥 Attempting to load all users...');
      const allUsers = await userService.getAllUsers();
      console.log('👥 Loaded all users:', allUsers.length);
      setUsers(allUsers);
    } catch (error) {
      console.log(
        '👥 Cannot load all users (insufficient permissions), keeping empty',
        error
      );
      setUsers([]);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please log in to create a supplier');
      return;
    }

    if (!selectedUserId || !selectedCategoryId) {
      setError('Please select both a user and category');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const supplierRequest: SupplierCreateRequest = {
        userId: parseInt(selectedUserId),
        categoryId: parseInt(selectedCategoryId),
      };

      await supplierService.createSupplier(supplierRequest);
      setSuccess('Supplier created successfully!');

      // Clear form
      setSelectedUserId('');
      setSelectedCategoryId('');
      setUserSearchTerm('');
      setUsers([]);

      // Notify parent component
      onSupplierAdded();

      // Close sheet after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to create supplier:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create supplier';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSelectedCategoryId('');
    setUserSearchTerm('');
    setUsers([]);
    setError(null);
    setSuccess(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>Add New Supplier</SheetTitle>
          <SheetDescription>
            Create a new supplier by associating a user with a supplier
            category.
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to create suppliers and access supplier
                categories.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>Success</AlertTitle>
              <AlertDescription className='text-green-700'>
                {success}
              </AlertDescription>
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

          {/* User Selection */}
          <div className='space-y-2'>
            <Label htmlFor='userSearch'>Search User</Label>
            <div className='space-y-2'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='userSearch'
                  placeholder='Type username or email to search...'
                  value={userSearchTerm}
                  onChange={e => setUserSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>

              {loadingUsers && (
                <div className='text-sm text-muted-foreground'>
                  Searching users...
                </div>
              )}

              {users.length > 0 && (
                <div className='space-y-2 max-h-40 overflow-y-auto border rounded-md p-2'>
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`p-2 rounded-md cursor-pointer border ${
                        selectedUserId === user.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setUserSearchTerm(user.username);
                      }}
                    >
                      <div className='font-medium'>{user.fullName}</div>
                      <div className='text-sm text-muted-foreground'>
                        {user.username} • {user.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className='space-y-2'>
            <Label htmlFor='category'>Supplier Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={!isAuthenticated}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !isAuthenticated
                      ? 'Please log in to select category'
                      : 'Select a category'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!isAuthenticated ? (
                  <SelectItem value='auth-required' disabled>
                    Please log in to view categories
                  </SelectItem>
                ) : loadingCategories ? (
                  <SelectItem value='loading' disabled>
                    Loading categories...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value='no-categories' disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map(category => (
                    <SelectItem
                      key={category.categoryId}
                      value={category.categoryId.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Information */}
          {selectedUserId && selectedCategoryId && (
            <div className='p-3 bg-muted/30 rounded-lg space-y-2'>
              <h4 className='font-medium'>Selected Information:</h4>
              <div className='text-sm space-y-1'>
                <div>
                  User:{' '}
                  {users.find(u => u.id === selectedUserId)?.fullName ||
                    'Selected User'}
                </div>
                <div>
                  Category:{' '}
                  {categories.find(
                    c => c.categoryId.toString() === selectedCategoryId
                  )?.name || 'Selected Category'}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !selectedUserId ||
                !selectedCategoryId ||
                !isAuthenticated
              }
              className='flex-1'
            >
              {submitting
                ? 'Creating...'
                : !isAuthenticated
                  ? 'Please Login'
                  : 'Create Supplier'}
            </Button>
            <Button
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Add Category Sheet Component
function AddCategorySheet({
  isOpen,
  onOpenChange,
  onCategoryAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: () => void;
}) {
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get authentication context
  const { isAuthenticated } = useAuth();

  // Reset form when sheet opens/closes
  useEffect(() => {
    if (isOpen) {
      setCategoryName('');
      setError(null);
      setSuccess(null);
      if (!isAuthenticated) {
        setError('Please log in to create supplier categories');
      }
    }
  }, [isOpen, isAuthenticated]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please log in to create supplier categories');
      return;
    }

    if (!categoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const categoryRequest: SupplierCategoryCreateRequest = {
        name: categoryName.trim(),
      };

      await supplierCategoryService.createCategory(categoryRequest);
      setSuccess('Category created successfully!');

      // Clear form
      setCategoryName('');

      // Notify parent component
      onCategoryAdded();

      // Close sheet after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to create category:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create category';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategoryName('');
    setError(null);
    setSuccess(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>Add New Supplier Category</SheetTitle>
          <SheetDescription>
            Create a new category to organize your suppliers.
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to create supplier categories.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>Success</AlertTitle>
              <AlertDescription className='text-green-700'>
                {success}
              </AlertDescription>
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

          {/* Category Name Input */}
          <div className='space-y-2'>
            <Label htmlFor='categoryName'>Category Name</Label>
            <Input
              id='categoryName'
              placeholder='Enter category name (e.g., Electronics, Office Supplies)'
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              disabled={!isAuthenticated}
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !submitting &&
                  categoryName.trim() &&
                  isAuthenticated
                ) {
                  handleSubmit();
                }
              }}
            />
            <p className='text-sm text-muted-foreground'>
              Choose a descriptive name for the supplier category.
            </p>
          </div>

          {/* Preview */}
          {categoryName.trim() && (
            <div className='p-3 bg-muted/30 rounded-lg space-y-2'>
              <h4 className='font-medium'>Preview:</h4>
              <div className='flex items-center gap-2'>
                <Tag className='h-4 w-4 text-muted-foreground' />
                <Badge variant='outline'>{categoryName.trim()}</Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !categoryName.trim() || !isAuthenticated}
              className='flex-1'
            >
              {submitting
                ? 'Creating...'
                : !isAuthenticated
                  ? 'Please Login'
                  : 'Create Category'}
            </Button>
            <Button
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Add Purchase Order Sheet Component
function AddPurchaseOrderSheet({
  isOpen,
  onOpenChange,
  onPurchaseOrderAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseOrderAdded: () => void;
}) {
  const [suppliers, setSuppliers] = useState<EnhancedSupplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load suppliers when sheet opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadSuppliers();
    }
  }, [isOpen, isAuthenticated]);

  // Clear form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSupplierId('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const suppliersData =
        await enhancedSupplierService.getAllSuppliersWithUserDetails();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId || !selectedDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const purchaseOrderRequest: PurchaseOrderCreateRequest = {
        supplierId: parseInt(selectedSupplierId),
        date: selectedDate,
        status: 'DRAFT',
        items: [], // Start with empty items, can be added later
      };

      await purchaseOrderService.createPurchaseOrder(purchaseOrderRequest);

      setSuccess('Purchase order created successfully!');

      // Call the callback after a short delay to show success message
      setTimeout(() => {
        onPurchaseOrderAdded();
      }, 1500);
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      setError('Failed to create purchase order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  const selectedSupplier = suppliers.find(
    s => s.supplierId === parseInt(selectedSupplierId)
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>Create New Purchase Order</SheetTitle>
          <SheetDescription>
            Create a new purchase order for a supplier.
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to create purchase orders.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>Success</AlertTitle>
              <AlertDescription className='text-green-700'>
                {success}
              </AlertDescription>
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

          {/* Supplier Selection */}
          <div className='space-y-2'>
            <Label htmlFor='supplier'>Supplier *</Label>
            {loadingSuppliers ? (
              <div className='text-sm text-muted-foreground'>
                Loading suppliers...
              </div>
            ) : (
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
                disabled={!isAuthenticated}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a supplier' />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem
                      key={supplier.supplierId}
                      value={supplier.supplierId.toString()}
                    >
                      {supplier.userDetails?.fullName || supplier.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className='text-sm text-muted-foreground'>
              Choose the supplier for this purchase order.
            </p>
          </div>

          {/* Date Selection */}
          <div className='space-y-2'>
            <Label htmlFor='date'>Order Date *</Label>
            <Input
              id='date'
              type='date'
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              disabled={!isAuthenticated}
            />
            <p className='text-sm text-muted-foreground'>
              Date when the purchase order is created.
            </p>
          </div>

          {/* Preview */}
          {selectedSupplier && selectedDate && (
            <div className='p-4 bg-muted/30 rounded-lg space-y-3'>
              <h4 className='font-medium'>Preview:</h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    {selectedSupplier.userDetails?.fullName ||
                      selectedSupplier.userName}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    {new Date(selectedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Tag className='h-4 w-4 text-muted-foreground' />
                  <Badge variant='secondary'>Draft</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !selectedSupplierId ||
                !selectedDate ||
                !isAuthenticated
              }
              className='flex-1'
            >
              {submitting
                ? 'Creating...'
                : !isAuthenticated
                  ? 'Please Login'
                  : 'Create Purchase Order'}
            </Button>
            <Button
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>

          {/* Note */}
          <div className='text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg'>
            <p>
              <strong>Note:</strong> The purchase order will be created in draft
              status. You can add items and modify details after creation.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper functions
function getDeliveryStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'in-transit':
      return 'default';
    case 'delivered':
      return 'default';
    case 'delayed':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'secondary';
  }
}

// Types for local UI compatibility
interface LocalSupplier {
  id: number;
  name: string;
  category: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  orders: number;
  address: string;
  contactPerson: string;
}

// Use LocalSupplier for UI components
type Supplier = LocalSupplier;

// Sample data - keeping suppliers and deliveries for now
const sampleSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'ABC Supplies',
    category: 'Electronics',
    email: 'contact@abcsupplies.com',
    phone: '+1-555-0123',
    status: 'active',
    orders: 45,
    address: '123 Tech Street, Silicon Valley, CA 94025',
    contactPerson: 'John Smith',
  },
  {
    id: 2,
    name: 'XYZ Corp',
    category: 'Office Supplies',
    email: 'info@xyzcorp.com',
    phone: '+1-555-0124',
    status: 'active',
    orders: 32,
    address: '456 Business Ave, New York, NY 10001',
    contactPerson: 'Sarah Johnson',
  },
  {
    id: 3,
    name: 'Global Imports',
    category: 'Furniture',
    email: 'sales@globalimports.com',
    phone: '+1-555-0125',
    status: 'active',
    orders: 28,
    address: '789 Import Blvd, Los Angeles, CA 90210',
    contactPerson: 'Mike Chen',
  },
];
