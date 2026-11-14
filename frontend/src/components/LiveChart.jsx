import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { cn } from '../lib/utils';
import { EmptyState } from './ui/empty-state';

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-[12px] shadow-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium tabular">
        {Number(payload[0].value).toFixed(payload[0].dataKey === 'ear' ? 3 : 0)}
        {unit ? ` ${unit}` : ''}
      </p>
    </div>
  );
}

/**
 * Thin, unglamorous line chart for the sampled session series.
 * Colours come from the chart tokens, so it follows light/dark.
 */
export function SessionChart({ data = [], dataKey, label, unit, domain = [0, 100], colorClass = 'text-chart-1', height = 200 }) {
  const points = data.map((point, index) => ({
    i: index,
    index: `${index}`,
    risk: point.risk,
    ear: point.ear,
    fps: point.fps,
  }));

  if (!points.length) {
    return (
      <EmptyState
        title="Waiting for samples"
        description="The chart fills as telemetry arrives from /telemetry."
        className="py-10"
      />
    );
  }

  return (
    <div className={cn(colorClass)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} className="text-border" stroke="currentColor" strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            className="text-muted-foreground"
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
            width={40}
            className="text-muted-foreground"
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.3 }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke="currentColor"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SessionChart;
