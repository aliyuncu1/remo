'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import { Users, Search, MapPin, Phone, Mail, Building2 } from 'lucide-react';

export default function CustomersPage() {
  const lang = useStore((s) => s.settings.language);
  const customers = useStore((s) => s.customers);
  const [search, setSearch] = useState('');

  const filtered = customers.filter((cust) => {
    return !search ||
      cust.name.toLowerCase().includes(search.toLowerCase()) ||
      cust.sector.toLowerCase().includes(search.toLowerCase()) ||
      cust.city.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cust.title', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('cust.subtitle', lang)}</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('cust.search', lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('common.noResults', lang)}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((cust) => (
            <div key={cust.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{cust.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" /> {cust.city}, {cust.country}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                  {cust.sector}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('cust.totalOrders', lang)}</p>
                  <p className="text-lg font-bold text-gray-900">{cust.totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('cust.totalRevenue', lang)}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(cust.totalRevenue, cust.currency)}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {cust.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {cust.phone}
                  </p>
                </div>
                {cust.lastOrderDate && (
                  <p className="text-[10px] text-gray-400">
                    {t('cust.lastOrder', lang)}: {cust.lastOrderDate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
