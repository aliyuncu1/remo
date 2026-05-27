'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CashFlowChartProps {
  data: Array<{ month: string; cashFlow: number }>;
  lang: 'tr' | 'en';
}

export default function CashFlowChart({ data, lang }: CashFlowChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1_000_000) return `₺${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₺${(value / 1_000).toFixed(0)}K`;
    if (value <= -1_000_000) return `-₺${(Math.abs(value) / 1_000_000).toFixed(1)}M`;
    if (value <= -1_000) return `-₺${(Math.abs(value) / 1_000).toFixed(0)}K`;
    return `₺${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={formatValue} />
        <Tooltip
          formatter={(value) => [
            `₺${Number(value).toLocaleString('tr-TR')}`,
            lang === 'tr' ? 'Nakit Akışı' : 'Cash Flow',
          ]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        />
        <Area type="monotone" dataKey="cashFlow" stroke="#7c3aed" strokeWidth={2} fill="url(#cashFlowGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
