'use client';

import { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/i18n';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import OnboardingWizard from '../onboarding/OnboardingWizard';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const init = useStore((s) => s.init);
  const initialized = useStore((s) => s.initialized);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const lang = useStore((s) => s.settings.language);
  const onboardingComplete = useStore((s) => s.settings.onboardingComplete);
  const darkMode = useStore((s) => s.settings.darkMode);
  const invoices = useStore((s) => s.invoices);
  const orders = useStore((s) => s.orders);
  const suppliers = useStore((s) => s.suppliers);
  const customers = useStore((s) => s.customers);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const searchResults = searchQuery.trim().length >= 2 ? [
    ...invoices
      .filter((i) =>
        i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.fromCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.toCompany.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3)
      .map((i) => ({
        type: lang === 'tr' ? 'Fatura' : 'Invoice',
        label: `${i.invoiceNumber} — ${i.direction === 'incoming' ? i.fromCompany : i.toCompany}`,
        sub: formatCurrency(i.totalAmount, i.currency),
        href: '/invoices',
      })),
    ...orders
      .filter((o) =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3)
      .map((o) => ({
        type: lang === 'tr' ? 'Sipariş' : 'Order',
        label: `${o.orderNumber} — ${o.counterparty}`,
        sub: formatCurrency(o.totalAmount, o.currency),
        href: '/orders',
      })),
    ...suppliers
      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((s) => ({
        type: lang === 'tr' ? 'Tedarikçi' : 'Supplier',
        label: s.name,
        sub: s.category,
        href: '/suppliers',
      })),
    ...customers
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((c) => ({
        type: lang === 'tr' ? 'Müşteri' : 'Customer',
        label: c.name,
        sub: c.sector,
        href: '/customers',
      })),
  ] : [];

  if (!initialized) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 remo-gradient rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse-soft">
            <span className="text-white font-bold">R</span>
          </div>
          <p className="text-sm text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {!onboardingComplete && <OnboardingWizard />}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar + Search */}
        <div className={`h-14 flex items-center gap-3 px-4 border-b shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200/80'}`}>
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'tr' ? 'Ara...' : 'Search...'}</span>
              <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">⌘K</kbd>
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</div>
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSearchOpen(false)} />
          <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'tr' ? 'Fatura, sipariş, firma ara...' : 'Search invoices, orders, companies...'}
                  className="flex-1 py-4 text-sm focus:outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-72 overflow-y-auto p-2">
                  {searchResults.map((r, i) => (
                    <Link
                      key={i}
                      href={r.href}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium shrink-0">
                        {r.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{r.label}</p>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{r.sub}</span>
                    </Link>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-400">
                  {lang === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}
                </div>
              )}

              {searchQuery.trim().length < 2 && (
                <div className="p-6 text-center text-xs text-gray-400">
                  {lang === 'tr' ? 'En az 2 karakter yazın' : 'Type at least 2 characters'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
