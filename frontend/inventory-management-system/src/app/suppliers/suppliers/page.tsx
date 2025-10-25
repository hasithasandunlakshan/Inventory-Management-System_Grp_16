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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  Calendar,
  Shield,
  CheckCircle,
  X,
  Globe,
  MapPin as LocationIcon,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/sheet';
import { enhancedSupplierService } from '@/lib/services/enhancedSupplierService';
import { supplierCategoryService } from '@/lib/services/supplierCategoryService';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedSupplier, SupplierCategory } from '@/lib/types/supplier';

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

// Sample data - keeping suppliers for now
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

// Main component
function SuppliersPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<EnhancedSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Category filtering state
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);

  // View supplier state
  const [selectedSupplier, setSelectedSupplier] =
    useState<EnhancedSupplier | null>(null);
  const [isViewSupplierOpen, setIsViewSupplierOpen] = useState(false);
  const [loadingSupplierDetails, setLoadingSupplierDetails] = useState(false);

  // Load suppliers and categories on component mount
  useEffect(() => {
    loadSuppliers();
    loadCategories();
  }, []);

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

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await supplierCategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Don't set error state for categories as it's not critical
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handler to view supplier details
  const handleViewSupplier = async (supplierId: number) => {
    try {
      setLoadingSupplierDetails(true);

      // Find the supplier in the current suppliers list
      const supplier = suppliers.find(s => s.supplierId === supplierId);

      if (supplier) {
        setSelectedSupplier(supplier);
        setIsViewSupplierOpen(true);
      } else {
        setApiError('Supplier not found');
      }
    } catch (error) {
      setApiError('Failed to load supplier details');
    } finally {
      setLoadingSupplierDetails(false);
    }
  };

  // Handler for email action
  const handleSendEmail = (email: string) => {
    const subject = encodeURIComponent('Business Inquiry');
    const body = encodeURIComponent(
      'Hello,\n\nI would like to discuss business opportunities with you.\n\nBest regards'
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  // Handler for call action
  const handleCall = (phoneNumber: string) => {
    // Remove any non-digit characters except + for international numbers
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const telUrl = `tel:${cleanPhone}`;
    window.open(telUrl, '_self');
  };

  // Handler for map action
  const handleViewOnMap = (
    address: string,
    latitude?: number,
    longitude?: number
  ) => {
    if (latitude && longitude) {
      // If we have coordinates, use them for more accurate location
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (address) {
      // If no coordinates, use the address
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
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

  // Filter suppliers based on category and search term
  const filterSuppliers = (suppliersList: Supplier[]) => {
    return suppliersList.filter(supplier => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'all' ||
        supplier.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  };

  // Get suppliers to display (authenticated data or sample data)
  const allSuppliers =
    isAuthenticated && suppliers.length > 0
      ? suppliers.map(convertToDisplaySupplier)
      : sampleSuppliers;

  // Apply filtering
  const displaySuppliers = filterSuppliers(allSuppliers);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Suppliers Directory
          </h1>
          <p className='text-muted-foreground'>
            Manage supplier information and contacts
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => router.push('/suppliers/suppliers/add')}>
            <Plus className='mr-2 h-4 w-4' />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='search'>Search Suppliers</Label>
              <Input
                id='search'
                placeholder='Search by name, email, or contact...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category-filter'>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All categories' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.categoryId} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  {/* Add sample categories for demo */}
                  <SelectItem value='Electronics'>Electronics</SelectItem>
                  <SelectItem value='Office Supplies'>
                    Office Supplies
                  </SelectItem>
                  <SelectItem value='Furniture'>Furniture</SelectItem>
                </SelectContent>
              </Select>
              {loadingCategories && (
                <p className='text-sm text-muted-foreground'>
                  Loading categories...
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Results</Label>
              <div className='h-10 px-3 py-2 border rounded-md bg-muted flex items-center'>
                {displaySuppliers.length} supplier
                {displaySuppliers.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {filterSuppliers(sampleSuppliers).map(supplier => (
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
                      onClick={() => handleViewSupplier(supplier.id)}
                      disabled={loadingSupplierDetails}
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      View
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() =>
                        router.push(`/suppliers/suppliers/edit/${supplier.id}`)
                      }
                    >
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
                  <span className='text-sm text-muted-foreground'>
                    {supplier.orders} orders
                  </span>
                </div>
                <div className='flex gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => handleViewSupplier(supplier.id)}
                    disabled={loadingSupplierDetails}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    View
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() =>
                      router.push(`/suppliers/suppliers/edit/${supplier.id}`)
                    }
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

      {/* View Supplier Sheet */}
      {selectedSupplier && (
        <Sheet open={isViewSupplierOpen} onOpenChange={setIsViewSupplierOpen}>
          <SheetContent className='w-full sm:max-w-2xl overflow-y-auto'>
            <SheetHeader>
              <SheetTitle>
                Supplier Details -{' '}
                {selectedSupplier.userName ||
                  `Supplier ${selectedSupplier.supplierId}`}
              </SheetTitle>
              <SheetDescription>
                View comprehensive supplier information and contact details
              </SheetDescription>
            </SheetHeader>

            <div className='space-y-6 mt-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label>Supplier ID</Label>
                  <div className='text-sm font-medium'>
                    {selectedSupplier.supplierId}
                  </div>
                </div>
                <div>
                  <Label>Username</Label>
                  <div className='text-sm font-medium'>
                    {selectedSupplier.userName || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Full Name</Label>
                  <div className='text-sm font-medium'>
                    {selectedSupplier.userDetails?.fullName || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className='text-sm font-medium'>
                    {selectedSupplier.userDetails?.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <div className='text-sm font-medium'>
                    {selectedSupplier.userDetails?.phoneNumber || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <div className='text-sm font-medium'>
                    {selectedSupplier.categoryName || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className='border rounded-lg p-4 bg-muted/50'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Account Status
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Status
                    </Label>
                    <div className='flex items-center gap-2'>
                      <Badge
                        className={
                          selectedSupplier.userDetails?.accountStatus ===
                          'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {selectedSupplier.userDetails?.accountStatus ||
                          'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Email Verified
                    </Label>
                    <div className='flex items-center gap-2'>
                      {selectedSupplier.userDetails?.emailVerified ? (
                        <CheckCircle className='h-4 w-4 text-green-600' />
                      ) : (
                        <X className='h-4 w-4 text-red-600' />
                      )}
                      <span className='text-sm'>
                        {selectedSupplier.userDetails?.emailVerified
                          ? 'Verified'
                          : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className='border rounded-lg p-4 bg-muted/50'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <LocationIcon className='h-5 w-5' />
                  Location Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Address
                    </Label>
                    <div className='text-sm font-medium'>
                      {selectedSupplier.userDetails?.formattedAddress || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Coordinates
                    </Label>
                    <div className='text-sm font-medium'>
                      {selectedSupplier.userDetails?.latitude &&
                      selectedSupplier.userDetails?.longitude
                        ? `${selectedSupplier.userDetails.latitude}, ${selectedSupplier.userDetails.longitude}`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className='border rounded-lg p-4 bg-muted/50'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Profile Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Date of Birth
                    </Label>
                    <div className='text-sm font-medium'>
                      {selectedSupplier.userDetails?.dateOfBirth
                        ? new Date(
                            selectedSupplier.userDetails.dateOfBirth
                          ).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Account Created
                    </Label>
                    <div className='text-sm font-medium'>
                      {selectedSupplier.userDetails?.createdAt
                        ? new Date(
                            selectedSupplier.userDetails.createdAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Profile Image
                    </Label>
                    <div className='text-sm font-medium'>
                      {selectedSupplier.userDetails?.profileImageUrl
                        ? 'Available'
                        : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Role
                    </Label>
                    <div className='text-sm font-medium'>
                      {selectedSupplier.userDetails?.role || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className='border rounded-lg p-4 bg-muted/50'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <Mail className='h-5 w-5' />
                  Contact Actions
                </h4>
                <div className='flex gap-2 flex-wrap'>
                  {selectedSupplier.userDetails?.email && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-2'
                      onClick={() =>
                        handleSendEmail(selectedSupplier.userDetails!.email)
                      }
                    >
                      <Mail className='h-4 w-4' />
                      Send Email
                    </Button>
                  )}
                  {selectedSupplier.userDetails?.phoneNumber && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-2'
                      onClick={() =>
                        handleCall(selectedSupplier.userDetails!.phoneNumber!)
                      }
                    >
                      <Phone className='h-4 w-4' />
                      Call
                    </Button>
                  )}
                  {(selectedSupplier.userDetails?.formattedAddress ||
                    (selectedSupplier.userDetails?.latitude &&
                      selectedSupplier.userDetails?.longitude)) && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-2'
                      onClick={() =>
                        handleViewOnMap(
                          selectedSupplier.userDetails?.formattedAddress || '',
                          selectedSupplier.userDetails?.latitude,
                          selectedSupplier.userDetails?.longitude
                        )
                      }
                    >
                      <Globe className='h-4 w-4' />
                      View on Map
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export default function SuppliersPage() {
  return <SuppliersPageContent />;
}
