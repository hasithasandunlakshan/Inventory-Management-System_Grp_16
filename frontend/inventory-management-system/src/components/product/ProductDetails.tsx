'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  DollarSign, 
  Hash, 
  ArrowLeft, 
  Edit3,
  Eye,
  Tag,
  Info
} from 'lucide-react';
import { productUtils } from '@/lib/utils/productUtils';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetails({ product, onBack }: Readonly<ProductDetailsProps>) {
  const router = useRouter();

  const handleEdit = () => {
    productUtils.editProduct(product, router);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium text-foreground">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> ${product.price.toFixed(2)}
            </div>
            <div className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium text-foreground">
              <Package className="w-3.5 h-3.5 mr-1" /> {product.stock} in stock
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-start gap-4">
          <div className="relative h-14 w-14 rounded-md bg-muted overflow-hidden flex items-center justify-center">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="56px" />
            ) : (
              <Package className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{product.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border">
              <CardContent className="p-0">
                {product.imageUrl ? (
                  <div className="relative h-[360px] w-full">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
                    />
                  </div>
                ) : (
                  <div className="h-[360px] bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No image available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {product.barcodeImageUrl && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base font-semibold">
                    <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                    Product Barcode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-32 w-full bg-background rounded-md border">
                    <Image 
                      src={product.barcodeImageUrl} 
                      alt={`Barcode for ${product.name}`}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 font-mono text-center">
                    {product.barcode}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-semibold">
                  <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center mb-1.5">
                    <Tag className="w-3.5 h-3.5 mr-2" />
                    Product Name
                  </label>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center mb-1.5">
                    <Info className="w-3.5 h-3.5 mr-2" />
                    Description
                  </label>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center mb-1.5">
                    <Hash className="w-3.5 h-3.5 mr-2" />
                    Barcode
                  </label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded border inline-block">
                    {product.barcode}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="space-y-3">
                  <Button 
                    onClick={handleEdit}
                    size="sm"
                    className="w-full"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={onBack}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}