'use client';

import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';

interface DonutChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  data,
  config,
  className,
  height = 300,
  showTooltip = true,
  showLegend = true,
  dataKey = 'value',
  nameKey = 'name',
  innerRadius = 40,
  outerRadius = 80,
}: DonutChartProps) {
  const colors = Object.keys(config).map(key => config[key].color || `hsl(var(--${key}))`);

  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry[nameKey] || index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showTooltip && (
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
        )}
        {showLegend && (
          <ChartLegend content={<ChartLegendContent />} />
        )}
      </RechartsPieChart>
    </ChartContainer>
  );
}
