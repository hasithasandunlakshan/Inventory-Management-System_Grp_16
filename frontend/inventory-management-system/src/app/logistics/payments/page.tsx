"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          border: "border-green-200"
        };
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200"
        };
      case "Failed":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200"
        };
      case "Cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200"
        };
      case "Refunded":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200"
        };
    }
  };

  // No emoji icons for payment methods

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">Track and manage all payment transactions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find specific payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Payments</Label>
              <Input
                id="search"
                placeholder="Search by customer, order, or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as PaymentStatus | "All")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Months</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedStatus("All");
                  setSelectedMonth("All");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>Showing {filteredPayments.length} of {dummyPayments.length} payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const statusStyle = getStatusStyle(payment.status);
                  return (
                    <tr key={payment.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold">{payment.id}</div>
                          <div className="text-sm text-muted-foreground">{payment.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">{payment.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{payment.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{payment.paymentMethod}</span>
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-muted-foreground">ID: {payment.transactionId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {payment.status === "Pending" && (
                            <Button variant="ghost" size="sm">Process</Button>
                          )}
                          {payment.status === "Completed" && (
                            <Button variant="ghost" size="sm">Refund</Button>
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
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



