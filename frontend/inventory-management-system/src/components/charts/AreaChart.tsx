'use client';

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

interface AreaChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  dataKey?: string;
  xAxisKey?: string;
}

export function AreaChart({
  data,
  config,
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  dataKey = 'value',
  xAxisKey = 'name',
}: AreaChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsAreaChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        {showTooltip && (
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
        )}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="var(--color-area)"
          fill="var(--color-area)"
          fillOpacity={0.6}
        />
      </RechartsAreaChart>
    </ChartContainer>
  );
}
