'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import { ShoppingCart, Search, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const lang = useStore((s) => s.settings.language);
  const orders = useStore((s) => s.orders);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'sales'>('all');

  const filtered = orders.filter((ord) => {
    const matchSearch = !search ||
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ord.counterparty.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || ord.type === filterType;
    return matchSearch && matchType;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  const statusLabels: Record<string, string> = lang === 'tr'
    ? { pending: 'Bekliyor', confirmed: 'Onaylandı', in_transit: 'Yolda', delivered: 'Teslim', cancelled: 'İptal' }
    : { pending: 'Pending', confirmed: 'Confirmed', in_transit: 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled' };

  const statusIcons: Record<string, typeof Package> = {
    pending: Clock, confirmed: CheckCircle2, in_transit: Truck, delivered: Package, cancelled: XCircle,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ord.title', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('ord.subtitle', lang)}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: lang === 'tr' ? 'Toplam' : 'Total', value: orders.length, color: 'text-gray-900' },
          { label: t('ord.purchase', lang), value: orders.filter((o) => o.type === 'purchase').length, color: 'text-orange-600' },
          { label: t('ord.sales', lang), value: orders.filter((o) => o.type === 'sales').length, color: 'text-green-600' },
          { label: t('ord.inTransit', lang), value: orders.filter((o) => o.status === 'in_transit').length, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('ord.search', lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'purchase', 'sales'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type === 'all' ? (lang === 'tr' ? 'Tümü' : 'All') : t(`ord.${type}`, lang)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{t('common.noResults', lang)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">{t('ord.orderNo', lang)}</th>
                  <th className="pb-3 font-medium">{lang === 'tr' ? 'Tip' : 'Type'}</th>
                  <th className="pb-3 font-medium">{t('ord.counterparty', lang)}</th>
                  <th className="pb-3 font-medium">{t('ord.date', lang)}</th>
                  <th className="pb-3 font-medium">{t('ord.delivery', lang)}</th>
                  <th className="pb-3 font-medium text-right">{t('ord.amount', lang)}</th>
                  <th className="pb-3 font-medium">{t('ord.status', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ord) => {
                  const Icon = statusIcons[ord.status] || Package;
                  return (
                    <tr key={ord.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{ord.orderNumber}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          ord.type === 'purchase' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {t(`ord.${ord.type}`, lang)}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700">{ord.counterparty}</td>
                      <td className="py-3 text-gray-600">{ord.orderDate}</td>
                      <td className="py-3 text-gray-600">{ord.actualDelivery || ord.expectedDelivery}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(ord.totalAmount, ord.currency)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ord.status]}`}>
                          <Icon className="w-3 h-3" />
                          {statusLabels[ord.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
