'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import type { Currency, GmailTokens } from '@/lib/types';
import { Save, ShieldCheck, RotateCcw, Mail, CheckCircle2, XCircle, Loader2, MessageCircle, Smartphone, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const lang = useStore((s) => s.settings.language);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const loadDemoData = useStore((s) => s.loadDemoData);
  const clearAllData = useStore((s) => s.clearAllData);
  const gmailConnected = useStore((s) => s.gmailConnected);
  const gmailTokens = useStore((s) => s.gmailTokens);
  const setGmailTokens = useStore((s) => s.setGmailTokens);
  const disconnectGmail = useStore((s) => s.disconnectGmail);
  const gmailLastSync = useStore((s) => s.gmailLastSync);
  const [saved, setSaved] = useState(false);
  const [gmailError, setGmailError] = useState('');
  const [gmailLoading, setGmailLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  // Handle OAuth callback - read tokens from URL fragment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    if (params.get('gmail_error')) {
      setGmailError(params.get('gmail_error') || 'Unknown error');
      // Clean URL
      window.history.replaceState({}, '', '/settings');
    }

    if (params.get('gmail_success') && hash.includes('gmail_tokens=')) {
      try {
        const encoded = hash.split('gmail_tokens=')[1];
        const tokens: GmailTokens = JSON.parse(decodeURIComponent(encoded));
        setGmailTokens(tokens);
        setGmailError('');
      } catch {
        setGmailError('Failed to process Gmail tokens');
      }
      // Clean URL
      window.history.replaceState({}, '', '/settings');
    }
  }, [setGmailTokens]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleConnectGmail = () => {
    setGmailLoading(true);
    window.location.href = '/api/gmail/auth';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('set.title', lang)}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('set.subtitle', lang)}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Info */}
        <Card title={t('set.company', lang)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('set.companyName', lang)}</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
                placeholder={lang === 'tr' ? 'Firma adınız...' : 'Your company name...'}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('set.taxId', lang)}</label>
                <input
                  type="text"
                  value={settings.companyTaxId}
                  onChange={(e) => updateSettings({ companyTaxId: e.target.value })}
                  placeholder={lang === 'tr' ? 'Vergi numarası' : 'Tax ID number'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('set.taxOffice', lang)}</label>
                <input
                  type="text"
                  value={settings.companyTaxOffice}
                  onChange={(e) => updateSettings({ companyTaxOffice: e.target.value })}
                  placeholder={lang === 'tr' ? 'Vergi dairesi' : 'Tax office'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Gmail Integration */}
        <Card title={t('gmail.title', lang)}>
          <div className="space-y-4">
            {gmailConnected && gmailTokens ? (
              <div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">{t('gmail.connected', lang)}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {t('gmail.connectedAs', lang)}: {gmailTokens.email}
                    </p>
                    {gmailLastSync && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {t('gmail.lastSync', lang)}: {new Date(gmailLastSync).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={disconnectGmail}
                    className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    {t('gmail.disconnect', lang)}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 mb-4">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('gmail.notConnected', lang)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('gmail.oauthDesc', lang)}</p>
                  </div>
                </div>
                <button
                  onClick={handleConnectGmail}
                  disabled={gmailLoading}
                  className="inline-flex items-center gap-2 remo-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {gmailLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {t('gmail.connect', lang)}
                </button>
              </div>
            )}

            {gmailError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-700">{gmailError}</p>
              </div>
            )}

            <div className="flex items-start gap-2 pt-2">
              <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">{t('gmail.privacyNote', lang)}</p>
            </div>
          </div>
        </Card>

        {/* WhatsApp Integration */}
        <Card title={lang === 'tr' ? 'WhatsApp Entegrasyonu' : 'WhatsApp Integration'}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  {lang === 'tr' ? 'WhatsApp ile Fatura Gönder' : 'Send Invoices via WhatsApp'}
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  {lang === 'tr'
                    ? 'Fatura PDF veya fotoğrafını WhatsApp üzerinden gönderin, AI otomatik olarak okusun.'
                    : 'Send invoice PDFs or photos via WhatsApp, AI reads them automatically.'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {lang === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}
                  </p>
                  <ol className="text-xs text-gray-600 mt-1.5 space-y-1 list-decimal list-inside">
                    <li>{lang === 'tr' ? 'Remo WhatsApp numarasını rehberinize ekleyin' : 'Add Remo WhatsApp number to your contacts'}</li>
                    <li>{lang === 'tr' ? 'Fatura PDF veya fotoğrafını gönderin' : 'Send an invoice PDF or photo'}</li>
                    <li>{lang === 'tr' ? 'AI fatura bilgilerini otomatik çıkarır' : 'AI automatically extracts invoice data'}</li>
                    <li>{lang === 'tr' ? 'Onayla veya düzelt — bitti!' : 'Confirm or edit — done!'}</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                {lang === 'tr'
                  ? 'Dosyalarınız şifrelenmiş kanallar üzerinden iletilir. Sadece fatura işleme için kullanılır.'
                  : 'Your files are transmitted over encrypted channels. Used only for invoice processing.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Language & Currency */}
        <Card title={`${t('set.language', lang)} & ${t('set.currency', lang)}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('set.language', lang)}</label>
              <div className="flex gap-3">
                {([{ v: 'tr' as const, l: 'Türkçe' }, { v: 'en' as const, l: 'English' }]).map(({ v, l }) => (
                  <button key={v} onClick={() => updateSettings({ language: v })}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      settings.language === v ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('set.currency', lang)}</label>
              <div className="flex gap-3">
                {(['TRY', 'USD', 'EUR'] as Currency[]).map((c) => (
                  <button key={c} onClick={() => updateSettings({ currency: c })}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      settings.currency === c ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>{c === 'TRY' ? '₺ TRY' : c === 'USD' ? '$ USD' : '€ EUR'}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Status */}
        <Card title={t('set.ai', lang)}>
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">
                {lang === 'tr' ? 'AI hazır — kurulum gerekmez' : 'AI is ready — no setup needed'}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                {lang === 'tr'
                  ? 'Fatura okuma ve analiz yapay zekâsı dahili olarak çalışır. Kendi API anahtarınızı eklemenize gerek yok — sadece faturanızı yükleyin.'
                  : 'Invoice reading and analysis run built-in. No need to add your own API key — just upload your invoice.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Demo Data */}
        <Card title={lang === 'tr' ? 'Veri Yönetimi' : 'Data Management'}>
          <p className="text-sm text-gray-600 mb-3">
            {lang === 'tr'
              ? 'Demo verileri ile platformu keşfedin. Gerçekçi Türk şirket verileri yüklenir.'
              : 'Explore the platform with demo data. Realistic Turkish company data will be loaded.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadDemoData}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              <RotateCcw className="w-4 h-4" /> {lang === 'tr' ? 'Demo Verileri Yükle' : 'Load Demo Data'}
            </button>
            {!confirmClear ? (
              <button onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> {lang === 'tr' ? 'Tüm Verileri Sil' : 'Clear All Data'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { clearAllData(); setConfirmClear(false); setCleared(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  <AlertTriangle className="w-4 h-4" /> {lang === 'tr' ? 'Emin misiniz? Sil' : 'Are you sure? Delete'}
                </button>
                <button onClick={() => setConfirmClear(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                  {lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
          {cleared && (
            <p className="text-sm text-green-600 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'tr' ? 'Tüm veriler silindi. Artık kendi verilerinizle başlayabilirsiniz.' : 'All data cleared. You can now start with your own data.'}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            {lang === 'tr'
              ? 'Tüm faturalar, müşteriler, tedarikçiler ve siparişler kalıcı olarak silinir. Ayarlarınız korunur.'
              : 'All invoices, customers, suppliers, and orders are permanently deleted. Your settings are kept.'}
          </p>
        </Card>

        {/* Privacy */}
        <Card title={lang === 'tr' ? 'Gizlilik & Güvenlik' : 'Privacy & Security'}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600 space-y-2">
              <p>{lang === 'tr' ? 'Tüm veriler tarayıcınızda yerel olarak işlenir.' : 'All data is processed locally in your browser.'}</p>
              <p>{lang === 'tr' ? 'AI asla otomatik e-posta göndermez — insan onayı gereklidir.' : 'AI will never send emails automatically — human approval required.'}</p>
              <p>{lang === 'tr' ? 'E-posta bağlantıları OAuth kullanır — şifreniz istenmez.' : 'Email connections use OAuth — your password is never requested.'}</p>
            </div>
          </div>
        </Card>

        <button onClick={handleSave}
          className="inline-flex items-center gap-2 remo-gradient text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> {saved ? t('set.saved', lang) : t('set.save', lang)}
        </button>
      </div>
    </div>
  );
}
