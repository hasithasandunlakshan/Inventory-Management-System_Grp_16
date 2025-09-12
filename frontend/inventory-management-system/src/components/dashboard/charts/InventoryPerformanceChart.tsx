"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";

interface InventoryData {
  category: string;
  totalValue: number;
  stockLevel: number;
  status: 'high' | 'medium' | 'low';
  products: number;
}

export default function InventoryPerformanceChart() {
  const { filters } = useFilters();
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      try {
        // Simulate data based on filters
        const mockData = generateMockInventoryData(filters.warehouse);
        setInventoryData(mockData);
        setTotalValue(mockData.reduce((sum, item) => sum + item.totalValue, 0));
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [filters]);

  const generateMockInventoryData = (warehouse: string): InventoryData[] => {
    const baseCategories = [
      { name: 'Electronics', base: 5000, stock: 85 },
      { name: 'Furniture', base: 8000, stock: 70 },
      { name: 'Books', base: 1200, stock: 95 },
      { name: 'Clothing', base: 3500, stock: 60 },
      { name: 'Sports', base: 2800, stock: 80 }
    ];

    const warehouseMultiplier = warehouse === 'wh1' ? 0.6 : warehouse === 'wh2' ? 0.4 : 1;
    
    return baseCategories.map(category => {
      const adjustedValue = category.base * warehouseMultiplier;
      const adjustedStock = Math.floor(category.stock * warehouseMultiplier * (0.8 + Math.random() * 0.4));
      
      return {
        category: category.name,
        totalValue: adjustedValue,
        stockLevel: adjustedStock,
        status: adjustedStock > 80 ? 'high' : adjustedStock > 50 ? 'medium' : 'low',
        products: Math.floor((adjustedValue / 100) * (0.5 + Math.random() * 0.5))
      };
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <Package className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...inventoryData.map(item => item.totalValue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Inventory Performance
          <span className="text-sm font-normal text-gray-500">
            Total: ${totalValue.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {inventoryData.filter(item => item.status === 'high').length}
              </p>
              <p className="text-sm text-gray-500">High Stock</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {inventoryData.filter(item => item.status === 'medium').length}
              </p>
              <p className="text-sm text-gray-500">Medium Stock</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {inventoryData.filter(item => item.status === 'low').length}
              </p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>

          {/* Category Performance */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Category Performance</h4>
            {inventoryData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${item.totalValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{item.products} products</div>
                  </div>
                </div>
                
                {/* Progress bar for value */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                    style={{ width: `${(item.totalValue / maxValue) * 100}%` }}
                  ></div>
                </div>
                
                {/* Stock level indicator */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stock Level: {item.stockLevel}%</span>
                  <span className={`font-medium ${
                    item.status === 'high' ? 'text-green-600' : 
                    item.status === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Info */}
          <div className="text-xs text-gray-500 flex justify-between pt-2 border-t">
            <span>Warehouse: {filters.warehouse === 'all' ? 'All Warehouses' : filters.warehouse.toUpperCase()}</span>
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
