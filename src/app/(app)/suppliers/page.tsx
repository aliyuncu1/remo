'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import { Truck, Search, Star, MapPin, Phone, Mail } from 'lucide-react';

export default function SuppliersPage() {
  const lang = useStore((s) => s.settings.language);
  const suppliers = useStore((s) => s.suppliers);
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter((sup) => {
    return !search ||
      sup.name.toLowerCase().includes(search.toLowerCase()) ||
      sup.category.toLowerCase().includes(search.toLowerCase()) ||
      sup.city.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sup.title', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('sup.subtitle', lang)}</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('sup.search', lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('common.noResults', lang)}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sup) => (
            <div key={sup.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{sup.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" /> {sup.city}, {sup.country}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-full font-medium">
                  {sup.category}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= sup.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500">{t('sup.totalOrders', lang)}</p>
                  <p className="text-sm font-bold text-gray-900">{sup.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('sup.totalSpent', lang)}</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(sup.totalSpent, sup.currency)}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> {sup.email}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {sup.phone}
                </p>
              </div>

              {sup.lastOrderDate && (
                <p className="text-[10px] text-gray-400 mt-3">
                  {t('sup.lastOrder', lang)}: {sup.lastOrderDate}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
