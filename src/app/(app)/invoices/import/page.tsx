'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { v4 as uuid } from 'uuid';
import type { Invoice, InvoiceItem, Currency, InvoiceType } from '@/lib/types';
import {
  Mail,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Check,
  X,
  Inbox,
} from 'lucide-react';

interface ParsedInvoiceData {
  invoiceNumber?: string;
  fromCompany?: string;
  toCompany?: string;
  issueDate?: string;
  dueDate?: string;
  subtotal?: number;
  totalVat?: number;
  totalAmount?: number;
  currency?: string;
  type?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    vatRate?: number;
    vatAmount?: number;
    total?: number;
  }>;
  notes?: string;
}

interface GmailInvoice {
  id: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  fileName: string;
  rawText: string;
  parsedData: ParsedInvoiceData | null;
  selected: boolean;
}

type SyncState = 'idle' | 'scanning' | 'done' | 'error' | 'imported';

export default function GmailImportPage() {
  const lang = useStore((s) => s.settings.language);
  const settings = useStore((s) => s.settings);
  const gmailConnected = useStore((s) => s.gmailConnected);
  const gmailTokens = useStore((s) => s.gmailTokens);
  const setGmailTokens = useStore((s) => s.setGmailTokens);
  const setGmailLastSync = useStore((s) => s.setGmailLastSync);
  const addInvoices = useStore((s) => s.addInvoices);
  const companyName = useStore((s) => s.settings.companyName);

  const [state, setState] = useState<SyncState>('idle');
  const [invoices, setInvoices] = useState<GmailInvoice[]>([]);
  const [error, setError] = useState('');
  const [importCount, setImportCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startScan = async () => {
    if (!gmailTokens) return;

    setState('scanning');
    setError('');
    setInvoices([]);

    try {
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: gmailTokens.accessToken,
          refreshToken: gmailTokens.refreshToken,
          expiresAt: gmailTokens.expiresAt,
          apiKey: settings.apiKey,
          apiProvider: settings.apiProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      // Update tokens if refreshed
      if (data.newTokens) {
        setGmailTokens({
          ...gmailTokens,
          accessToken: data.newTokens.accessToken,
          expiresAt: data.newTokens.expiresAt,
        });
      }

      setGmailLastSync(new Date().toISOString());

      const mapped: GmailInvoice[] = (data.invoices || []).map((inv: GmailInvoice) => ({
        ...inv,
        selected: true,
      }));

      setInvoices(mapped);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      setState('error');
    }
  };

  // Auto-scan on mount if connected
  useEffect(() => {
    if (gmailConnected && gmailTokens && state === 'idle') {
      startScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gmailConnected]);

  const toggleSelect = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, selected: !inv.selected } : inv))
    );
  };

  const toggleAll = () => {
    const allSelected = invoices.every((inv) => inv.selected);
    setInvoices((prev) => prev.map((inv) => ({ ...inv, selected: !allSelected })));
  };

  const handleImport = () => {
    const selected = invoices.filter((inv) => inv.selected && inv.parsedData);
    const now = new Date().toISOString();

    const newInvoices: Invoice[] = selected.map((inv) => {
      const d = inv.parsedData!;
      const items: InvoiceItem[] = (d.items || []).map((item, idx) => ({
        id: uuid(),
        description: item.description || `Item ${idx + 1}`,
        quantity: item.quantity || 1,
        unit: item.unit || 'adet',
        unitPrice: item.unitPrice || 0,
        vatRate: item.vatRate || 20,
        vatAmount: item.vatAmount || 0,
        total: item.total || 0,
      }));

      const validCurrencies: Currency[] = ['TRY', 'USD', 'EUR', 'GBP'];
      const currency: Currency = validCurrencies.includes(d.currency as Currency)
        ? (d.currency as Currency)
        : 'TRY';

      const validTypes: InvoiceType[] = ['e-fatura', 'e-arsiv', 'standard'];
      const type: InvoiceType = validTypes.includes(d.type as InvoiceType)
        ? (d.type as InvoiceType)
        : 'standard';

      return {
        id: uuid(),
        invoiceNumber: d.invoiceNumber || `IMP-${Date.now().toString(36).toUpperCase()}`,
        type,
        status: 'draft' as const,
        direction: 'incoming' as const,
        issueDate: d.issueDate || now.split('T')[0],
        dueDate: d.dueDate || now.split('T')[0],
        fromCompany: d.fromCompany || inv.emailFrom.replace(/<.*>/, '').trim(),
        fromTaxId: '',
        toCompany: d.toCompany || companyName || 'Şirketim',
        toTaxId: '',
        toAddress: '',
        items,
        subtotal: d.subtotal || d.totalAmount || 0,
        totalVat: d.totalVat || 0,
        totalAmount: d.totalAmount || 0,
        currency,
        notes: `${lang === 'tr' ? 'Gmail\'den içe aktarıldı' : 'Imported from Gmail'}: ${inv.emailSubject}`,
        createdAt: now,
      };
    });

    addInvoices(newInvoices);
    setImportCount(newInvoices.length);
    setState('imported');
  };

  const selectedCount = invoices.filter((inv) => inv.selected).length;

  // Not connected state
  if (!gmailConnected) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Link href="/invoices" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('gmail.importTitle', lang)}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('gmail.importSubtitle', lang)}</p>
          </div>
        </div>
        <Card>
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">{t('gmail.connectFirst', lang)}</p>
            <p className="text-sm text-gray-400 mb-6">{t('gmail.oauthDesc', lang)}</p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 remo-gradient text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              {t('gmail.connect', lang)}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('gmail.importTitle', lang)}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('gmail.importSubtitle', lang)}</p>
          </div>
        </div>
        {state === 'done' && invoices.length > 0 && (
          <button
            onClick={handleImport}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 remo-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {t('gmail.importSelected', lang)} ({selectedCount})
          </button>
        )}
      </div>

      {/* Scanning state */}
      {state === 'scanning' && (
        <Card>
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-violet-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">{t('gmail.scanning', lang)}</p>
            <p className="text-sm text-gray-400 mt-2">
              {lang === 'tr'
                ? 'Fatura, fiş ve e-fatura ekleri aranıyor...'
                : 'Searching for invoice, receipt, and e-fatura attachments...'}
            </p>
          </div>
        </Card>
      )}

      {/* Error state */}
      {state === 'error' && (
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">
              {lang === 'tr' ? 'Senkronizasyon Hatası' : 'Sync Error'}
            </p>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={startScan}
              className="inline-flex items-center gap-2 remo-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {lang === 'tr' ? 'Tekrar Dene' : 'Try Again'}
            </button>
          </div>
        </Card>
      )}

      {/* No invoices found */}
      {state === 'done' && invoices.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">{t('gmail.noInvoices', lang)}</p>
            <p className="text-sm text-gray-400 mb-6">{t('gmail.noInvoicesDesc', lang)}</p>
            <button
              onClick={startScan}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              {t('gmail.sync', lang)}
            </button>
          </div>
        </Card>
      )}

      {/* Imported success */}
      {state === 'imported' && (
        <Card>
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold text-lg mb-2">{t('gmail.imported', lang)}</p>
            <p className="text-sm text-gray-500 mb-6">
              {importCount} {lang === 'tr' ? 'fatura içe aktarıldı' : 'invoices imported'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/invoices"
                className="inline-flex items-center gap-2 remo-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t('inv.title', lang)}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {t('nav.dashboard', lang)}
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Invoice list */}
      {state === 'done' && invoices.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl px-5 py-3">
            <p className="text-sm font-medium text-violet-900">
              {invoices.length} {t('gmail.found', lang)}
            </p>
            <button onClick={toggleAll} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              {invoices.every((i) => i.selected) ? t('gmail.deselectAll', lang) : t('gmail.selectAll', lang)}
            </button>
          </div>

          {/* Invoice cards */}
          {invoices.map((inv) => (
            <Card key={inv.id} className={`transition-all ${inv.selected ? 'border-violet-200 shadow-sm' : 'opacity-60'}`}>
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(inv.id)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    inv.selected
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-gray-300 hover:border-violet-400'
                  }`}
                >
                  {inv.selected && <Check className="w-4 h-4" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{inv.emailSubject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('gmail.fromEmail', lang)}: {inv.emailFrom}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          {inv.fileName}
                        </span>
                        <span className="text-xs text-gray-400">{inv.emailDate}</span>
                      </div>
                    </div>

                    {inv.parsedData?.totalAmount ? (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(
                            inv.parsedData.totalAmount,
                            (['TRY', 'USD', 'EUR', 'GBP'].includes(inv.parsedData.currency || '')
                              ? inv.parsedData.currency
                              : 'TRY') as Currency
                          )}
                        </p>
                        {inv.parsedData.fromCompany && (
                          <p className="text-xs text-gray-500 mt-0.5">{inv.parsedData.fromCompany}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        {lang === 'tr' ? 'Veri eksik' : 'Incomplete data'}
                      </span>
                    )}
                  </div>

                  {/* Parsed data preview */}
                  {inv.parsedData && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                        className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                      >
                        {expandedId === inv.id
                          ? (lang === 'tr' ? 'Detayları gizle' : 'Hide details')
                          : t('gmail.preview', lang)}
                      </button>

                      {expandedId === inv.id && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-500">{t('inv.invoiceNo', lang)}:</span>{' '}
                              <span className="font-medium">{inv.parsedData.invoiceNumber || '—'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('inv.type', lang)}:</span>{' '}
                              <span className="font-medium">{inv.parsedData.type || 'standard'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('inv.date', lang)}:</span>{' '}
                              <span className="font-medium">{inv.parsedData.issueDate || '—'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('inv.dueDate', lang)}:</span>{' '}
                              <span className="font-medium">{inv.parsedData.dueDate || '—'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('inv.company', lang)} ({lang === 'tr' ? 'Gönderen' : 'From'}):</span>{' '}
                              <span className="font-medium">{inv.parsedData.fromCompany || '—'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('inv.vat', lang)}:</span>{' '}
                              <span className="font-medium">
                                {inv.parsedData.totalVat
                                  ? formatCurrency(inv.parsedData.totalVat, (inv.parsedData.currency as Currency) || 'TRY')
                                  : '—'}
                              </span>
                            </div>
                          </div>
                          {inv.parsedData.items && inv.parsedData.items.length > 0 && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-gray-500 mb-1">{t('inv.items', lang)} ({inv.parsedData.items.length}):</p>
                              {inv.parsedData.items.slice(0, 3).map((item, idx) => (
                                <p key={idx} className="text-gray-700">
                                  {item.description || `Item ${idx + 1}`} — {item.quantity || 1} x{' '}
                                  {formatCurrency(item.unitPrice || 0, (inv.parsedData!.currency as Currency) || 'TRY')}
                                </p>
                              ))}
                              {(inv.parsedData.items?.length || 0) > 3 && (
                                <p className="text-gray-400">+{inv.parsedData.items!.length - 3} {lang === 'tr' ? 'daha' : 'more'}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
