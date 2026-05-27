'use client';

import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, Receipt, Truck } from 'lucide-react';

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });

const COLORS = ['#7c3aed', '#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export default function ReportsPage() {
  const lang = useStore((s) => s.settings.language);
  const invoices = useStore((s) => s.invoices);
  const suppliers = useStore((s) => s.suppliers);
  const customers = useStore((s) => s.customers);

  const outgoing = invoices.filter((i) => i.direction === 'outgoing');
  const incoming = invoices.filter((i) => i.direction === 'incoming');
  const totalRevenue = outgoing.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const totalExpenses = incoming.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Invoice status distribution
  const statusData = [
    { name: lang === 'tr' ? 'Ödendi' : 'Paid', value: invoices.filter((i) => i.status === 'paid').length },
    { name: lang === 'tr' ? 'Gönderildi' : 'Sent', value: invoices.filter((i) => i.status === 'sent').length },
    { name: lang === 'tr' ? 'Vadesi Geçti' : 'Overdue', value: invoices.filter((i) => i.status === 'overdue').length },
    { name: lang === 'tr' ? 'Taslak' : 'Draft', value: invoices.filter((i) => i.status === 'draft').length },
  ].filter((d) => d.value > 0);

  // Supplier spending
  const supplierSpending = suppliers
    .map((s) => ({ name: s.name, spent: s.totalSpent, currency: s.currency }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  // Customer revenue
  const customerRevenue = customers
    .map((c) => ({ name: c.name, revenue: c.totalRevenue, currency: c.currency }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const months = lang === 'tr'
    ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const monthlyData = [
    { month: months[0], revenue: 320_000, expenses: 180_000 },
    { month: months[1], revenue: 480_000, expenses: 220_000 },
    { month: months[2], revenue: 390_000, expenses: 310_000 },
    { month: months[3], revenue: 620_000, expenses: 280_000 },
    { month: months[4], revenue: 710_000, expenses: 350_000 },
    { month: months[5], revenue: 540_000, expenses: 190_000 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('rep.title', lang)}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('rep.subtitle', lang)}</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">{t('dash.revenue', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue, 'TRY')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">{t('dash.expenses', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses, 'TRY')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">{lang === 'tr' ? 'Net Kâr' : 'Net Profit'}</span>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit, 'TRY')}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card title={t('dash.monthlyRevenue', lang)} className="lg:col-span-2">
          <RevenueChart data={monthlyData} lang={lang} />
        </Card>

        <Card title={lang === 'tr' ? 'Fatura Durumları' : 'Invoice Status'}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Supplier & Customer Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={lang === 'tr' ? 'En Çok Harcanan Tedarikçiler' : 'Top Suppliers by Spending'}>
          <div className="space-y-3">
            {supplierSpending.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(s.spent / supplierSpending[0].spent) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatCurrency(s.spent, s.currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={lang === 'tr' ? 'En Çok Gelir Getiren Müşteriler' : 'Top Customers by Revenue'}>
          <div className="space-y-3">
            {customerRevenue.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(c.revenue / customerRevenue[0].revenue) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatCurrency(c.revenue, c.currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
