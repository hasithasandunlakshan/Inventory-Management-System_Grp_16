import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Eye,
  Package,
  DollarSign,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { productUtils } from '@/lib/utils/productUtils';

interface ProductCardProps {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly availableStock?: number;
  readonly reserved?: number;
  readonly imageUrl: string;
  readonly barcode: string;
  readonly categoryName?: string;
  readonly minThreshold?: number;
  readonly showActions?: boolean;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  stock,
  availableStock,
  reserved: _reserved, // eslint-disable-line @typescript-eslint/no-unused-vars
  imageUrl,
  barcode,
  categoryName,
  minThreshold = 10,
  showActions = true,
}: ProductCardProps) {
  const router = useRouter();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/products/edit/${id}`);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    productUtils.viewProductDetails(id.toString(), router);
  };

  const getStockStatus = () => {
    const currentStock = availableStock || stock;
    if (currentStock === 0) {
      return { status: 'out', color: 'secondary', icon: XCircle };
    } else if (currentStock <= minThreshold) {
      return { status: 'low', color: 'secondary', icon: AlertTriangle };
    } else {
      return { status: 'good', color: 'default', icon: CheckCircle };
    }
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <Card className='group hover:shadow-lg transition-all duration-200 border-0 shadow-md'>
      <CardHeader className='p-0'>
        {/* Image Section */}
        <div className='relative w-full h-48 overflow-hidden rounded-t-lg'>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-200'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              onError={e => {
                // Hide the image and show placeholder if it fails to load
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
          ) : null}

          {/* Fallback placeholder - always present but hidden when image loads */}
          <div
            className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${
              imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <div className='text-center'>
              <Package className='h-12 w-12 text-gray-400 mx-auto mb-2' />
              <p className='text-xs text-gray-500'>No Image</p>
            </div>
          </div>

          {/* Stock Status Badge */}
          <div className='absolute top-2 right-2'>
            <Badge
              variant={
                stockStatus.color as
                  | 'default'
                  | 'secondary'
                  | 'destructive'
                  | 'outline'
              }
              className='flex items-center gap-1'
            >
              <StockIcon className='h-3 w-3' />
              {(() => {
                switch (stockStatus.status) {
                  case 'out':
                    return 'Out';
                  case 'low':
                    return 'Low';
                  default:
                    return 'In Stock';
                }
              })()}
            </Badge>
          </div>

          {/* Category Badge */}
          {categoryName && (
            <div className='absolute top-2 left-2'>
              <Badge variant='secondary' className='flex items-center gap-1'>
                <Tag className='h-3 w-3' />
                {categoryName}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-4'>
        {/* Product Name */}
        <h3 className='font-bold text-lg mb-2 line-clamp-1 group-hover:text-gray-800 transition-colors'>
          {name}
        </h3>

        {/* Description */}
        <p className='text-gray-600 mb-3 line-clamp-2 text-sm'>{description}</p>

        {/* Price */}
        <div className='flex items-center gap-2 mb-3'>
          <DollarSign className='h-4 w-4 text-black' />
          <span className='text-xl font-bold text-black'>
            {price.toFixed(2)}
          </span>
        </div>

        {/* Stock Information */}
        <div className='mb-4'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Available Stock:</span>
            <span className='font-semibold text-black'>
              {availableStock || stock}
            </span>
          </div>
        </div>

        {/* Barcode */}
        <div className='text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded'>
          <span className='font-semibold'>Barcode:</span> {barcode}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleViewClick}
              className='flex-1 border-black text-black hover:bg-black hover:text-white'
            >
              <Eye className='h-4 w-4 mr-1' />
              View
            </Button>
            <Button
              variant='default'
              size='sm'
              onClick={handleEditClick}
              className='flex-1 bg-black text-white hover:bg-gray-800'
            >
              <Edit className='h-4 w-4 mr-1' />
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
