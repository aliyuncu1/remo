'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { Receipt, Search, Filter, FileText, AlertTriangle, CheckCircle2, Clock, XCircle, Mail, Download, Plus, Camera, X } from 'lucide-react';
import { exportInvoicePDF } from '@/lib/pdf-export';
import EmptyState from '@/components/ui/EmptyState';
import type { Invoice } from '@/lib/types';

export default function InvoicesPage() {
  const lang = useStore((s) => s.settings.language);
  const invoices = useStore((s) => s.invoices);
  const updateInvoiceStatus = useStore((s) => s.updateInvoiceStatus);
  const [search, setSearch] = useState('');
  const [filterDir, setFilterDir] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Look up live so status changes reflect immediately in the modal.
  const selected = invoices.find((i) => i.id === selectedId) || null;

  const filtered = invoices.filter((inv) => {
    const matchSearch = !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.fromCompany.toLowerCase().includes(search.toLowerCase()) ||
      inv.toCompany.toLowerCase().includes(search.toLowerCase());
    const matchDir = filterDir === 'all' || inv.direction === filterDir;
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchDir && matchStatus;
  });

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const statusLabels: Record<string, string> = lang === 'tr'
    ? { draft: 'Taslak', sent: 'Gönderildi', paid: 'Ödendi', overdue: 'Vadesi Geçti', cancelled: 'İptal' }
    : { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled' };

  const statusIcons: Record<string, typeof Receipt> = {
    draft: FileText,
    sent: Clock,
    paid: CheckCircle2,
    overdue: AlertTriangle,
    cancelled: XCircle,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inv.title', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('inv.subtitle', lang)}</p>
        </div>
        <Link
          href="/invoices/capture"
          className="inline-flex items-center gap-2 remo-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === 'tr' ? 'Fatura Yakala' : 'Capture Invoice'}</span>
        </Link>
      </div>

      {/* e-Fatura compliance banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Receipt className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-violet-900">
            {lang === 'tr' ? 'e-Fatura / e-Arşiv Uyumlu' : 'e-Fatura / e-Archive Compliant'}
          </p>
          <p className="text-xs text-violet-700 mt-0.5">{t('inv.complianceNote', lang)}</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'remo-gradient text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status === 'all'
              ? (lang === 'tr' ? 'Tümü' : 'All')
              : statusLabels[status]}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filterStatus === status ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {statusCounts[status] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('inv.search', lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'incoming', 'outgoing'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setFilterDir(dir)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDir === dir
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {dir === 'all'
                  ? (lang === 'tr' ? 'Tümü' : 'All')
                  : dir === 'incoming'
                    ? t('inv.incoming', lang)
                    : t('inv.outgoing', lang)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title={lang === 'tr' ? 'Henüz faturanız yok' : 'No invoices yet'}
          description={lang === 'tr'
            ? 'İlk faturanızı yakalayın — fotoğrafını çekin ya da yükleyin, AI saniyeler içinde okusun.'
            : 'Capture your first invoice — take a photo or upload it, and AI reads it in seconds.'}
          actionLabel={lang === 'tr' ? 'Fatura Yakala' : 'Capture Invoice'}
          actionHref="/invoices/capture"
          actionIcon={<Camera className="w-4 h-4" />}
        />
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{t('common.noResults', lang)}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const Icon = statusIcons[inv.status] || FileText;
            const companyName = inv.direction === 'incoming' ? inv.fromCompany : inv.toCompany;
            const isOverdue = inv.status === 'overdue';
            return (
              <div
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
                  isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                }`}
              >
                {/* Top row: company + amount */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{companyName}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">{inv.invoiceNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        inv.direction === 'incoming' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {inv.direction === 'incoming' ? (lang === 'tr' ? 'Gelen' : 'Incoming') : (lang === 'tr' ? 'Giden' : 'Outgoing')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-medium">
                        {inv.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>
                      <Icon className="w-3 h-3" />
                      {statusLabels[inv.status]}
                    </span>
                  </div>
                </div>

                {/* Bottom row: dates + actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{lang === 'tr' ? 'Tarih' : 'Date'}: {inv.issueDate}</span>
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {lang === 'tr' ? 'Vade' : 'Due'}: {inv.dueDate}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); exportInvoicePDF(inv, lang).catch((err) => console.error('PDF export failed', err)); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                    title={lang === 'tr' ? 'PDF İndir' : 'Download PDF'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail + status modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {selected.direction === 'incoming' ? selected.fromCompany : selected.toCompany}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selected.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status selector */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{lang === 'tr' ? 'Durum' : 'Status'}</p>
                <div className="flex flex-wrap gap-2">
                  {(['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const).map((s) => {
                    const SIcon = statusIcons[s];
                    const active = selected.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => updateInvoiceStatus(selected.id, s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          active ? `${statusColors[s]} ring-2 ring-offset-1 ring-violet-400` : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <SIcon className="w-3.5 h-3.5" />
                        {statusLabels[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Yön' : 'Direction'}</p>
                  <p className="text-gray-900 mt-1">{selected.direction === 'incoming' ? (lang === 'tr' ? 'Gelen' : 'Incoming') : (lang === 'tr' ? 'Giden' : 'Outgoing')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Tür' : 'Type'}</p>
                  <p className="text-gray-900 mt-1">{selected.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Tarih' : 'Date'}</p>
                  <p className="text-gray-900 mt-1">{selected.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Vade' : 'Due'}</p>
                  <p className="text-gray-900 mt-1">{selected.dueDate || '—'}</p>
                </div>
              </div>

              {/* Items */}
              {selected.items && selected.items.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{lang === 'tr' ? 'Kalemler' : 'Items'}</p>
                  <div className="space-y-1.5">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm gap-3">
                        <span className="text-gray-700 truncate">
                          {item.description}
                          {item.quantity > 1 && <span className="text-gray-400"> ×{item.quantity}</span>}
                        </span>
                        <span className="text-gray-900 shrink-0">{formatCurrency(item.total, selected.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{lang === 'tr' ? 'Ara Toplam' : 'Subtotal'}</span>
                  <span className="text-gray-900">{formatCurrency(selected.subtotal, selected.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">KDV</span>
                  <span className="text-gray-900">{formatCurrency(selected.totalVat, selected.currency)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1">
                  <span className="text-gray-900">{lang === 'tr' ? 'Genel Toplam' : 'Total'}</span>
                  <span className="text-violet-600">{formatCurrency(selected.totalAmount, selected.currency)}</span>
                </div>
              </div>

              {/* PDF */}
              <button
                onClick={() => { exportInvoicePDF(selected, lang).catch((err) => console.error('PDF export failed', err)); }}
                className="w-full inline-flex items-center justify-center gap-2 remo-gradient text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                {lang === 'tr' ? 'PDF İndir' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
