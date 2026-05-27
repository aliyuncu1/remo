'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import type { Invoice, InvoiceItem, InvoiceType, Currency } from '@/lib/types';
import { ArrowLeft, Plus, Trash2, Save, Send, FileDown } from 'lucide-react';

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

export default function NewInvoicePage() {
  const lang = useStore((s) => s.settings.language);
  const settings = useStore((s) => s.settings);
  const addInvoice = useStore((s) => s.addInvoice);
  const router = useRouter();

  const [direction, setDirection] = useState<'outgoing' | 'incoming'>('outgoing');
  const [type, setType] = useState<InvoiceType>('e-fatura');
  const [toCompany, setToCompany] = useState('');
  const [toTaxId, setToTaxId] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.currency || 'TRY');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { id: uuid(), description: '', quantity: 1, unit: 'adet', unitPrice: 0, vatRate: 20 },
  ]);

  const addItem = () => {
    setItems([...items, { id: uuid(), description: '', quantity: 1, unit: 'adet', unitPrice: 0, vatRate: 20 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const calcItemTotal = (item: FormItem) => item.quantity * item.unitPrice;
  const calcItemVat = (item: FormItem) => calcItemTotal(item) * (item.vatRate / 100);

  const subtotal = items.reduce((s, i) => s + calcItemTotal(i), 0);
  const totalVat = items.reduce((s, i) => s + calcItemVat(i), 0);
  const totalAmount = subtotal + totalVat;

  const handleSave = (status: 'draft' | 'sent') => {
    const invoiceItems: InvoiceItem[] = items.map((i) => ({
      id: i.id,
      description: i.description || (lang === 'tr' ? 'Ürün/Hizmet' : 'Product/Service'),
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      vatRate: i.vatRate,
      vatAmount: calcItemVat(i),
      total: calcItemTotal(i),
    }));

    const invoice: Invoice = {
      id: uuid(),
      invoiceNumber: `FTR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      type,
      status,
      direction,
      issueDate,
      dueDate: dueDate || issueDate,
      fromCompany: direction === 'outgoing' ? (settings.companyName || 'Şirketim') : toCompany,
      fromTaxId: direction === 'outgoing' ? (settings.companyTaxId || '') : toTaxId,
      toCompany: direction === 'outgoing' ? toCompany : (settings.companyName || 'Şirketim'),
      toTaxId: direction === 'outgoing' ? toTaxId : (settings.companyTaxId || ''),
      toAddress,
      items: invoiceItems,
      subtotal,
      totalVat,
      totalAmount,
      currency,
      notes,
      createdAt: new Date().toISOString(),
    };

    addInvoice(invoice);
    router.push('/invoices');
  };

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/invoices" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{t('inv.new', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('inv.subtitle', lang)}</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Direction & Type */}
        <Card>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>{lang === 'tr' ? 'Yön' : 'Direction'}</label>
              <div className="flex gap-2">
                {(['outgoing', 'incoming'] as const).map((d) => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      direction === d ? 'remo-gradient text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {d === 'outgoing' ? t('inv.outgoing', lang) : t('inv.incoming', lang)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('inv.type', lang)}</label>
              <div className="flex gap-2">
                {(['e-fatura', 'e-arsiv', 'standard'] as InvoiceType[]).map((tp) => (
                  <button key={tp} onClick={() => setType(tp)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      type === tp ? 'border-violet-500 bg-violet-50 text-violet-700 border' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {tp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Company Info */}
        <Card title={direction === 'outgoing' ? (lang === 'tr' ? 'Alıcı Bilgileri' : 'Buyer Info') : (lang === 'tr' ? 'Gönderen Bilgileri' : 'Sender Info')}>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('inv.company', lang)}</label>
                <input type="text" value={toCompany} onChange={(e) => setToCompany(e.target.value)}
                  placeholder={lang === 'tr' ? 'Firma adı...' : 'Company name...'}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('inv.taxId', lang)}</label>
                <input type="text" value={toTaxId} onChange={(e) => setToTaxId(e.target.value)}
                  placeholder={lang === 'tr' ? 'Vergi numarası' : 'Tax ID'}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{lang === 'tr' ? 'Adres' : 'Address'}</label>
              <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)}
                placeholder={lang === 'tr' ? 'Firma adresi...' : 'Company address...'}
                className={inputClass} />
            </div>
          </div>
        </Card>

        {/* Dates & Currency */}
        <Card>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('inv.date', lang)}</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('inv.dueDate', lang)}</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('set.currency', lang)}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={inputClass}>
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Line Items */}
        <Card title={t('inv.items', lang)}>
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-4">{t('inv.description', lang)}</div>
              <div className="col-span-1">{t('inv.quantity', lang)}</div>
              <div className="col-span-1">{t('inv.unit', lang)}</div>
              <div className="col-span-2">{t('inv.unitPrice', lang)}</div>
              <div className="col-span-1">{t('inv.vatRate', lang)}</div>
              <div className="col-span-2 text-right">{t('inv.lineTotal', lang)}</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 md:col-span-4">
                  <input type="text" value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder={lang === 'tr' ? 'Ürün/hizmet açıklaması...' : 'Product/service description...'}
                    className={inputClass} />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <input type="number" min="1" value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className={inputClass} />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <select value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className={inputClass}>
                    <option value="adet">adet</option>
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="lt">lt</option>
                    <option value="m">m</option>
                    <option value="m2">m²</option>
                    <option value="set">set</option>
                    <option value="gün">gün</option>
                    <option value="saat">saat</option>
                    <option value="hizmet">hizmet</option>
                  </select>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input type="number" min="0" step="0.01" value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    placeholder="0.00" className={inputClass} />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <select value={item.vatRate} onChange={(e) => updateItem(item.id, 'vatRate', Number(e.target.value))} className={inputClass}>
                    <option value={0}>%0</option>
                    <option value={1}>%1</option>
                    <option value={10}>%10</option>
                    <option value={20}>%20</option>
                  </select>
                </div>
                <div className="col-span-4 md:col-span-2 text-right">
                  <p className="text-sm font-semibold text-gray-900 py-2">
                    {formatCurrency(calcItemTotal(item) + calcItemVat(item), currency)}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" disabled={items.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addItem}
              className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium mt-2">
              <Plus className="w-4 h-4" /> {t('inv.addItem', lang)}
            </button>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{t('inv.subtotal', lang)}:</span>
                <span className="font-medium w-32 text-right">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{t('inv.vat', lang)}:</span>
                <span className="font-medium w-32 text-right">{formatCurrency(totalVat, currency)}</span>
              </div>
              <div className="flex items-center gap-4 text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-900">{t('inv.total', lang)}:</span>
                <span className="text-gray-900 w-32 text-right">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card title={t('inv.notes', lang)}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder={lang === 'tr' ? 'Ek notlar...' : 'Additional notes...'}
            rows={3} className={`${inputClass} resize-none`} />
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <button onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Save className="w-4 h-4" /> {t('inv.save', lang)} ({lang === 'tr' ? 'Taslak' : 'Draft'})
          </button>
          <button onClick={() => handleSave('sent')}
            className="inline-flex items-center gap-2 remo-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Send className="w-4 h-4" /> {t('inv.send', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
