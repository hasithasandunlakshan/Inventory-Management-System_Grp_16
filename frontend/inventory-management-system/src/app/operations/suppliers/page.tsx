"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Truck, Package, DollarSign, Calendar, Phone, Mail, MapPin, User, Building2, Tag, X, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { deliveryLogService } from "@/lib/services/deliveryLogService";
import { supplierService } from "@/lib/services/supplierService";

import { supplierCategoryService } from "@/lib/services/supplierCategoryService";
import { enhancedSupplierService } from "@/lib/services/enhancedSupplierService";
import { DeliveryLog, Supplier as BackendSupplier, EnhancedSupplier, SupplierCreateRequest, SupplierCategory } from "@/lib/types/supplier";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { UserHeader } from "@/components/UserHeader";
import { authDebug } from "@/lib/utils/authDebug";
import { userService, UserInfo } from "@/lib/services/userService";

// Define DeliveryLogCreateRequest to match the imported type
interface DeliveryLogCreateRequest {
  poId: number;
  itemID: number;
  receivedDate: string;
  receivedQuantity: number;
}

// Main component wrapped with authentication
function SuppliersPageContent() {
  const [activeTab, setActiveTab] = useState("purchase-orders");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { isAuthenticated, isLoading } = useAuth();

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsSheetOpen(true);
  };

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserHeader onLoginClick={handleLoginClick} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage suppliers, purchase orders, and delivery logistics
          </p>
        </div>
        <div className="flex gap-2">
          {/* Debug button for development */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('🔧 Authentication Debug Report:');
                authDebug.debugAll();
              }}
              title="Debug Authentication (Dev Only)"
            >
              🔧 Debug Auth
            </Button>
          )}
          <Button variant="outline" disabled={!isAuthenticated}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" disabled={!isAuthenticated}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button disabled={!isAuthenticated}>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              12 due this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">
              3 new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="delivery-logs">Delivery Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-orders" className="space-y-4">
          <PurchaseOrdersTab />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SuppliersTab onViewSupplier={handleViewSupplier} onLoginClick={handleLoginClick} onAddSupplier={() => setIsAddSupplierOpen(true)} refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="delivery-logs" className="space-y-4">
          <DeliveryLogsTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
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
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
}

// Export the main component wrapped with AuthProvider
export default function SuppliersPage() {
  return (
    <AuthProvider>
      <SuppliersPageContent />
    </AuthProvider>
  );
}

// Purchase Orders Tab Component
function PurchaseOrdersTab() {
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find specific purchase orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="search" placeholder="Search orders..." className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier1">ABC Supplies</SelectItem>
                  <SelectItem value="supplier2">XYZ Corp</SelectItem>
                  <SelectItem value="supplier3">Global Imports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="ghost">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Manage and track all purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {samplePurchaseOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{order.id}</span>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.supplier} • {order.items} items
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due: {order.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${order.total}</span>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Suppliers Tab Component
function SuppliersTab({ onViewSupplier, onLoginClick, onAddSupplier, refreshTrigger }: { 
  onViewSupplier: (supplier: Supplier) => void;
  onLoginClick: () => void;
  onAddSupplier: () => void;
  refreshTrigger: number;
}) {
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<EnhancedSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load suppliers on component mount and when authentication changes or refresh is triggered
  useEffect(() => {
    if (isAuthenticated) {
      loadSuppliers();
    } else {
      setSuppliers([]);
      setApiError(null);
    }
  }, [isAuthenticated, refreshTrigger]);

  const loadSuppliers = async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      const enhancedSuppliers = await enhancedSupplierService.getAllSuppliersWithUserDetails();
      setSuppliers(enhancedSuppliers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load suppliers:', errorMessage);
      
      // Check if it's an authentication error that requires re-login
      if (errorMessage.includes('login') || 
          errorMessage.includes('Authentication') || 
          errorMessage.includes('token')) {
        setApiError('Authentication expired. Please log in again to access suppliers.');
        // Trigger login modal or redirect to login
        // You could add logic here to automatically open login modal
      } else {
        setApiError(errorMessage);
      }
      
      // Fall back to empty list for authentication errors, sample data for others
      if (errorMessage.includes('login') || 
          errorMessage.includes('Authentication') || 
          errorMessage.includes('token')) {
        setSuppliers([]);
      } else {

        setSuppliers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const convertToDisplaySupplier = (enhancedSupplier: EnhancedSupplier): Supplier => ({
    id: enhancedSupplier.supplierId,
    name: enhancedSupplier.userName || `Supplier ${enhancedSupplier.supplierId}`,
    category: enhancedSupplier.categoryName || 'Unknown',
    email: enhancedSupplier.userDetails?.email || 'N/A',
    phone: enhancedSupplier.userDetails?.phoneNumber || 'N/A',
    status: 'active', // Default since backend doesn't have this field
    orders: 0, // Backend doesn't track order count in supplier entity
    address: enhancedSupplier.userDetails?.formattedAddress || 'N/A',
    contactPerson: enhancedSupplier.userDetails?.fullName || enhancedSupplier.userName || 'Unknown'
  });

  // If not authenticated, show sample data
  const displaySuppliers = isAuthenticated && suppliers.length > 0 
    ? suppliers.map(convertToDisplaySupplier)
    : sampleSuppliers;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Suppliers Directory</CardTitle>
            <CardDescription>
              {isAuthenticated 
                ? "Manage supplier information and contacts" 
                : "Please log in to view real supplier data"
              }
            </CardDescription>
          </div>
          <Button disabled={!isAuthenticated} onClick={onAddSupplier}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading suppliers...</div>
            </div>
          ) : apiError ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {apiError.includes('login') || apiError.includes('Authentication') || apiError.includes('token')
                    ? 'Authentication Required'
                    : 'API Error'
                  }
                </AlertTitle>
                <AlertDescription>
                  {apiError}
                  {(apiError.includes('login') || apiError.includes('Authentication') || apiError.includes('token')) && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onLoginClick}
                        className="mr-2"
                      >
                        Login Now
                      </Button>
                      {process.env.NODE_ENV === 'development' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            console.log('🔧 Running auth diagnostics...');
                            authDebug.debugAll();
                          }}
                        >
                          Debug Auth
                        </Button>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              {!(apiError.includes('login') || apiError.includes('Authentication') || apiError.includes('token')) && (
                <div className="text-sm text-muted-foreground">
                  Showing sample data instead:
                </div>
              )}
              {!(apiError.includes('login') || apiError.includes('Authentication') || apiError.includes('token')) && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sampleSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription>{supplier.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{supplier.email}</p>
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{supplier.phone}</p>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{supplier.address}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Contact: {supplier.contactPerson}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="default">
                          {supplier.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {supplier.orders} orders
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => onViewSupplier(supplier)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{supplier.email}</p>
                    </div>
                    {supplier.phone && supplier.phone !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{supplier.phone}</p>
                      </div>
                    )}
                    {supplier.address && supplier.address !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{supplier.address}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Contact: {supplier.contactPerson}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="default">
                        {supplier.status}
                      </Badge>
                      {!isAuthenticated && (
                        <span className="text-sm text-muted-foreground">
                          {supplier.orders} orders
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onViewSupplier(supplier)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" disabled={!isAuthenticated}>
                        <Edit className="mr-2 h-4 w-4" />
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
  const [newDeliveryLog, setNewDeliveryLog] = useState<DeliveryLogCreateRequest>({
    poId: 0,
    itemID: 0,
    receivedDate: '',
    receivedQuantity: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Load delivery logs on component mount and when authentication changes
  useEffect(() => {
    loadDeliveryLogs();
  }, [isAuthenticated]);

  const loadDeliveryLogs = async () => {
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
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      setApiError(errorMessage);
      
      // Set empty arrays on API failure
      setDeliveryLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter delivery logs by PO ID
  useEffect(() => {
    if (!poFilter) {
      setFilteredLogs(deliveryLogs);
    } else {
      const filtered = deliveryLogs.filter(log => 
        log.purchaseOrderId !== undefined && log.purchaseOrderId.toString().includes(poFilter)
      );
      setFilteredLogs(filtered);
    }
  }, [poFilter, deliveryLogs]);

  const handleCreateDeliveryLog = async () => {
    if (!newDeliveryLog.poId || !newDeliveryLog.receivedDate || !newDeliveryLog.receivedQuantity) {
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
        receivedQuantity: 0
      });
      
      setIsCreateSheetOpen(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('Failed to create delivery log:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create delivery log';
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Tracking</CardTitle>
              <CardDescription>Monitor recent shipment status and delivery progress</CardDescription>
            </div>
            <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
              <SheetTrigger asChild>
                <Button disabled={!isAuthenticated || !canAccessSupplierService()}>
                  <Plus className="mr-2 h-4 w-4" />
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
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="poId">Purchase Order ID</Label>
                    <Input
                      id="poId"
                      type="number"
                      placeholder="Enter PO ID"
                      value={newDeliveryLog.poId || ''}
                      onChange={(e) => setNewDeliveryLog(prev => ({
                        ...prev,
                        poId: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemID">Item ID</Label>
                    <Input
                      id="itemID"
                      type="number"
                      placeholder="Enter Item ID"
                      value={newDeliveryLog.itemID || ''}
                      onChange={(e) => setNewDeliveryLog(prev => ({
                        ...prev,
                        itemID: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receivedDate">Received Date</Label>
                    <Input
                      id="receivedDate"
                      type="date"
                      value={newDeliveryLog.receivedDate}
                      onChange={(e) => setNewDeliveryLog(prev => ({
                        ...prev,
                        receivedDate: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receivedQuantity">Received Quantity</Label>
                    <Input
                      id="receivedQuantity"
                      type="number"
                      placeholder="Enter quantity received"
                      value={newDeliveryLog.receivedQuantity || ''}
                      onChange={(e) => setNewDeliveryLog(prev => ({
                        ...prev,
                        receivedQuantity: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateDeliveryLog} 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Creating...' : 'Create Delivery Log'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateSheetOpen(false)}
                    className="flex-1"
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
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Authentication Status */}
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Authentication Required</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please login to access delivery logs and create new delivery entries.
              </p>
            </div>
          )}
          
          {isAuthenticated && apiError && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">API Connection Issue</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Using cached data. Some features may be limited. Error: {apiError}
              </p>
            </div>
          )}
          
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="poFilter" className="text-sm font-medium">
                Filter by Purchase Order ID
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="poFilter"
                  placeholder="Enter PO ID to filter..."
                  value={poFilter}
                  onChange={(e) => setPoFilter(e.target.value)}
                  className="flex-1"
                />
                {poFilter && (
                  <Button variant="outline" size="sm" onClick={clearFilter}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {deliveryLogs.length} recent logs
            </div>
          </div>

          {/* Delivery Logs List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading delivery logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <div className="text-muted-foreground">
                  {poFilter ? 'No delivery logs found for the specified PO ID' : 'No recent delivery logs'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={`${log.purchaseOrderId}-${log.receivedDate}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">PO #{log.purchaseOrderId}</span>
                      <Badge variant={getDeliveryStatusVariant(log.status || 'delivered')}>
                        {log.status || 'delivered'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Delivery Date: {new Date(log.receivedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Item ID: {log.itemId} • Quantity: {log.receivedQuantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Track Delivery">
                      <Truck className="h-4 w-4" />
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
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
            <CardDescription>Monthly purchase order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Order trends over time
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>On-time delivery rates by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Supplier performance metrics
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
  onOpenChange 
}: { 
  supplier: Supplier | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!supplier) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {supplier.name}
          </SheetTitle>
          <SheetDescription>
            Detailed information about {supplier.name}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Category:</span>
                <Badge variant="outline">{supplier.category}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                  {supplier.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Orders:</span>
                <span className="text-sm">{supplier.orders}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.contactPerson}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <div className="space-y-2">
              {samplePurchaseOrders
                .filter(order => order.supplier === supplier.name)
                .slice(0, 3)
                .map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${order.total}</p>
                      <Badge variant={getStatusVariant(order.status)} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Edit Supplier
            </Button>
            <Button variant="outline" className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
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
  onSupplierAdded 
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Get authentication context
  const { isAuthenticated } = useAuth();

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
  }, [isOpen, isAuthenticated]);

  const loadCategories = async () => {
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
      setError('Failed to load supplier categories. Please check if you are logged in and try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

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
          console.error('Failed to get current user as fallback:', currentUserError);
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
      console.log('👥 Cannot load all users (insufficient permissions), keeping empty');
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
        categoryId: parseInt(selectedCategoryId)
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to create supplier';
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
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add New Supplier</SheetTitle>
          <SheetDescription>
            Create a new supplier by associating a user with a supplier category.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to create suppliers and access supplier categories.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="userSearch">Search User</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userSearch"
                  placeholder="Type username or email to search..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {loadingUsers && (
                <div className="text-sm text-muted-foreground">Searching users...</div>
              )}
              
              {users.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {users.map((user) => (
                    <div 
                      key={user.id}
                      className={`p-2 rounded-md cursor-pointer border ${
                        selectedUserId === user.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setUserSearchTerm(user.username);
                      }}
                    >
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.username} • {user.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Supplier Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={!isAuthenticated}>
              <SelectTrigger>
                <SelectValue placeholder={!isAuthenticated ? "Please log in to select category" : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {!isAuthenticated ? (
                  <SelectItem value="auth-required" disabled>Please log in to view categories</SelectItem>
                ) : loadingCategories ? (
                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Information */}
          {selectedUserId && selectedCategoryId && (
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <h4 className="font-medium">Selected Information:</h4>
              <div className="text-sm space-y-1">
                <div>User: {users.find(u => u.id === selectedUserId)?.fullName || 'Selected User'}</div>
                <div>Category: {categories.find(c => c.categoryId.toString() === selectedCategoryId)?.name || 'Selected Category'}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !selectedUserId || !selectedCategoryId || !isAuthenticated}
              className="flex-1"
            >
              {submitting ? 'Creating...' : !isAuthenticated ? 'Please Login' : 'Create Supplier'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
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

// Helper functions
function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'secondary';
    case 'approved': return 'default';
    case 'shipped': return 'default';
    case 'delivered': return 'default';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

function getDeliveryStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'in-transit': return 'default';
    case 'delivered': return 'default';
    case 'delayed': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
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

// Sample data
const samplePurchaseOrders = [
  { id: 'PO-001', supplier: 'ABC Supplies', status: 'Pending', items: 15, total: '2,450.00', dueDate: '2024-01-15' },
  { id: 'PO-002', supplier: 'XYZ Corp', status: 'Approved', items: 8, total: '1,200.00', dueDate: '2024-01-20' },
  { id: 'PO-003', supplier: 'Global Imports', status: 'Shipped', items: 22, total: '3,800.00', dueDate: '2024-01-18' },
  { id: 'PO-004', supplier: 'ABC Supplies', status: 'Delivered', items: 12, total: '1,950.00', dueDate: '2024-01-10' },
];

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
    contactPerson: 'John Smith'
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
    contactPerson: 'Sarah Johnson'
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
    contactPerson: 'Mike Chen'
  },
];

const sampleDeliveries = [
  { id: 'DL-001', carrier: 'FedEx', trackingNumber: 'FX123456789', status: 'In-Transit', expectedDate: '2024-01-15' },
  { id: 'DL-002', carrier: 'UPS', trackingNumber: 'UP987654321', status: 'Delivered', expectedDate: '2024-01-12' },
  { id: 'DL-003', carrier: 'DHL', trackingNumber: 'DH456789123', status: 'Delayed', expectedDate: '2024-01-10' },
];


