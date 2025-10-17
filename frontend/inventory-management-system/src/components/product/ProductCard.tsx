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
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { productUtils } from '@/lib/utils/product/productUtils';

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

  return (
    <Card className='group hover:shadow-xl transition-all duration-300 border rounded-lg overflow-hidden bg-white h-full flex flex-col'>
      <CardHeader className='p-0'>
        {/* Image Section - Compact */}
        <div className='relative w-full h-32 overflow-hidden bg-gray-50'>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className='object-contain group-hover:scale-110 transition-transform duration-300 p-1'
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

          {/* Fallback placeholder */}
          <div
            className={`w-full h-full bg-gray-50 flex items-center justify-center ${
              imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <Package className='h-8 w-8 text-gray-300' />
          </div>

          {/* Stock Status Badge - Top Right */}
          <div className='absolute top-1 right-1'>
            <Badge
              variant={
                stockStatus.color as
                  | 'default'
                  | 'secondary'
                  | 'destructive'
                  | 'outline'
              }
              className='text-[10px] px-1.5 py-0 shadow-sm leading-tight'
            >
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

          {/* Category Badge - Top Left */}
          {categoryName && (
            <div className='absolute top-1 left-1'>
              <Badge
                variant='secondary'
                className='text-[10px] px-1.5 py-0 bg-white/90 backdrop-blur-sm shadow-sm leading-tight'
              >
                {categoryName}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-2 flex-1 flex flex-col'>
        {/* Product Name - Compact */}
        <h3 className='font-semibold text-sm mb-0.5 line-clamp-2 text-gray-900 leading-tight min-h-[2rem]'>
          {name}
        </h3>

        {/* Description - Minimal space */}
        <p className='text-gray-500 mb-1 line-clamp-1 text-xs'>{description}</p>

        {/* Price - Prominent but compact */}
        <div className='mb-1'>
          <span className='text-xl font-bold text-gray-900'>
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Stock Information - Compact inline */}
        <div className='flex items-center gap-1 mb-1 text-xs'>
          <Package className='h-3 w-3 text-gray-400' />
          <span className='text-gray-600'>
            Stock: {availableStock || stock}
          </span>
        </div>

        {/* Barcode - Minimal space */}
        <div className='text-[10px] text-gray-400 mb-2 font-mono'>
          {barcode}
        </div>

        {/* Action Buttons - Compact */}
        <div className='mt-auto'>
          {showActions && (
            <div className='flex gap-1.5'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleViewClick}
                className='flex-1 h-7 text-[11px] border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200'
              >
                <Eye className='h-3 w-3 mr-1 transition-transform group-hover:scale-110' />
                View
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={handleEditClick}
                className='flex-1 h-7 text-[11px] bg-gray-900 hover:bg-gray-800 hover:shadow-md transition-all duration-200'
              >
                <Edit className='h-3 w-3 mr-1 transition-transform group-hover:scale-110' />
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
