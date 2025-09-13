'use client';

import {
  Line,
  LineChart as RechartsLineChart,
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

interface LineChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  strokeWidth?: number;
  showDots?: boolean;
}

export function LineChart({
  data,
  config,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  dataKey = 'value',
  xAxisKey = 'name',
  strokeWidth = 2,
  showDots = true,
}: LineChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsLineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray='3 3' />}
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        <Line
          type='monotone'
          dataKey={dataKey}
          stroke='var(--color-line)'
          strokeWidth={strokeWidth}
          dot={showDots}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ChartContainer>
  );
}
