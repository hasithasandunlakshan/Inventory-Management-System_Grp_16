'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { enhancedSupplierService } from '@/lib/services/enhancedSupplierService';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedSupplier } from '@/lib/types/supplier';

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
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<EnhancedSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
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
          <Button variant='outline'>
            <Plus className='mr-2 h-4 w-4' />
            Add Category
          </Button>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Add Supplier
          </Button>
        </div>
      </div>

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
                    <Button variant='outline' size='sm' className='flex-1'>
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
                  <span className='text-sm text-muted-foreground'>
                    {supplier.orders} orders
                  </span>
                </div>
                <div className='flex gap-2 pt-2'>
                  <Button variant='outline' size='sm' className='flex-1'>
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
      )}
    </div>
  );
}

export default function SuppliersPage() {
  return <SuppliersPageContent />;
}
