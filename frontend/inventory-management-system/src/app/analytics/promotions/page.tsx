"use client";

import { useState, useMemo } from "react";

// Beautiful Icon Components
const Icons = {
  Gift: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Percent: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

type PromotionStatus = "Active" | "Scheduled" | "Expired" | "Draft" | "Paused";
type PromotionType = "Percentage" | "Fixed Amount" | "Buy One Get One" | "Bundle" | "Free Shipping";

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  value: number;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  applicableProducts: string[];
  usageCount: number;
  usageLimit?: number;
  minimumOrderValue?: number;
  customerSegment: string;
  createdBy: string;
  totalSavings: number;
  clickThroughRate: number;
}

// Dummy promotions data
const dummyPromotions: Promotion[] = [
  {
    id: "PROMO001",
    title: "New Year Rice Festival",
    description: "Special discount on premium rice varieties for New Year celebrations",
    type: "Percentage",
    value: 15,
    status: "Active",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    applicableProducts: ["Rice (White) - 5kg", "Rice (Red) - 5kg", "Rice (Basmati) - 2kg"],
    usageCount: 245,
    usageLimit: 500,
    minimumOrderValue: 5000,
    customerSegment: "All Customers",
    createdBy: "Marketing Team",
    totalSavings: 75000,
    clickThroughRate: 12.5
  },
  {
    id: "PROMO002",
    title: "Tea Lover's Bundle",
    description: "Buy 2 tea packets, get 1 free premium Ceylon tea",
    type: "Buy One Get One",
    value: 1,
    status: "Active",
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    applicableProducts: ["Tea Packets - 100g", "Premium Ceylon Tea - 200g"],
    usageCount: 156,
    usageLimit: 300,
    minimumOrderValue: 2000,
    customerSegment: "Premium Customers",
    createdBy: "Sales Team",
    totalSavings: 45000,
    clickThroughRate: 18.3
  },
  {
    id: "PROMO003",
    title: "Free Delivery Weekend",
    description: "Free shipping on all orders above LKR 10,000 during weekends",
    type: "Free Shipping",
    value: 500,
    status: "Scheduled",
    startDate: "2025-02-01",
    endDate: "2025-02-28",
    applicableProducts: ["All Products"],
    usageCount: 0,
    customerSegment: "All Customers",
    createdBy: "Logistics Team",
    totalSavings: 0,
    clickThroughRate: 0
  },
  {
    id: "PROMO004",
    title: "Bulk Order Discount",
    description: "LKR 2000 off on orders above LKR 25,000",
    type: "Fixed Amount",
    value: 2000,
    status: "Active",
    startDate: "2025-01-20",
    endDate: "2025-03-20",
    applicableProducts: ["All Products"],
    usageCount: 89,
    usageLimit: 200,
    minimumOrderValue: 25000,
    customerSegment: "Wholesale Customers",
    createdBy: "Sales Manager",
    totalSavings: 178000,
    clickThroughRate: 8.7
  },
  {
    id: "PROMO005",
    title: "Oil & Spices Combo",
    description: "Special bundle price for coconut oil and spice collection",
    type: "Bundle",
    value: 10,
    status: "Paused",
    startDate: "2025-01-10",
    endDate: "2025-02-10",
    applicableProducts: ["Coconut Oil - 1L", "Spice Mix - 500g", "Curry Powder - 200g"],
    usageCount: 67,
    usageLimit: 150,
    minimumOrderValue: 3000,
    customerSegment: "Regular Customers",
    createdBy: "Product Manager",
    totalSavings: 25000,
    clickThroughRate: 14.2
  },
  {
    id: "PROMO006",
    title: "Christmas Sugar Sale",
    description: "20% discount on all sugar varieties for Christmas baking",
    type: "Percentage",
    value: 20,
    status: "Expired",
    startDate: "2024-12-15",
    endDate: "2024-12-31",
    applicableProducts: ["Sugar - 1kg", "Brown Sugar - 500g", "Icing Sugar - 250g"],
    usageCount: 423,
    usageLimit: 500,
    minimumOrderValue: 1500,
    customerSegment: "All Customers",
    createdBy: "Marketing Team",
    totalSavings: 95000,
    clickThroughRate: 22.1
  }
];

export default function PromotionsPage() {
  const [selectedStatus, setSelectedStatus] = useState<PromotionStatus | "All">("All");
  const [selectedType, setSelectedType] = useState<PromotionType | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get status color and icon
  const getStatusStyle = (status: PromotionStatus) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          icon: <Icons.CheckCircle />
        };
      case "Scheduled":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
          icon: <Icons.Clock />
        };
      case "Expired":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: <Icons.XCircle />
        };
      case "Draft":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
          icon: <Icons.Edit />
        };
      case "Paused":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          border: "border-orange-200",
          icon: <Icons.Clock />
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: <Icons.XCircle />
        };
    }
  };

  // Get promotion type icon and display
  const getPromotionTypeDisplay = (type: PromotionType, value: number) => {
    switch (type) {
      case "Percentage":
        return { icon: <Icons.Percent />, display: `${value}% OFF` };
      case "Fixed Amount":
        return { icon: <Icons.Tag />, display: `LKR ${value} OFF` };
      case "Buy One Get One":
        return { icon: <Icons.Gift />, display: `Buy ${value + 1} Get ${value}` };
      case "Bundle":
        return { icon: <Icons.Gift />, display: `${value}% Bundle Discount` };
      case "Free Shipping":
        return { icon: <Icons.TrendingUp />, display: "Free Shipping" };
      default:
        return { icon: <Icons.Tag />, display: "Special Offer" };
    }
  };

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    return dummyPromotions.filter(promotion => {
      const matchesStatus = selectedStatus === "All" || promotion.status === selectedStatus;
      const matchesType = selectedType === "All" || promotion.type === selectedType;
      const matchesSearch = searchTerm === "" || 
        promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [selectedStatus, selectedType, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const active = dummyPromotions.filter(p => p.status === "Active").length;
    const scheduled = dummyPromotions.filter(p => p.status === "Scheduled").length;
    const totalSavings = dummyPromotions.reduce((sum, p) => sum + p.totalSavings, 0);
    const avgClickThrough = dummyPromotions.reduce((sum, p) => sum + p.clickThroughRate, 0) / dummyPromotions.length;
    
    return { active, scheduled, totalSavings, avgClickThrough };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                <Icons.Gift />
                <span className="ml-3">Promotions & Offers</span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage marketing campaigns and promotional offers</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-500">Active Promotions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  LKR {stats.totalSavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Customer Savings</div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg flex items-center"
              >
                <Icons.Plus />
                <span className="ml-2">Create Promotion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
              </div>
              <div className="text-green-500">
                <Icons.CheckCircle />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Scheduled</p>
                <p className="text-3xl font-bold text-blue-700">{stats.scheduled}</p>
              </div>
              <div className="text-blue-500">
                <Icons.Clock />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Avg. Click Rate</p>
                <p className="text-3xl font-bold text-teal-700">{stats.avgClickThrough.toFixed(1)}%</p>
              </div>
              <div className="text-teal-500">
                <Icons.TrendingUp />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-cyan-700">{dummyPromotions.length}</p>
              </div>
              <div className="text-cyan-500">
                <Icons.Gift />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Icons.Search />
                <span className="ml-2">Search Promotions</span>
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Icons.Filter />
                <span className="ml-2">Status</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as PromotionStatus | "All")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Expired">Expired</option>
                <option value="Draft">Draft</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Icons.Tag />
                <span className="ml-2">Promotion Type</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as PromotionType | "All")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="All">All Types</option>
                <option value="Percentage">Percentage Discount</option>
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Buy One Get One">Buy One Get One</option>
                <option value="Bundle">Bundle Discount</option>
                <option value="Free Shipping">Free Shipping</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStatus("All");
                  setSelectedType("All");
                  setSearchTerm("");
                }}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPromotions.map((promotion) => {
            const statusStyle = getStatusStyle(promotion.status);
            const typeDisplay = getPromotionTypeDisplay(promotion.type, promotion.value);
            const usagePercentage = promotion.usageLimit ? (promotion.usageCount / promotion.usageLimit) * 100 : 0;
            
            return (
              <div key={promotion.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {typeDisplay.icon}
                      <span className="ml-2 text-2xl font-bold">{typeDisplay.display}</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {statusStyle.icon}
                      <span className="ml-1">{promotion.status}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{promotion.title}</h3>
                  <p className="text-blue-100 text-sm">{promotion.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Date Range */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Icons.Calendar />
                      <span className="ml-2">
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Usage Progress */}
                    {promotion.usageLimit && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Usage</span>
                          <span className="font-medium">{promotion.usageCount}/{promotion.usageLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">LKR {promotion.totalSavings.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Savings</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{promotion.clickThroughRate}%</div>
                        <div className="text-xs text-gray-600">Click Rate</div>
                      </div>
                    </div>

                    {/* Customer Segment */}
                    <div className="flex items-center text-sm">
                      <Icons.Users />
                      <span className="ml-2 text-gray-600">Target: {promotion.customerSegment}</span>
                    </div>

                    {/* Minimum Order */}
                    {promotion.minimumOrderValue && (
                      <div className="text-sm text-gray-600">
                        Min. Order: LKR {promotion.minimumOrderValue.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium flex items-center justify-center">
                      <Icons.Eye />
                      <span className="ml-2">View Details</span>
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center">
                      <Icons.Edit />
                      <span className="ml-2">Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPromotions.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4 text-gray-400">
              <Icons.Gift />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No promotions found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}


