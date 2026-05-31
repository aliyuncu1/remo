'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { Receipt, Search, Filter, FileText, AlertTriangle, CheckCircle2, Clock, XCircle, Mail, Download, Plus, Camera } from 'lucide-react';
import { exportInvoicePDF } from '@/lib/pdf-export';

export default function InvoicesPage() {
  const lang = useStore((s) => s.settings.language);
  const invoices = useStore((s) => s.invoices);
  const [search, setSearch] = useState('');
  const [filterDir, setFilterDir] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
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
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${
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
                    onClick={() => { exportInvoicePDF(inv, lang).catch((e) => console.error('PDF export failed', e)); }}
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
    </div>
  );
}
