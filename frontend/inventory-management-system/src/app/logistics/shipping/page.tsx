'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api';
import {
  orderService,
  Order,
  OrderWithCustomer,
} from '@/lib/services/orderService';

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

// Traveling Salesman Problem solver using nearest neighbor heuristic
function solveTSP(waypoints: { lat: number; lng: number }[]): number[] {
  if (waypoints.length <= 1) return [0];

  const n = waypoints.length;
  const visited = new Array(n).fill(false);
  const route = [0]; // Start from first point
  visited[0] = true;

  for (let i = 1; i < n; i++) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const distance = calculateDistance(
          waypoints[route[route.length - 1]],
          waypoints[j]
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = j;
        }
      }
    }

    if (nearestIndex !== -1) {
      route.push(nearestIndex);
      visited[nearestIndex] = true;
    }
  }

  return route;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total route distance and estimated time
function calculateRouteMetrics(
  waypoints: { lat: number; lng: number }[],
  optimizedOrder: number[]
): {
  totalDistance: number;
  estimatedTime: number;
  waypointOrder: { lat: number; lng: number }[];
} {
  let totalDistance = 0;
  const waypointOrder: { lat: number; lng: number }[] = [];

  // Add optimized waypoints in order
  for (const index of optimizedOrder) {
    waypointOrder.push(waypoints[index]);
  }

  // Calculate distances between consecutive points
  for (let i = 0; i < waypointOrder.length - 1; i++) {
    totalDistance += calculateDistance(waypointOrder[i], waypointOrder[i + 1]);
  }

  // Estimate time (assuming average speed of 30 km/h in urban areas)
  const estimatedTime = totalDistance / 30; // hours

  return {
    totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
    estimatedTime: Math.round(estimatedTime * 100) / 100,
    waypointOrder,
  };
}

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
      const minDist = Math.min(
        ...centroids.map(centroid =>
          Math.sqrt(
            Math.pow(point[0] - centroid[0], 2) +
              Math.pow(point[1] - centroid[1], 2)
          )
        )
      );
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
        centroids[j][0] =
          clusterPoints.reduce((sum, p) => sum + p[0], 0) /
          clusterPoints.length;
        centroids[j][1] =
          clusterPoints.reduce((sum, p) => sum + p[1], 0) /
          clusterPoints.length;
      }
    }
  }

  return assignments;
}

const dummyOrders: ShippingOrder[] = [
  {
    id: 1,
    name: 'Order #001',
    lat: 6.9271,
    lng: 79.8612,
    address: 'Colombo, Sri Lanka',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Order #002',
    lat: 7.2906,
    lng: 80.6337,
    address: 'Kandy, Sri Lanka',
    status: 'Processing',
  },
  {
    id: 3,
    name: 'Order #003',
    lat: 6.0535,
    lng: 80.221,
    address: 'Galle, Sri Lanka',
    status: 'Ready',
  },
  {
    id: 4,
    name: 'Order #004',
    lat: 7.2083,
    lng: 79.8358,
    address: 'Negombo, Sri Lanka',
    status: 'Pending',
  },
  {
    id: 5,
    name: 'Order #005',
    lat: 5.9549,
    lng: 80.555,
    address: 'Matara, Sri Lanka',
    status: 'Processing',
  },
  {
    id: 6,
    name: 'Order #006',
    lat: 7.8731,
    lng: 80.7718,
    address: 'Anuradhapura, Sri Lanka',
    status: 'Ready',
  },
];

// Store location (starting point for all deliveries)
const storeLocation = {
  name: 'Main Store',
  address: 'Kegalle, Sri Lanka',
  lat: 7.2513,
  lng: 80.3464,
};

// Dummy Drivers with more details
const drivers = [
  { id: 1, name: 'John Silva', vehicle: 'Truck T-001' },
  { id: 2, name: 'Mary Fernando', vehicle: 'Van V-002' },
  { id: 3, name: 'David Perera', vehicle: 'Truck T-003' },
];

// Cluster colors for better visualization
const clusterColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

function ShippingPage() {
  const [clusters, setClusters] = useState<ClusteredOrder[][]>([]);
  const [numClusters, setNumClusters] = useState<number>(2);
  const [assignedDrivers, setAssignedDrivers] = useState<
    Record<number, string>
  >({});
  const [routes, setRoutes] = useState<(google.maps.DirectionsResult | null)[]>(
    []
  );
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(true);
  const [realOrders, setRealOrders] = useState<ShippingOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [routeMetrics, setRouteMetrics] = useState<
    {
      totalDistance: number;
      estimatedTime: number;
      waypointOrder: { lat: number; lng: number }[];
    }[]
  >([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState<
    {
      waypoints: { lat: number; lng: number }[];
      optimizedOrder: number[];
      metrics: {
        totalDistance: number;
        estimatedTime: number;
        waypointOrder: { lat: number; lng: number }[];
      };
    }[]
  >([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState<{
    originalDistance: number;
    optimizedDistance: number;
    savings: number;
    savingsPercentage: number;
  } | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  // Convert real order data to shipping order format
  const convertToShippingOrders = (orders: Order[]): ShippingOrder[] => {
    return orders.map((order, index) => {
      // Use real customer address from the order data
      let lat = 6.9271; // Default to Colombo coordinates
      let lng = 79.8612;
      let address = 'Address not available';

      // Check if order has customer address information
      if (
        order.customerAddress &&
        order.customerAddress !== 'Address not available' &&
        order.customerAddress !== 'Address not provided'
      ) {
        address = order.customerAddress;
        // Use customer coordinates if available
        if (order.customerLatitude && order.customerLongitude) {
          lat = order.customerLatitude;
          lng = order.customerLongitude;
        } else {
          // If no coordinates but have address, try to assign reasonable Sri Lankan coordinates
          // Based on common city patterns in addresses
          if (address.toLowerCase().includes('kandy')) {
            lat = 7.2906;
            lng = 80.6337;
          } else if (address.toLowerCase().includes('galle')) {
            lat = 6.0535;
            lng = 80.221;
          } else if (address.toLowerCase().includes('negombo')) {
            lat = 7.2083;
            lng = 79.8358;
          } else if (address.toLowerCase().includes('matara')) {
            lat = 5.9549;
            lng = 80.555;
          } else if (address.toLowerCase().includes('anuradhapura')) {
            lat = 7.8731;
            lng = 80.7718;
          } else if (address.toLowerCase().includes('batticaloa')) {
            lat = 6.9534;
            lng = 81.0077;
          } else if (address.toLowerCase().includes('kurunegala')) {
            lat = 8.3114;
            lng = 80.4037;
          }
          // Default to Colombo for other addresses
        }
      } else {
        // Fallback: assign default Sri Lankan locations for orders without addresses
        const fallbackLocations = [
          {
            lat: 6.9271,
            lng: 79.8612,
            address: 'Colombo, Sri Lanka (Default)',
          },
          { lat: 7.2906, lng: 80.6337, address: 'Kandy, Sri Lanka (Default)' },
          { lat: 6.0535, lng: 80.221, address: 'Galle, Sri Lanka (Default)' },
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
        status:
          order.status === 'CONFIRMED'
            ? 'Ready'
            : order.status === 'PROCESSED'
              ? 'Processing'
              : order.status === 'PENDING'
                ? 'Pending'
                : order.status,
        originalOrder: order,
      };
    });
  };

  // Fetch real orders function (made reusable)
  const fetchOrders = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoadingOrders(true);
      }
      setOrdersError(null);

      // Check if user is authenticated
      const token = localStorage.getItem('inventory_auth_token');
      if (!token) {
        setOrdersError('Please log in to view orders.');
        setRealOrders(dummyOrders);
        setUsingDummyData(true);
        return;
      }

      // Add cache-busting parameter to ensure fresh data
      const response = await orderService.getAllOrders();
      if (response.success && response.orders.length > 0) {
        const shippingOrders = convertToShippingOrders(response.orders);

        // Force state update with a new array reference
        setRealOrders([...shippingOrders]);
        setUsingDummyData(false);
      } else {
        setOrdersError(response.message || 'No orders found in database.');
        setRealOrders(dummyOrders);
        setUsingDummyData(true);
      }
    } catch (error) {
      setOrdersError(
        `Failed to load orders: ${error instanceof Error ? error.message : String(error)}`
      );
      setRealOrders(dummyOrders);
      setUsingDummyData(true);
    } finally {
      if (showLoadingState) {
        setIsLoadingOrders(false);
      }
    }
  }, []);

  // Fetch orders on component mount and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Auto-refresh every 2 minutes (reduced frequency)
    const intervalId = setInterval(() => {
      fetchOrders(false); // Don't show loading state for auto-refresh
    }, 120000); // 2 minutes = 120,000ms

    return () => clearInterval(intervalId);
  }, [fetchOrders]); // Include fetchOrders in dependencies

  // Get the current orders to display (real or dummy)
  const currentOrders = realOrders.length > 0 ? realOrders : dummyOrders;

  // Cluster Orders
  const handleClustering = () => {
    const coords = currentOrders.map(o => [o.lat, o.lng]);

    const clusterAssignments = kMeansCluster(coords, numClusters);

    const clustered: ClusteredOrder[] = currentOrders.map((order, i) => ({
      ...order,
      cluster: clusterAssignments[i],
    }));

    // Group by cluster and filter out empty clusters
    const grouped: ClusteredOrder[][] = [];
    for (let i = 0; i < numClusters; i++) {
      const clusterOrders = clustered.filter(o => o.cluster === i);
      if (clusterOrders.length > 0) {
        grouped.push(clusterOrders);
      }
    }

    setClusters(grouped);
    setRoutes([]); // reset routes
    setShowAllOrders(false);
    setSelectedCluster(null);

    // Calculate optimized routes for each cluster
    calculateOptimizedRoutes(grouped);
  };

  // Calculate optimized routes for all clusters
  const calculateOptimizedRoutes = (clusters: ClusteredOrder[][]) => {
    const newOptimizedRoutes: {
      waypoints: { lat: number; lng: number }[];
      optimizedOrder: number[];
      metrics: {
        totalDistance: number;
        estimatedTime: number;
        waypointOrder: { lat: number; lng: number }[];
      };
    }[] = [];

    const newRouteMetrics: {
      totalDistance: number;
      estimatedTime: number;
      waypointOrder: { lat: number; lng: number }[];
    }[] = [];

    clusters.forEach(cluster => {
      if (cluster.length === 0) return;

      // Create waypoints from cluster orders
      const waypoints = cluster.map(order => ({
        lat: order.lat,
        lng: order.lng,
      }));

      // Solve TSP to get optimized order
      const optimizedOrder = solveTSP(waypoints);

      // Calculate route metrics
      const metrics = calculateRouteMetrics(waypoints, optimizedOrder);

      newOptimizedRoutes.push({
        waypoints,
        optimizedOrder,
        metrics,
      });

      newRouteMetrics.push(metrics);
    });

    setOptimizedRoutes(newOptimizedRoutes);
    setRouteMetrics(newRouteMetrics);

    // Calculate comparison metrics
    calculateComparisonMetrics(clusters, newRouteMetrics);
  };

  // Calculate comparison between original and optimized routes
  const calculateComparisonMetrics = (
    clusters: ClusteredOrder[][],
    optimizedMetrics: typeof routeMetrics
  ) => {
    let originalTotalDistance = 0;
    let optimizedTotalDistance = 0;

    clusters.forEach((cluster, idx) => {
      if (cluster.length === 0) return;

      // Calculate original route distance (sequential order)
      const originalWaypoints = cluster.map(order => ({
        lat: order.lat,
        lng: order.lng,
      }));
      const originalOrder = Array.from(
        { length: originalWaypoints.length },
        (_, i) => i
      );
      const originalMetrics = calculateRouteMetrics(
        originalWaypoints,
        originalOrder
      );
      originalTotalDistance += originalMetrics.totalDistance;

      // Get optimized distance
      if (optimizedMetrics[idx]) {
        optimizedTotalDistance += optimizedMetrics[idx].totalDistance;
      }
    });

    const savings = originalTotalDistance - optimizedTotalDistance;
    const savingsPercentage =
      originalTotalDistance > 0 ? (savings / originalTotalDistance) * 100 : 0;

    setComparisonMetrics({
      originalDistance: Math.round(originalTotalDistance * 100) / 100,
      optimizedDistance: Math.round(optimizedTotalDistance * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    });
  };

  // Get Optimized Route for Specific Cluster
  const getRouteForCluster = (clusterIndex: number) => {
    if (!isLoaded || !window.google || !clusters[clusterIndex]) return;

    const cluster = clusters[clusterIndex];
    if (cluster.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();

    // Use optimized route if available, otherwise use original cluster order
    let waypoints;
    if (optimizedRoutes[clusterIndex]) {
      // Use TSP-optimized waypoint order
      const optimizedOrder = optimizedRoutes[clusterIndex].optimizedOrder;
      waypoints = optimizedOrder.map(index => ({
        location: {
          lat: cluster[index].lat,
          lng: cluster[index].lng,
        },
        stopover: true,
      }));
    } else {
      // Fallback to original order
      waypoints = cluster.map(order => ({
        location: { lat: order.lat, lng: order.lng },
        stopover: true,
      }));
    }

    // Route: Store -> Optimized Order -> Back to Store
    directionsService.route(
      {
        origin: { lat: storeLocation.lat, lng: storeLocation.lng },
        destination: { lat: storeLocation.lat, lng: storeLocation.lng },
        waypoints,
        optimizeWaypoints: false, // We're already optimized
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setRoutes(prev => {
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
    setRouteMetrics([]);
    setOptimizedRoutes([]);
    setComparisonMetrics(null);
    setShowComparison(false);
  };

  // Export route details
  const exportRoutes = () => {
    if (routeMetrics.length === 0) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      storeLocation: {
        name: storeLocation.name,
        address: storeLocation.address,
        coordinates: { lat: storeLocation.lat, lng: storeLocation.lng },
      },
      totalClusters: clusters.length,
      totalDistance: routeMetrics.reduce((sum, m) => sum + m.totalDistance, 0),
      totalTime: routeMetrics.reduce((sum, m) => sum + m.estimatedTime, 0),
      clusters: clusters.map((cluster, idx) => ({
        clusterNumber: idx + 1,
        orderCount: cluster.length,
        assignedDriver: assignedDrivers[idx] || 'Unassigned',
        routeMetrics: routeMetrics[idx],
        optimizedOrder: optimizedRoutes[idx]?.optimizedOrder || [],
        orders: cluster.map(order => ({
          id: order.id,
          name: order.name,
          address: order.address,
          status: order.status,
          coordinates: { lat: order.lat, lng: order.lng },
        })),
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delivery-routes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mx-auto mb-4' />
          <p className='text-gray-600'>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Shipping Management
              </h1>
              <p className='text-gray-600 mt-1'>
                Optimize delivery routes and manage orders
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-500'>
                Store:{' '}
                <span className='font-semibold text-gray-900'>
                  {storeLocation.address}
                </span>
              </div>

              <div className='text-sm text-gray-500'>
                Total Orders:{' '}
                <span className='font-semibold text-gray-900'>
                  {isLoadingOrders ? '...' : currentOrders.length}
                </span>
                {usingDummyData && (
                  <span className='ml-2 text-xs text-blue-600'>
                    (Sample Data)
                  </span>
                )}
              </div>
              <div className='text-sm text-gray-500'>
                Clusters:{' '}
                <span className='font-semibold text-gray-900'>
                  {clusters.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Status and Error Messages */}
        {ordersError && (
          <div className='mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-yellow-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-yellow-800'>
                  Authentication Required
                </h3>
                <p className='mt-1 text-sm text-yellow-700'>{ordersError}</p>
                {usingDummyData && (
                  <p className='mt-1 text-sm text-yellow-700'>
                    Showing sample data for demonstration purposes.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isLoadingOrders && (
          <div className='mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-3' />
              <p className='text-sm text-blue-700'>
                Loading orders from database...
              </p>
            </div>
          </div>
        )}

        {!isLoadingOrders && !ordersError && !usingDummyData && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-green-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-green-700'>
                  ✅ Successfully loaded {realOrders.length} orders from
                  database
                </p>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Control Panel */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Clustering Controls */}
            <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
                Route Optimization
              </h2>

              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='num-clusters'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Number of Clusters
                  </label>
                  <Input
                    id='num-clusters'
                    type='number'
                    min={1}
                    max={currentOrders.length}
                    value={numClusters}
                    onChange={e => setNumClusters(Number(e.target.value))}
                  />
                </div>

                <div className='flex space-x-3'>
                  <Button
                    className='flex-1'
                    onClick={handleClustering}
                    disabled={isLoadingOrders || currentOrders.length === 0}
                  >
                    Create Clusters
                  </Button>
                  <Button
                    variant='outline'
                    className='flex-1'
                    onClick={resetView}
                  >
                    Reset View
                  </Button>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => fetchOrders()}
                  disabled={isLoadingOrders}
                  className='w-full mt-2'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  {isLoadingOrders ? 'Refreshing...' : 'Refresh Orders'}
                </Button>
              </div>
            </div>

            {/* Orders List */}
            {showAllOrders && (
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                  All Orders
                </h2>

                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {isLoadingOrders ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
                      <span className='ml-2 text-sm text-gray-600'>
                        Loading orders...
                      </span>
                    </div>
                  ) : ordersError ? (
                    <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                      <p className='text-sm text-yellow-800'>{ordersError}</p>
                    </div>
                  ) : currentOrders.length === 0 ? (
                    <div className='p-3 text-center text-gray-500'>
                      <p className='text-sm'>
                        No orders available for delivery
                      </p>
                    </div>
                  ) : (
                    <>
                      {usingDummyData && (
                        <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3'>
                          <p className='text-sm text-blue-800'>
                            📝 Using sample data for demonstration. Connect to
                            database to see real orders.
                          </p>
                        </div>
                      )}
                      {currentOrders.map(order => (
                        <div
                          key={order.id}
                          className='p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'
                        >
                          <div className='flex justify-between items-start'>
                            <div className='flex-1'>
                              <h3 className='font-medium text-gray-900'>
                                {order.name}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {order.address}
                              </p>
                              {order.originalOrder?.customerInfo && (
                                <div className='mt-1 text-xs text-gray-500'>
                                  Customer:{' '}
                                  {order.originalOrder.customerInfo.fullName}
                                  {order.originalOrder.customerInfo
                                    .phoneNumber && (
                                    <span className='ml-2'>
                                      📞{' '}
                                      {
                                        order.originalOrder.customerInfo
                                          .phoneNumber
                                      }
                                    </span>
                                  )}
                                </div>
                              )}
                              {order.originalOrder && (
                                <div className='mt-1 text-xs text-gray-500'>
                                  Items: {order.originalOrder.orderItems.length}{' '}
                                  | Total: ${order.originalOrder.totalAmount}
                                </div>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            >
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

            {/* Route Optimization Summary */}
            {routeMetrics.length > 0 && (
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                  Route Optimization Summary
                </h2>

                <div className='space-y-4'>
                  {routeMetrics.map((metrics, idx) => (
                    <div
                      key={idx}
                      className='p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='font-semibold text-gray-900 flex items-center'>
                          <div
                            className='w-4 h-4 rounded-full mr-2'
                            style={{
                              backgroundColor:
                                clusterColors[idx % clusterColors.length],
                            }}
                          ></div>
                          Cluster {idx + 1} Route
                        </h3>
                        <span className='text-sm text-gray-500'>
                          {clusters[idx]?.length || 0} deliveries
                        </span>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-3'>
                        <div className='bg-white p-3 rounded-lg border border-gray-200'>
                          <div className='text-sm text-gray-600'>
                            Total Distance
                          </div>
                          <div className='text-lg font-semibold text-blue-600'>
                            {metrics.totalDistance} km
                          </div>
                        </div>
                        <div className='bg-white p-3 rounded-lg border border-gray-200'>
                          <div className='text-sm text-gray-600'>
                            Estimated Time
                          </div>
                          <div className='text-lg font-semibold text-green-600'>
                            {metrics.estimatedTime.toFixed(1)} hrs
                          </div>
                        </div>
                      </div>

                      <div className='text-sm text-gray-600'>
                        <div className='font-medium mb-1'>
                          Optimized Delivery Order:
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {optimizedRoutes[idx]?.optimizedOrder.map(
                            (orderIndex, orderIdx) => {
                              const order = clusters[idx]?.[orderIndex];
                              return order ? (
                                <span
                                  key={orderIdx}
                                  className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'
                                >
                                  {order.name}
                                </span>
                              ) : null;
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Overall Summary */}
                  <div className='p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
                    <h3 className='font-semibold text-gray-900 mb-3 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-purple-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                        />
                      </svg>
                      Overall Optimization
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-white p-3 rounded-lg border border-gray-200'>
                        <div className='text-sm text-gray-600'>
                          Total Distance
                        </div>
                        <div className='text-xl font-bold text-purple-600'>
                          {routeMetrics
                            .reduce((sum, m) => sum + m.totalDistance, 0)
                            .toFixed(1)}{' '}
                          km
                        </div>
                      </div>
                      <div className='bg-white p-3 rounded-lg border border-gray-200'>
                        <div className='text-sm text-gray-600'>Total Time</div>
                        <div className='text-xl font-bold text-pink-600'>
                          {routeMetrics
                            .reduce((sum, m) => sum + m.estimatedTime, 0)
                            .toFixed(1)}{' '}
                          hrs
                        </div>
                      </div>
                    </div>
                    <div className='mt-3 text-sm text-gray-600'>
                      <div className='flex items-center mb-3'>
                        <svg
                          className='w-4 h-4 mr-2 text-green-500'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Routes optimized using TSP algorithm for maximum
                        efficiency
                      </div>
                      <Button
                        onClick={() => exportRoutes()}
                        className='w-full bg-purple-600 hover:bg-purple-700 text-white'
                        size='sm'
                      >
                        <svg
                          className='w-4 h-4 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                        Export Route Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Route Comparison */}
            {comparisonMetrics && (
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                  Route Optimization Comparison
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Original Route */}
                  <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
                    <h3 className='font-semibold text-gray-900 mb-3 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-red-600'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Original Route (Sequential)
                    </h3>
                    <div className='text-2xl font-bold text-red-600 mb-2'>
                      {comparisonMetrics.originalDistance} km
                    </div>
                    <div className='text-sm text-red-700'>
                      No optimization applied
                    </div>
                  </div>

                  {/* Optimized Route */}
                  <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
                    <h3 className='font-semibold text-gray-900 mb-3 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-green-600'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Optimized Route (TSP)
                    </h3>
                    <div className='text-2xl font-bold text-green-600 mb-2'>
                      {comparisonMetrics.optimizedDistance} km
                    </div>
                    <div className='text-sm text-green-700'>
                      TSP algorithm applied
                    </div>
                  </div>
                </div>

                {/* Savings Summary */}
                <div className='mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200'>
                  <h3 className='font-semibold text-gray-900 mb-3 flex items-center'>
                    <svg
                      className='w-5 h-5 mr-2 text-yellow-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Optimization Results
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-yellow-600'>
                        {comparisonMetrics.savings} km
                      </div>
                      <div className='text-sm text-gray-600'>
                        Distance Saved
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-orange-600'>
                        {comparisonMetrics.savingsPercentage}%
                      </div>
                      <div className='text-sm text-gray-600'>
                        Efficiency Gain
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-green-600'>
                        {Math.round(comparisonMetrics.savings * 0.5 * 100) /
                          100}{' '}
                        hrs
                      </div>
                      <div className='text-sm text-gray-600'>Time Saved*</div>
                    </div>
                  </div>
                  <div className='mt-3 text-xs text-gray-500'>
                    * Estimated time savings based on 30 km/h average speed
                  </div>
                </div>
              </div>
            )}

            {/* Clusters List */}
            {clusters.length > 0 && (
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-purple-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Delivery Clusters
                </h2>
                <div className='space-y-4 max-h-96 overflow-y-auto'>
                  {clusters.map((cluster, idx) => {
                    const clusterKey =
                      cluster.map(o => o.id).join('-') || String(idx);
                    return (
                      <button
                        key={clusterKey}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCluster === idx
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleClusterClick(idx)}
                        type='button'
                      >
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='font-semibold text-gray-900 flex items-center'>
                            <div
                              className='w-4 h-4 rounded-full mr-2'
                              style={{
                                backgroundColor:
                                  clusterColors[idx % clusterColors.length],
                              }}
                            ></div>
                            Cluster {idx + 1}
                          </h3>
                          <span className='text-sm text-gray-500'>
                            {cluster.length} orders
                          </span>
                        </div>

                        <div className='space-y-2'>
                          {cluster.map(order => (
                            <div key={order.id} className='text-sm'>
                              <div className='flex justify-between items-center'>
                                <span className='text-gray-700'>
                                  {order.name}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className='text-xs text-gray-500'>
                                {order.address}
                              </div>
                              {order.originalOrder?.customerInfo && (
                                <div className='text-xs text-gray-400 mt-1'>
                                  👤 {order.originalOrder.customerInfo.fullName}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className='space-y-2'>
                          {cluster.map(order => (
                            <div key={order.id} className='text-sm'>
                              <div className='flex justify-between items-center'>
                                <span className='text-gray-700'>
                                  {order.name}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className='text-xs text-gray-500'>
                                {order.address}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Driver Assignment */}
                        <div className='mt-3 pt-3 border-t border-gray-200'>
                          <label
                            htmlFor={`driver-select-${idx}`}
                            className='block text-sm font-medium text-gray-700 mb-2'
                          >
                            Assign Driver:
                          </label>
                          <select
                            id={`driver-select-${idx}`}
                            value={assignedDrivers[idx] || ''}
                            onChange={e => {
                              e.stopPropagation();
                              setAssignedDrivers({
                                ...assignedDrivers,
                                [idx]: e.target.value,
                              });
                            }}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            onClick={e => e.stopPropagation()}
                          >
                            <option value=''>Select Driver</option>
                            {drivers.map(driver => (
                              <option
                                key={driver.id}
                                value={`${driver.name} (${driver.vehicle})`}
                              >
                                {driver.name} ({driver.vehicle})
                              </option>
                            ))}
                          </select>
                          {assignedDrivers[idx] && (
                            <p className='text-sm text-green-600 mt-2 font-medium'>
                              ✓ Assigned to: {assignedDrivers[idx]}
                            </p>
                          )}
                        </div>

                        {selectedCluster === idx && (
                          <div className='mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                            <div className='text-sm text-blue-800 font-medium mb-2'>
                              📍 Route Details:
                            </div>
                            <div className='text-xs text-blue-700 space-y-1'>
                              <div>
                                • Start: {storeLocation.name} (
                                {storeLocation.address})
                              </div>
                              <div>
                                • Deliveries: {cluster.length} locations
                              </div>
                              <div>• End: Return to {storeLocation.name}</div>
                            </div>

                            {/* Route Optimization Metrics */}
                            {routeMetrics[idx] && (
                              <div className='mt-3 p-2 bg-white rounded border border-blue-300'>
                                <div className='text-xs font-medium text-blue-800 mb-2'>
                                  🚀 Optimization Results:
                                </div>
                                <div className='grid grid-cols-2 gap-2 text-xs'>
                                  <div className='text-blue-700'>
                                    Distance:{' '}
                                    <span className='font-semibold'>
                                      {routeMetrics[idx].totalDistance} km
                                    </span>
                                  </div>
                                  <div className='text-blue-700'>
                                    Time:{' '}
                                    <span className='font-semibold'>
                                      {routeMetrics[idx].estimatedTime.toFixed(
                                        1
                                      )}{' '}
                                      hrs
                                    </span>
                                  </div>
                                </div>
                                <div className='text-xs text-blue-600 mt-1'>
                                  ✓ TSP-optimized delivery sequence
                                </div>
                              </div>
                            )}

                            <div className='text-sm text-blue-600 font-medium mt-2'>
                              Click cluster again to hide route
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100'>
              <div className='h-96 lg:h-[600px]'>
                <GoogleMap
                  center={{ lat: storeLocation.lat, lng: storeLocation.lng }}
                  zoom={8}
                  mapContainerStyle={{ height: '100%', width: '100%' }}
                >
                  {/* Always show store location */}
                  <Marker
                    position={{
                      lat: storeLocation.lat,
                      lng: storeLocation.lng,
                    }}
                    title={`${storeLocation.name} - ${storeLocation.address}`}
                    icon={{
                      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      fillColor: '#DC2626',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      scale: 10,
                    }}
                  />

                  {/* Show all orders when no clustering */}

                  {showAllOrders &&
                    currentOrders.map(order => (
                      <Marker
                        key={order.id}
                        position={{ lat: order.lat, lng: order.lng }}
                        title={`${order.name} - ${order.address}`}
                      />
                    ))}

                  {/* Show clustered orders */}
                  {!showAllOrders &&
                    clusters.map((cluster, clusterIdx) =>
                      cluster.map(order => (
                        <Marker
                          key={order.id}
                          position={{ lat: order.lat, lng: order.lng }}
                          title={`${order.name} - Cluster ${clusterIdx + 1}`}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor:
                              clusterColors[clusterIdx % clusterColors.length],
                            fillOpacity: 0.8,
                            strokeColor: '#ffffff',
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
                          strokeColor:
                            clusterColors[
                              selectedCluster % clusterColors.length
                            ],
                          strokeWeight: 4,
                        },
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
