"use client";

import { useState, useMemo } from "react";

type PaymentStatus = "Pending" | "Completed" | "Failed" | "Cancelled" | "Refunded";

type Payment = {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  date: string;
  description: string;
  transactionId?: string;
};

// Dummy payment data
const dummyPayments: Payment[] = [
  {
    id: "PAY001",
    orderNumber: "ORD-2025-001",
    customerName: "Nimal Perera",
    amount: 25000,
    currency: "LKR",
    status: "Completed",
    paymentMethod: "Credit Card",
    date: "2025-01-15",
    description: "Product delivery payment",
    transactionId: "TXN123456789"
  },
  {
    id: "PAY002",
    orderNumber: "ORD-2025-002",
    customerName: "Kamala Silva",
    amount: 15500,
    currency: "LKR",
    status: "Pending",
    paymentMethod: "Bank Transfer",
    date: "2025-01-18",
    description: "Bulk order payment"
  },
  {
    id: "PAY003",
    orderNumber: "ORD-2025-003",
    customerName: "Sunil Fernando",
    amount: 8750,
    currency: "LKR",
    status: "Failed",
    paymentMethod: "Credit Card",
    date: "2025-01-20",
    description: "Express delivery payment"
  },
  {
    id: "PAY004",
    orderNumber: "ORD-2025-004",
    customerName: "Priya Jayawardena",
    amount: 42000,
    currency: "LKR",
    status: "Completed",
    paymentMethod: "Cash",
    date: "2025-01-22",
    description: "Wholesale purchase",
    transactionId: "TXN987654321"
  },
  {
    id: "PAY005",
    orderNumber: "ORD-2025-005",
    customerName: "Rajesh Kumar",
    amount: 18200,
    currency: "LKR",
    status: "Refunded",
    paymentMethod: "Digital Wallet",
    date: "2025-01-25",
    description: "Product return refund",
    transactionId: "TXN456789123"
  },
  {
    id: "PAY006",
    orderNumber: "ORD-2025-006",
    customerName: "Manjula Rathnayake",
    amount: 33500,
    currency: "LKR",
    status: "Cancelled",
    paymentMethod: "Bank Transfer",
    date: "2025-01-28",
    description: "Cancelled order payment"
  },
  {
    id: "PAY007",
    orderNumber: "ORD-2025-007",
    customerName: "Ashen Wijesinghe",
    amount: 12750,
    currency: "LKR",
    status: "Completed",
    paymentMethod: "Credit Card",
    date: "2025-02-01",
    description: "Regular delivery payment",
    transactionId: "TXN789123456"
  },
  {
    id: "PAY008",
    orderNumber: "ORD-2025-008",
    customerName: "Dilani Seneviratne",
    amount: 28900,
    currency: "LKR",
    status: "Pending",
    paymentMethod: "Digital Wallet",
    date: "2025-02-05",
    description: "Premium product payment"
  }
];

export default function PaymentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | "All">("All");
  const [selectedMonth, setSelectedMonth] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Get status color and icon
  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case "Completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          icon: "✓"
        };
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
          icon: "⏳"
        };
      case "Failed":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          icon: "✗"
        };
      case "Cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: "⊘"
        };
      case "Refunded":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
          icon: "↺"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: "?"
        };
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "Credit Card": return "💳";
      case "Bank Transfer": return "🏦";
      case "Cash": return "💵";
      case "Digital Wallet": return "📱";
      default: return "💰";
    }
  };

  // Filter payments
  const filteredPayments = useMemo(() => {
    return dummyPayments.filter(payment => {
      const matchesStatus = selectedStatus === "All" || payment.status === selectedStatus;
      
      const paymentDate = new Date(payment.date);
      const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = selectedMonth === "All" || paymentMonth === selectedMonth;
      
      const matchesSearch = searchTerm === "" || 
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesMonth && matchesSearch;
    });
  }, [selectedStatus, selectedMonth, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const completed = filteredPayments.filter(p => p.status === "Completed").length;
    const pending = filteredPayments.filter(p => p.status === "Pending").length;
    const failed = filteredPayments.filter(p => p.status === "Failed").length;
    
    return { total, completed, pending, failed, count: filteredPayments.length };
  }, [filteredPayments]);

  // Get unique months from payments
  const availableMonths = useMemo(() => {
    const months = dummyPayments.map(payment => {
      const date = new Date(payment.date);
      return {
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      };
    });
    
    const uniqueMonths = months.filter((month, index, self) => 
      index === self.findIndex(m => m.value === month.value)
    );
    
    return uniqueMonths.sort((a, b) => b.value.localeCompare(a.value));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Payment Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Track and manage all payment transactions</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {stats.count}
                </div>
                <div className="text-sm text-gray-500">Total Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  LKR {stats.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Amount</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
              </div>
              <div className="text-3xl text-green-500">✓</div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="text-3xl text-yellow-500">⏳</div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-3xl font-bold text-red-700">{stats.failed}</p>
              </div>
              <div className="text-3xl text-red-500">✗</div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Success Rate</p>
                <p className="text-3xl font-bold text-indigo-700">
                  {stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0}%
                </p>
              </div>
              <div className="text-3xl text-indigo-500">📊</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Payments
              </label>
              <input
                type="text"
                placeholder="Search by customer, order, or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📋 Payment Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus | "All")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Filter by Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="All">All Months</option>
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStatus("All");
                  setSelectedMonth("All");
                  setSearchTerm("");
                }}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold"
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-900">Payment Transactions</h2>
            <p className="text-gray-600 mt-1">Showing {filteredPayments.length} of {dummyPayments.length} payments</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const statusStyle = getStatusStyle(payment.status);
                  return (
                    <tr key={payment.id} className="hover:bg-white/50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{payment.id}</div>
                          <div className="text-sm text-gray-600">{payment.orderNumber}</div>
                          <div className="text-xs text-gray-500">{payment.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                          <span className="text-sm font-medium text-gray-900">{payment.paymentMethod}</span>
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          <span className="mr-1">{statusStyle.icon}</span>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                            View
                          </button>
                          {payment.status === "Pending" && (
                            <button className="text-green-600 hover:text-green-900 font-medium">
                              Process
                            </button>
                          )}
                          {payment.status === "Completed" && (
                            <button className="text-blue-600 hover:text-blue-900 font-medium">
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


