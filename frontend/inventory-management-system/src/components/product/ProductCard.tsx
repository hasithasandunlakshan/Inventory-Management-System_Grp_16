import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
    id: string;
    name: string;   
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    barcode: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function ProductCard({ 
    id, 
    name, 
    description, 
    price, 
    stock, 
    imageUrl,
    barcode,
    onEdit,
    onDelete 
}: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/products/${id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div>
        {imageUrl ? (
          <div className="relative w-full h-48 mb-4">
            <Image 
              src={imageUrl} 
              alt={name} 
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
            <p className="text-gray-500">No image</p>
          </div>
        )}
        <h3 className="font-bold text-lg mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <div className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Barcode:</span> {barcode} 
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Price: ${price.toFixed(2)}</span>
          <span>Qty: {stock}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button 
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          onClick={handleEditClick}
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDeleteClick}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
