'use client';

import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import type { Invoice } from '@/lib/types';
import { t, formatCurrency } from '@/lib/i18n';
import MetricCard from '@/components/ui/MetricCard';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Users,
  ArrowRight,
  Receipt,
  Bot,
  Clock,
  CheckCircle2,
  Package,
  Banknote,
  Building2,
  Mail,
  Camera,
} from 'lucide-react';

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });
const CashFlowChart = dynamic(() => import('@/components/charts/CashFlowChart'), { ssr: false });

const activityIcons: Record<string, typeof Receipt> = {
  invoice: Receipt,
  order: Package,
  payment: Banknote,
  supplier: Truck,
  customer: Building2,
  analysis: Bot,
};

// Build the last 6 months of revenue/expenses from real invoices.
function generateMonthlyData(invoices: Invoice[], lang: 'tr' | 'en') {
  const monthLabels = lang === 'tr'
    ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: monthLabels[d.getMonth()], revenue: 0, expenses: 0 };
  });
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));

  for (const inv of invoices) {
    const d = new Date(inv.issueDate);
    if (isNaN(d.getTime())) continue;
    const idx = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx === undefined) continue;
    if (inv.direction === 'outgoing') buckets[idx].revenue += inv.totalAmount;
    else buckets[idx].expenses += inv.totalAmount;
  }

  const revenueData = buckets.map((b) => ({ month: b.month, revenue: b.revenue, expenses: b.expenses }));
  const cashFlowData = revenueData.map((d) => ({ month: d.month, cashFlow: d.revenue - d.expenses }));

  return { revenueData, cashFlowData };
}

export default function DashboardPage() {
  const lang = useStore((s) => s.settings.language);
  const invoices = useStore((s) => s.invoices);
  const orders = useStore((s) => s.orders);
  const activities = useStore((s) => s.activities);
  const suppliers = useStore((s) => s.suppliers);
  const customers = useStore((s) => s.customers);

  const outgoing = invoices.filter((i) => i.direction === 'outgoing');
  const incoming = invoices.filter((i) => i.direction === 'incoming');
  const stats = {
    // Count all invoices (not just paid) so the cards match the charts below
    // and update immediately when a new invoice is captured.
    totalRevenue: outgoing.reduce((s, i) => s + i.totalAmount, 0),
    totalExpenses: incoming.reduce((s, i) => s + i.totalAmount, 0),
    outstandingReceivables: outgoing.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0),
    outstandingPayables: incoming.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0),
    overdueInvoices: invoices.filter((i) => i.status === 'overdue').length,
    pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
    activeSuppliers: suppliers.length,
    activeCustomers: customers.length,
    recentActivity: activities.slice(0, 10),
  };

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const recentInvoices = invoices.slice(0, 5);
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const { revenueData, cashFlowData } = generateMonthlyData(invoices, lang);
  const isEmpty = invoices.length === 0 && orders.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dash.title', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('dash.subtitle', lang)}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoices/capture" className="inline-flex items-center gap-2 remo-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Camera className="w-4 h-4" /> {lang === 'tr' ? 'Fatura Yakala' : 'Capture Invoice'}
          </Link>
          <Link href="/ai" className="hidden md:inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Bot className="w-4 h-4" /> {t('dash.aiAnalysis', lang)}
          </Link>
        </div>
      </div>

      {isEmpty && (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title={lang === 'tr' ? 'Remo\'ya hoş geldiniz! 👋' : 'Welcome to Remo! 👋'}
          description={lang === 'tr'
            ? 'İlk faturanızı ekleyin — gelir, gider ve nakit akışınız burada otomatik canlanacak.'
            : 'Add your first invoice — your revenue, expenses, and cash flow will come alive here automatically.'}
          actionLabel={lang === 'tr' ? 'İlk Faturanı Yakala' : 'Capture Your First Invoice'}
          actionHref="/invoices/capture"
          actionIcon={<Camera className="w-4 h-4" />}
        />
      )}

      {!isEmpty && (
      <>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label={t('dash.revenue', lang)}
          value={formatCurrency(stats.totalRevenue, 'TRY')}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          label={t('dash.expenses', lang)}
          value={formatCurrency(stats.totalExpenses, 'TRY')}
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <MetricCard
          label={t('dash.receivables', lang)}
          value={formatCurrency(stats.outstandingReceivables, 'TRY')}
          icon={<CreditCard className="w-5 h-5" />}
        />
        <MetricCard
          label={t('dash.payables', lang)}
          value={formatCurrency(stats.outstandingPayables, 'TRY')}
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label={t('dash.overdueInvoices', lang)}
          value={stats.overdueInvoices}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={stats.overdueInvoices > 0 ? (lang === 'tr' ? 'Dikkat gerekli' : 'Needs attention') : undefined}
          trendUp={false}
        />
        <MetricCard
          label={t('dash.pendingOrders', lang)}
          value={stats.pendingOrders}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <MetricCard
          label={t('dash.activeSuppliers', lang)}
          value={stats.activeSuppliers}
          icon={<Truck className="w-5 h-5" />}
        />
        <MetricCard
          label={t('dash.activeCustomers', lang)}
          value={stats.activeCustomers}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card title={t('dash.monthlyRevenue', lang)}>
          <RevenueChart data={revenueData} lang={lang} />
        </Card>
        <Card title={t('dash.cashFlow', lang)}>
          <CashFlowChart data={cashFlowData} lang={lang} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Overdue Invoices Warning */}
        {overdueInvoices.length > 0 && (
          <Card title={lang === 'tr' ? 'Vadesi Geçen Faturalar' : 'Overdue Invoices'} className="lg:col-span-2 border-red-200">
            <div className="space-y-3">
              {overdueInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{inv.direction === 'incoming' ? inv.fromCompany : inv.toCompany} — {lang === 'tr' ? 'Vade' : 'Due'}: {inv.dueDate}</p>
                  </div>
                  <span className="text-sm font-bold text-red-700">{formatCurrency(inv.totalAmount, inv.currency)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Active Orders */}
        <Card
          title={lang === 'tr' ? 'Aktif Siparişler' : 'Active Orders'}
          className={overdueInvoices.length > 0 ? '' : 'lg:col-span-2'}
        >
          {activeOrders.length === 0 ? (
            <p className="text-sm text-gray-500">{lang === 'tr' ? 'Aktif sipariş yok' : 'No active orders'}</p>
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 4).map((ord) => {
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  confirmed: 'bg-blue-100 text-blue-800',
                  in_transit: 'bg-purple-100 text-purple-800',
                };
                const statusLabels: Record<string, Record<string, string>> = {
                  tr: { pending: 'Bekliyor', confirmed: 'Onaylandı', in_transit: 'Yolda' },
                  en: { pending: 'Pending', confirmed: 'Confirmed', in_transit: 'In Transit' },
                };
                return (
                  <div key={ord.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ord.orderNumber}</p>
                      <p className="text-xs text-gray-500">{ord.counterparty}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ord.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[lang][ord.status] || ord.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(ord.totalAmount, ord.currency)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title={t('dash.recentActivity', lang)}>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 6).map((act) => {
              const Icon = activityIcons[act.type] || Clock;
              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{act.title}</p>
                    <p className="text-xs text-gray-500 truncate">{act.description}</p>
                  </div>
                  {act.amount && (
                    <span className="text-xs font-medium text-gray-700 shrink-0">
                      {formatCurrency(act.amount, act.currency)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card
        title={lang === 'tr' ? 'Son Faturalar' : 'Recent Invoices'}
        action={
          <Link href="/invoices" className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
            {t('dash.viewAll', lang)} <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">{t('inv.invoiceNo', lang)}</th>
                <th className="pb-3 font-medium">{t('inv.type', lang)}</th>
                <th className="pb-3 font-medium">{t('inv.company', lang)}</th>
                <th className="pb-3 font-medium">{t('inv.dueDate', lang)}</th>
                <th className="pb-3 font-medium text-right">{t('inv.amount', lang)}</th>
                <th className="pb-3 font-medium">{t('inv.status', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => {
                const statusColors: Record<string, string> = {
                  draft: 'bg-gray-100 text-gray-700',
                  sent: 'bg-blue-100 text-blue-700',
                  paid: 'bg-green-100 text-green-700',
                  overdue: 'bg-red-100 text-red-700',
                  cancelled: 'bg-gray-100 text-gray-500',
                };
                const statusLabels: Record<string, Record<string, string>> = {
                  tr: { draft: 'Taslak', sent: 'Gönderildi', paid: 'Ödendi', overdue: 'Vadesi Geçti', cancelled: 'İptal' },
                  en: { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled' },
                };
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700">{inv.type}</span>
                    </td>
                    <td className="py-3 text-gray-600">{inv.direction === 'incoming' ? inv.fromCompany : inv.toCompany}</td>
                    <td className="py-3 text-gray-600">{inv.dueDate}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>
                        {statusLabels[lang][inv.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      </>
      )}
    </div>
  );
}
