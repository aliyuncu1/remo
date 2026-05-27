'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; expenses: number }>;
  lang: 'tr' | 'en';
}

export default function RevenueChart({ data, lang }: RevenueChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1_000_000) return `₺${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₺${(value / 1_000).toFixed(0)}K`;
    return `₺${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={formatValue} />
        <Tooltip
          formatter={(value, name) => [
            `₺${Number(value).toLocaleString('tr-TR')}`,
            String(name) === 'revenue' ? (lang === 'tr' ? 'Gelir' : 'Revenue') : (lang === 'tr' ? 'Gider' : 'Expenses'),
          ]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        />
        <Legend
          formatter={(value: string) =>
            value === 'revenue' ? (lang === 'tr' ? 'Gelir' : 'Revenue') : (lang === 'tr' ? 'Gider' : 'Expenses')
          }
        />
        <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
