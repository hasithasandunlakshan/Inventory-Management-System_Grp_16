import React from 'react'
import { Button } from '@/components/ui/button'

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
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
      <div>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-48 object-cover rounded-md mb-4"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.src = '/placeholder-image.png'; // Fallback image
            }}
          />
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
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          onClick={onDelete}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
