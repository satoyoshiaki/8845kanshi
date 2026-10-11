import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { HistoryPoint } from '../../types'

interface Series {
  key: keyof HistoryPoint
  label: string
  color: string
}

interface MetricChartProps {
  data: HistoryPoint[]
  series: Series[]
  formatValue?: (value: number) => string
  domain?: [number | 'auto', number | 'auto']
  height?: number
}

export function MetricChart({ data, series, formatValue = (value) => `${value.toFixed(1)}%`, domain = [0, 'auto'], height = 240 }: MetricChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(point.timestamp)),
  }))
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 6, left: -24, bottom: 0 }}>
          <defs>
            {series.map((item) => (
              <linearGradient key={String(item.key)} id={`gradient-${String(item.key)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={item.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#172033" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" stroke="#526078" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} minTickGap={44} />
          <YAxis domain={domain} stroke="#526078" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(value) => formatValue(Number(value))} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#080D14', border: '1px solid #172033', borderRadius: 12, color: '#F8FAFC', fontSize: 12 }}
            labelStyle={{ color: '#94A3B8', marginBottom: 6 }}
            formatter={(value, name) => [formatValue(Number(value ?? 0)), series.find((item) => item.key === String(name))?.label ?? String(name)]}
          />
          {series.map((item) => (
            <Area key={String(item.key)} type="monotone" dataKey={item.key} stroke={item.color} strokeWidth={2} fill={`url(#gradient-${String(item.key)})`} isAnimationActive={false} connectNulls />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
