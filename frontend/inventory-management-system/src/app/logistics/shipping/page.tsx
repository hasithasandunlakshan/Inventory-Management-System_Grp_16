"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { orderService, Order, OrderWithCustomer } from "@/lib/services/orderService";

type ShippingOrder = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  status: string;
  originalOrder?: OrderWithCustomer;
};

type ClusteredOrder = ShippingOrder & {
  cluster: number;
};

// Improved k-means implementation with better initialization
function kMeansCluster(points: number[][], k: number): number[] {
  if (points.length === 0 || k <= 0) return [];
  if (k >= points.length) {
    return points.map((_, i) => i);
  }
  
  // Use k-means++ initialization for better centroids
  const centroids: number[][] = [];
  
  // First centroid is random
  centroids.push([...points[Math.floor(Math.random() * points.length)]]);
  
  // Choose remaining centroids using k-means++
  for (let c = 1; c < k; c++) {
    const distances = points.map(point => {
      const minDist = Math.min(...centroids.map(centroid => 
        Math.sqrt(Math.pow(point[0] - centroid[0], 2) + Math.pow(point[1] - centroid[1], 2))
      ));
      return minDist * minDist;
    });
    
    const totalDist = distances.reduce((sum, d) => sum + d, 0);
    const target = Math.random() * totalDist;
    
    let cumulative = 0;
    for (let i = 0; i < points.length; i++) {
      cumulative += distances[i];
      if (cumulative >= target) {
        centroids.push([...points[i]]);
        break;
      }
    }
  }
  
  const assignments: number[] = [];
  let changed = true;
  
  // Iterate until convergence
  for (let iter = 0; iter < 100 && changed; iter++) {
    changed = false;
    
    // Assign points to closest centroid
    for (let i = 0; i < points.length; i++) {
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      for (let j = 0; j < centroids.length; j++) {
        const distance = Math.sqrt(
          Math.pow(points[i][0] - centroids[j][0], 2) +
          Math.pow(points[i][1] - centroids[j][1], 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }
      
      if (assignments[i] !== closestCentroid) {
        assignments[i] = closestCentroid;
        changed = true;
      }
    }
    
    // Update centroids
    for (let j = 0; j < k; j++) {
      const clusterPoints = points.filter((_, i) => assignments[i] === j);
      if (clusterPoints.length > 0) {
        centroids[j][0] = clusterPoints.reduce((sum, p) => sum + p[0], 0) / clusterPoints.length;
        centroids[j][1] = clusterPoints.reduce((sum, p) => sum + p[1], 0) / clusterPoints.length;
      }
    }
  }
  
  return assignments;
}

// Dummy Orders with complete data (fallback for when real data is unavailable)
const dummyOrders: ShippingOrder[] = [
  { 
    id: 1, 
    name: "Order #001", 
    lat: 6.9271, 
    lng: 79.8612, 
    address: "Colombo, Sri Lanka",
    status: "Pending"
  },
  { 
    id: 2, 
    name: "Order #002", 
    lat: 7.2906, 
    lng: 80.6337, 
    address: "Kandy, Sri Lanka",
    status: "Processing"
  },
  { 
    id: 3, 
    name: "Order #003", 
    lat: 6.0535, 
    lng: 80.221, 
    address: "Galle, Sri Lanka",
    status: "Ready"
  },
  { 
    id: 4, 
    name: "Order #004", 
    lat: 7.2083, 
    lng: 79.8358, 
    address: "Negombo, Sri Lanka",
    status: "Pending"
  },
  { 
    id: 5, 
    name: "Order #005", 
    lat: 5.9549, 
    lng: 80.555, 
    address: "Matara, Sri Lanka",
    status: "Processing"
  },
  { 
    id: 6, 
    name: "Order #006", 
    lat: 7.8731, 
    lng: 80.7718, 
    address: "Anuradhapura, Sri Lanka",
    status: "Ready"
  },
];

// Store location (starting point for all deliveries)
const storeLocation = {
  name: "Main Store",
  address: "Kegalle, Sri Lanka",
  lat: 7.2513,
  lng: 80.3464,
};

// Dummy Drivers with more details
const drivers = [
  { id: 1, name: "John Silva", vehicle: "Truck T-001" },
  { id: 2, name: "Mary Fernando", vehicle: "Van V-002" },
  { id: 3, name: "David Perera", vehicle: "Truck T-003" },
];

// Cluster colors for better visualization
const clusterColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

function ShippingPage() {
  const [clusters, setClusters] = useState<ClusteredOrder[][]>([]);
  const [numClusters, setNumClusters] = useState<number>(2);
  const [assignedDrivers, setAssignedDrivers] = useState<Record<number, string>>(
    {}
  );
  const [routes, setRoutes] = useState<(google.maps.DirectionsResult | null)[]>(
    []
  );
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(true);
  const [realOrders, setRealOrders] = useState<ShippingOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [usingDummyData, setUsingDummyData] = useState(false);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env
      .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  // Convert real order data to shipping order format
  const convertToShippingOrders = (orders: Order[]): ShippingOrder[] => {
    return orders.map((order, index) => {
      // Use real customer address from the order data
      let lat = 6.9271; // Default to Colombo coordinates
      let lng = 79.8612;
      let address = "Address not available";

      // Check if order has customer address information
      if (order.customerAddress && order.customerAddress !== "Address not available" && order.customerAddress !== "Address not provided") {
        address = order.customerAddress;
        // Use customer coordinates if available
        if (order.customerLatitude && order.customerLongitude) {
          lat = order.customerLatitude;
          lng = order.customerLongitude;
        } else {
          // If no coordinates but have address, try to assign reasonable Sri Lankan coordinates
          // Based on common city patterns in addresses
          if (address.toLowerCase().includes('kandy')) {
            lat = 7.2906; lng = 80.6337;
          } else if (address.toLowerCase().includes('galle')) {
            lat = 6.0535; lng = 80.221;
          } else if (address.toLowerCase().includes('negombo')) {
            lat = 7.2083; lng = 79.8358;
          } else if (address.toLowerCase().includes('matara')) {
            lat = 5.9549; lng = 80.555;
          } else if (address.toLowerCase().includes('anuradhapura')) {
            lat = 7.8731; lng = 80.7718;
          } else if (address.toLowerCase().includes('batticaloa')) {
            lat = 6.9534; lng = 81.0077;
          } else if (address.toLowerCase().includes('kurunegala')) {
            lat = 8.3114; lng = 80.4037;
          }
          // Default to Colombo for other addresses
        }
      } else {
        // Fallback: assign default Sri Lankan locations for orders without addresses
        const fallbackLocations = [
          { lat: 6.9271, lng: 79.8612, address: "Colombo, Sri Lanka (Default)" },
          { lat: 7.2906, lng: 80.6337, address: "Kandy, Sri Lanka (Default)" },
          { lat: 6.0535, lng: 80.221, address: "Galle, Sri Lanka (Default)" }
        ];
        const location = fallbackLocations[index % fallbackLocations.length];
        lat = location.lat;
        lng = location.lng;
        address = location.address;
      }

      return {
        id: order.orderId,
        name: `Order #${order.orderId.toString().padStart(3, '0')}`,
        lat: lat,
        lng: lng,
        address: address,
        status: order.status === 'CONFIRMED' ? 'Ready' : 
                order.status === 'PROCESSED' ? 'Processing' : 
                order.status === 'PENDING' ? 'Pending' : order.status,
        originalOrder: order
      };
    });
  };

  // Fetch real orders function (made reusable)
  const fetchOrders = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoadingOrders(true);
      }
      setOrdersError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('inventory_auth_token');
      console.log('🔐 Authentication status:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      if (!token) {
        console.warn('❌ No authentication token found. User needs to log in.');
        setOrdersError('Please log in to view orders.');
        setRealOrders(dummyOrders);
        setUsingDummyData(true);
        return;
      }
      
      // Add cache-busting parameter to ensure fresh data
      console.log('🚀 Fetching fresh orders from backend... (timestamp: ' + Date.now() + ')');
      const response = await orderService.getAllOrders();
      
      console.log('📡 Order service response:', {
        success: response.success,
        message: response.message,
        ordersCount: response.orders?.length || 0,
        totalOrders: response.totalOrders,
        timestamp: new Date().toISOString()
      });
      
      if (response.success && response.orders.length > 0) {
        const shippingOrders = convertToShippingOrders(response.orders);
        
        // Force state update with a new array reference
        setRealOrders([...shippingOrders]);
        setUsingDummyData(false);
        
        console.log(`✅ Successfully loaded ${response.orders.length} fresh orders from database`);
        console.log('📦 First few orders:', response.orders.slice(0, 3));
        console.log('🚢 Converted shipping orders:', shippingOrders.slice(0, 3));
        console.log('🔄 State updated at:', new Date().toISOString());
      } else {
        console.warn('⚠️ No orders found or failed to fetch orders:', response.message);
        setOrdersError(response.message || 'No orders found in database.');
        setRealOrders(dummyOrders);
        setUsingDummyData(true);
      }
    } catch (error) {
      console.error('💥 Failed to fetch orders:', error);
      setOrdersError(`Failed to load orders: ${error instanceof Error ? error.message : String(error)}`);
      setRealOrders(dummyOrders);
      setUsingDummyData(true);
    } finally {
      if (showLoadingState) {
        setIsLoadingOrders(false);
      }
    }
  };

  // Fetch orders on component mount and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Auto-refresh every 2 minutes (reduced frequency)
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing orders every 2 minutes...');
      fetchOrders(false); // Don't show loading state for auto-refresh
    }, 120000); // 2 minutes = 120,000ms

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only once

  // Get the current orders to display (real or dummy)
  const currentOrders = realOrders.length > 0 ? realOrders : dummyOrders;

  // Cluster Orders
  const handleClustering = () => {
    const coords = currentOrders.map((o) => [o.lat, o.lng]);
    const clusterAssignments = kMeansCluster(coords, numClusters);

    const clustered: ClusteredOrder[] = currentOrders.map((order, i) => ({
      ...order,
      cluster: clusterAssignments[i],
    }));

    // Group by cluster and filter out empty clusters
    const grouped: ClusteredOrder[][] = [];
    for (let i = 0; i < numClusters; i++) {
      const clusterOrders = clustered.filter((o) => o.cluster === i);
      if (clusterOrders.length > 0) {
        grouped.push(clusterOrders);
      }
    }

    setClusters(grouped);
    setRoutes([]); // reset routes
    setShowAllOrders(false);
    setSelectedCluster(null);
  };

  // Get Optimized Route for Specific Cluster
  const getRouteForCluster = (clusterIndex: number) => {
    if (!isLoaded || !window.google || !clusters[clusterIndex]) return;

    const cluster = clusters[clusterIndex];
    if (cluster.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();

    // Create waypoints from all orders in the cluster
    const waypoints = cluster.map((order) => ({
      location: { lat: order.lat, lng: order.lng },
      stopover: true,
    }));

    // Route: Store -> All Orders -> Back to Store
    directionsService.route(
      {
        origin: { lat: storeLocation.lat, lng: storeLocation.lng },
        destination: { lat: storeLocation.lat, lng: storeLocation.lng },
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setRoutes((prev) => {
            const newRoutes = [...prev];
            newRoutes[clusterIndex] = result;
            return newRoutes;
          });
        }
      }
    );
  };

  // Handle cluster click
  const handleClusterClick = (clusterIndex: number) => {
    if (selectedCluster === clusterIndex) {
      setSelectedCluster(null);
      setRoutes([]);
    } else {
      setSelectedCluster(clusterIndex);
      getRouteForCluster(clusterIndex);
    }
  };

  // Reset to show all orders
  const resetView = () => {
    setClusters([]);
    setRoutes([]);
    setShowAllOrders(true);
    setSelectedCluster(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Processing": return "bg-blue-100 text-blue-800";
      case "Ready": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
              <p className="text-gray-600 mt-1">Optimize delivery routes and manage orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Store: <span className="font-semibold text-gray-900">{storeLocation.address}</span>
              </div>
              <div className="text-sm text-gray-500">
                Total Orders: <span className="font-semibold text-gray-900">{isLoadingOrders ? '...' : currentOrders.length}</span>
                {usingDummyData && (
                  <span className="ml-2 text-xs text-blue-600">(Sample Data)</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Clusters: <span className="font-semibold text-gray-900">{clusters.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status and Error Messages */}
        {ordersError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
                <p className="mt-1 text-sm text-yellow-700">{ordersError}</p>
                {usingDummyData && (
                  <p className="mt-1 text-sm text-yellow-700">Showing sample data for demonstration purposes.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isLoadingOrders && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-3" />
              <p className="text-sm text-blue-700">Loading orders from database...</p>
            </div>
          </div>
        )}

        {!isLoadingOrders && !ordersError && !usingDummyData && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">✅ Successfully loaded {realOrders.length} orders from database</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Clustering Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Route Optimization
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="num-clusters" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Clusters
                  </label>
                  <Input
                    id="num-clusters"
                    type="number"
                    min={1}
                    max={currentOrders.length}
                    value={numClusters}
                    onChange={(e) => setNumClusters(Number(e.target.value))}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleClustering}
                    disabled={isLoadingOrders || currentOrders.length === 0}
                  >
                    Create Clusters
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={resetView}>
                    Reset View
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchOrders()}
                  disabled={isLoadingOrders}
                  className="w-full mt-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isLoadingOrders ? 'Refreshing...' : 'Refresh Orders'}
                </Button>
              </div>
            </div>

            {/* Orders List */}
            {showAllOrders && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  All Orders
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      <span className="ml-2 text-sm text-gray-600">Loading orders...</span>
                    </div>
                  ) : ordersError ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{ordersError}</p>
                    </div>
                  ) : currentOrders.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">
                      <p className="text-sm">No orders available for delivery</p>
                    </div>
                  ) : (
                    <>
                      {usingDummyData && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-sm text-blue-800">
                            📝 Using sample data for demonstration. Connect to database to see real orders.
                          </p>
                        </div>
                      )}
                      {currentOrders.map((order) => (
                    <div key={order.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{order.name}</h3>
                          <p className="text-sm text-gray-600">{order.address}</p>
                          {order.originalOrder?.customerInfo && (
                            <div className="mt-1 text-xs text-gray-500">
                              Customer: {order.originalOrder.customerInfo.fullName}
                              {order.originalOrder.customerInfo.phoneNumber && (
                                <span className="ml-2">📞 {order.originalOrder.customerInfo.phoneNumber}</span>
                              )}
                            </div>
                          )}
                          {order.originalOrder && (
                            <div className="mt-1 text-xs text-gray-500">
                              Items: {order.originalOrder.orderItems.length} | 
                              Total: ${order.originalOrder.totalAmount}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Clusters List */}
            {clusters.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Delivery Clusters
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {clusters.map((cluster, idx) => {
                    const clusterKey = cluster.map(o => o.id).join('-') || String(idx);
                    return (
                    <button 
                      key={clusterKey} 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCluster === idx 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleClusterClick(idx)}
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: clusterColors[idx % clusterColors.length] }}
                          ></div>
                          Cluster {idx + 1}
                        </h3>
                        <span className="text-sm text-gray-500">{cluster.length} orders</span>
                      </div>
                      
                      <div className="space-y-2">
                        {cluster.map((order) => (
                          <div key={order.id} className="text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">{order.name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{order.address}</div>
                            {order.originalOrder?.customerInfo && (
                              <div className="text-xs text-gray-400 mt-1">
                                👤 {order.originalOrder.customerInfo.fullName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Driver Assignment */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label htmlFor={`driver-select-${idx}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Assign Driver:
                        </label>
                        <select
                          id={`driver-select-${idx}`}
                          value={assignedDrivers[idx] || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            setAssignedDrivers({
                              ...assignedDrivers,
                              [idx]: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select Driver</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={`${driver.name} (${driver.vehicle})`}>
                              {driver.name} ({driver.vehicle})
                            </option>
                          ))}
                        </select>
                        {assignedDrivers[idx] && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            ✓ Assigned to: {assignedDrivers[idx]}
                          </p>
                        )}
                      </div>

                      {selectedCluster === idx && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-800 font-medium mb-2">
                            📍 Route Details:
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            <div>• Start: {storeLocation.name} ({storeLocation.address})</div>
                            <div>• Deliveries: {cluster.length} locations</div>
                            <div>• End: Return to {storeLocation.name}</div>
                          </div>
                          <div className="text-sm text-blue-600 font-medium mt-2">
                            Click cluster again to hide route
                          </div>
                        </div>
                      )}
                    </button>
                  );})}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="h-96 lg:h-[600px]">
                <GoogleMap
                  center={{ lat: storeLocation.lat, lng: storeLocation.lng }}
                  zoom={8}
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                >
                  {/* Always show store location */}
                  <Marker
                    position={{ lat: storeLocation.lat, lng: storeLocation.lng }}
                    title={`${storeLocation.name} - ${storeLocation.address}`}
                    icon={{
                      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      fillColor: "#DC2626",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                      scale: 10,
                    }}
                  />

                  {/* Show all orders when no clustering */}
                  {showAllOrders && currentOrders.map((order) => (
                    <Marker
                      key={order.id}
                      position={{ lat: order.lat, lng: order.lng }}
                      title={`${order.name} - ${order.address}`}
                    />
                  ))}

                  {/* Show clustered orders */}
                  {!showAllOrders && clusters.map((cluster, clusterIdx) =>
                    cluster.map((order) => (
                      <Marker
                        key={order.id}
                        position={{ lat: order.lat, lng: order.lng }}
                        title={`${order.name} - Cluster ${clusterIdx + 1}`}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          fillColor: clusterColors[clusterIdx % clusterColors.length],
                          fillOpacity: 0.8,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 8,
                        }}
                      />
                    ))
                  )}

                  {/* Show selected cluster route */}
                  {selectedCluster !== null && routes[selectedCluster] && (
                    <DirectionsRenderer 
                      directions={routes[selectedCluster]} 
                      options={{
                        polylineOptions: {
                          strokeColor: clusterColors[selectedCluster % clusterColors.length],
                          strokeWeight: 4,
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingPage;