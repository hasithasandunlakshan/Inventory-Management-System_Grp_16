

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, DollarSign, Package } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customers and view their order history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Export
          </Button>
          <Button>
            New Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,024</div>
            <p className="text-xs text-muted-foreground">+30 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">210</div>
            <p className="text-xs text-muted-foreground">12 pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$87,654</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">in the last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <select className="border rounded px-2 py-1 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
          <select className="border rounded px-2 py-1 text-sm">
            <option value="all">All Spent</option>
            <option value="gt1000">&gt; $1000</option>
            <option value="lt1000">&lt; $1000</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input type="text" className="border rounded px-2 py-1 text-sm" placeholder="Search customers..." />
          <Button variant="outline">Search</Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Customers</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Customer ID</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4">CUST-2001</td>
              <td className="py-2 px-4">John Doe</td>
              <td className="py-2 px-4">john@example.com</td>
              <td className="py-2 px-4"><Badge variant="default">Active</Badge></td>
              <td className="py-2 px-4">$1,200.00</td>
            </tr>
            <tr>
              <td className="py-2 px-4">CUST-2002</td>
              <td className="py-2 px-4">Jane Smith</td>
              <td className="py-2 px-4">jane@example.com</td>
              <td className="py-2 px-4"><Badge variant="secondary">Inactive</Badge></td>
              <td className="py-2 px-4">$800.00</td>
            </tr>
            <tr>
              <td className="py-2 px-4">CUST-2003</td>
              <td className="py-2 px-4">Acme Corp</td>
              <td className="py-2 px-4">contact@acme.com</td>
              <td className="py-2 px-4"><Badge variant="destructive">Banned</Badge></td>
              <td className="py-2 px-4">$0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


