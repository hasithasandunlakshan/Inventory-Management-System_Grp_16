'use client';

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SimpleBarChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  color?: string;
  label?: string;
  showTooltip?: boolean;
}

export function SimpleBarChart({
  data,
  dataKey,
  xAxisKey,
  height = 400,
  color = '#8884d8',
  label = 'Value',
  showTooltip = true,
}: SimpleBarChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 100,
          }}
          barCategoryGap="15%"
          maxBarSize={50}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ 
              value: label, 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          {showTooltip && (
            <Tooltip 
              formatter={(value, name) => {
                if (dataKey === 'revenue') {
                  return [`$${Number(value).toLocaleString()}`, 'Revenue'];
                } else if (dataKey === 'orders') {
                  return [`${value} orders`, 'Orders'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                padding: '8px 12px',
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
          )}
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
            name={label}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
