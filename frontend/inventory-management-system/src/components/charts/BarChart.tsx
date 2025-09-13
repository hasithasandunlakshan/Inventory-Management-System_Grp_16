'use client';

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';

interface BarChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  orientation?: 'horizontal' | 'vertical';
  multipleBars?: boolean;
}

export function BarChart({
  data,
  config,
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  dataKey = 'value',
  xAxisKey = 'name',
  orientation = 'vertical',
  multipleBars = false,
}: BarChartProps) {
  const configKeys = Object.keys(config);
  
  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 80,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ 
            value: 'Value', 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        {showTooltip && (
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
        )}
        {showLegend && (
          <ChartLegend content={<ChartLegendContent />} />
        )}
        {multipleBars ? (
          configKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              name={String(config[key]?.label || key)}
            />
          ))
        ) : (
          <Bar dataKey={dataKey} fill="var(--color-bar)" />
        )}
      </RechartsBarChart>
    </ChartContainer>
  );
}
