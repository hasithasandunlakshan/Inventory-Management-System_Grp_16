

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Package, User } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track sales performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Export
          </Button>
          <Button>
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-muted-foreground">8 due this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$123,456</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">321</div>
            <p className="text-xs text-muted-foreground">12 new this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <select className="border rounded px-2 py-1 text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="border rounded px-2 py-1 text-sm">
            <option value="all">All Total</option>
            <option value="gt100">&gt; $100</option>
            <option value="lt100">&lt; $100</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input type="text" className="border rounded px-2 py-1 text-sm" placeholder="Search orders..." />
          <Button variant="outline">Search</Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Order ID</th>
              <th className="py-2 px-4 text-left">Customer</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Total</th>
              <th className="py-2 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4">ORD-1001</td>
              <td className="py-2 px-4">John Doe</td>
              <td className="py-2 px-4"><Badge variant="secondary">Pending</Badge></td>
              <td className="py-2 px-4">$250.00</td>
              <td className="py-2 px-4">2025-08-20</td>
            </tr>
            <tr>
              <td className="py-2 px-4">ORD-1002</td>
              <td className="py-2 px-4">Jane Smith</td>
              <td className="py-2 px-4"><Badge variant="default">Completed</Badge></td>
              <td className="py-2 px-4">$120.00</td>
              <td className="py-2 px-4">2025-08-19</td>
            </tr>
            <tr>
              <td className="py-2 px-4">ORD-1003</td>
              <td className="py-2 px-4">Acme Corp</td>
              <td className="py-2 px-4"><Badge variant="destructive">Cancelled</Badge></td>
              <td className="py-2 px-4">$0.00</td>
              <td className="py-2 px-4">2025-08-18</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


