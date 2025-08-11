import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { productUtils } from '@/lib/utils/productUtils'

interface ProductCardProps {
    id: string;
    name: string;   
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    barcode: string;
}

export default function ProductCard({ 
    id, 
    name, 
    description, 
    price, 
    stock, 
    imageUrl,
    barcode
}: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    productUtils.viewProductDetails(id, router);
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
        <p className="text-gray-600 mb-2 line-clamp-2">{description}</p>
        <div className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Barcode:</span> {barcode} 
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Price: ${price.toFixed(2)}</span>
          <span>Qty: {stock}</span>
        </div>
      </div>
    </div>
  )
}
