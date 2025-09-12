"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilters } from "@/contexts/FilterContext";

export default function FiltersControls() {
  const { filters, updateFilter } = useFilters();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine the dashboard data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select 
              value={filters.timeRange} 
              onValueChange={(value) => updateFilter('timeRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="thisq">This quarter</SelectItem>
                <SelectItem value="thisy">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From</Label>
            <Input 
              type="date" 
              value={filters.fromDate}
              onChange={(e) => updateFilter('fromDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input 
              type="date" 
              value={filters.toDate}
              onChange={(e) => updateFilter('toDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Warehouse</Label>
            <Select 
              value={filters.warehouse} 
              onValueChange={(value) => updateFilter('warehouse', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="wh1">Warehouse 1</SelectItem>
                <SelectItem value="wh2">Warehouse 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


