'use client';

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

interface VerticalBarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  xAxisKey?: string;
}

export function VerticalBarChart({
  data,
  config,
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  dataKey = 'value',
  xAxisKey = 'name',
}: VerticalBarChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80,
          }}
          barCategoryGap="10%"
          maxBarSize={40}
          barGap={2}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
          />
          {showTooltip && (
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
          )}
          <Bar 
            dataKey={dataKey} 
            fill="var(--color-bar)"
            radius={[4, 4, 0, 0]}
            name={String(config[dataKey]?.label || dataKey)}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
