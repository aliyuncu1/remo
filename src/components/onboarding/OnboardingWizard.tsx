'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Building2, Key, Database, Globe, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

const STEPS = [
  { key: 'welcome', icon: Sparkles },
  { key: 'company', icon: Building2 },
  { key: 'api', icon: Key },
  { key: 'demo', icon: Database },
] as const;

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const loadDemoData = useStore((s) => s.loadDemoData);
  const demoLoaded = useStore((s) => s.demoLoaded);
  const lang = settings.language;

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [taxId, setTaxId] = useState(settings.companyTaxId);
  const [taxOffice, setTaxOffice] = useState(settings.companyTaxOffice);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [apiProvider, setApiProvider] = useState(settings.apiProvider);

  const finish = () => {
    updateSettings({
      companyName,
      companyTaxId: taxId,
      companyTaxOffice: taxOffice,
      apiKey,
      apiProvider,
      onboardingComplete: true,
    });
  };

  const next = () => {
    if (step === 1) {
      updateSettings({ companyName, companyTaxId: taxId, companyTaxOffice: taxOffice });
    }
    if (step === 2) {
      updateSettings({ apiKey, apiProvider });
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Progress bar */}
        <div className="flex gap-1 p-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-violet-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="px-8 pb-8 pt-4">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 remo-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lang === 'tr' ? 'Remo\'ya Hoş Geldiniz!' : 'Welcome to Remo!'}
              </h2>
              <p className="text-gray-500 mb-6">
                {lang === 'tr'
                  ? 'İşletmenizi kurmak için birkaç adımı tamamlayalım.'
                  : 'Let\'s complete a few steps to set up your business.'}
              </p>

              {/* Language selector */}
              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={() => updateSettings({ language: 'tr' })}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    lang === 'tr'
                      ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Turkce
                </button>
                <button
                  onClick={() => updateSettings({ language: 'en' })}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    lang === 'en'
                      ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {lang === 'tr' ? 'Firma Bilgileri' : 'Company Info'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'tr' ? 'Faturalarda ve raporlarda kullanilacak' : 'Used in invoices and reports'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'tr' ? 'Firma Adi *' : 'Company Name *'}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={lang === 'tr' ? 'ornegin: Anadolu Tekstil A.S.' : 'e.g. Anadolu Textiles Inc.'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'tr' ? 'Vergi No' : 'Tax ID'}
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="1234567890"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'tr' ? 'Vergi Dairesi' : 'Tax Office'}
                    </label>
                    <input
                      type="text"
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      placeholder={lang === 'tr' ? 'ornegin: Kadikoy' : 'e.g. Kadikoy'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: API Key */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {lang === 'tr' ? 'AI Yapilandirmasi' : 'AI Configuration'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'tr' ? 'Belge analizi icin gerekli' : 'Required for document analysis'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'tr' ? 'AI Saglayici' : 'AI Provider'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'anthropic' as const, label: 'Claude', desc: lang === 'tr' ? 'Onerilen' : 'Recommended' },
                      { id: 'openai' as const, label: 'OpenAI', desc: 'GPT-4o' },
                      { id: 'gemini' as const, label: 'Gemini', desc: 'Google' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setApiProvider(p.id)}
                        className={`p-3 rounded-xl text-left text-sm transition-all ${
                          apiProvider === p.id
                            ? 'bg-violet-50 border-2 border-violet-500 text-violet-700'
                            : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <p className="font-medium">{p.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-70">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={lang === 'tr' ? 'API anahtarinizi girin...' : 'Enter your API key...'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    {lang === 'tr'
                      ? 'Anahtariniz yerel olarak saklanir, sunucuya gonderilmez.'
                      : 'Your key is stored locally and never sent to our servers.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Demo Data */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {lang === 'tr' ? 'Demo Verileri' : 'Demo Data'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'tr' ? 'Platformu kesfetmek icin ornek veri yukleyin' : 'Load sample data to explore the platform'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => loadDemoData()}
                  disabled={demoLoaded}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    demoLoaded
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {demoLoaded ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Database className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {demoLoaded
                          ? (lang === 'tr' ? 'Demo Verileri Yuklendi!' : 'Demo Data Loaded!')
                          : (lang === 'tr' ? 'Demo Verilerini Yukle' : 'Load Demo Data')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lang === 'tr'
                          ? 'Faturalar, siparisler, tedarikciler ve musteriler'
                          : 'Invoices, orders, suppliers, and customers'}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    {lang === 'tr'
                      ? 'Demo verileri gercek Turk isletme senaryolarini icerir. Istediginiz zaman silebilirsiniz.'
                      : 'Demo data includes realistic Turkish business scenarios. You can delete it anytime.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {lang === 'tr' ? 'Geri' : 'Back'}
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-6 py-2.5 remo-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {lang === 'tr' ? 'Devam' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                className="flex items-center gap-1.5 px-6 py-2.5 remo-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Check className="w-4 h-4" />
                {lang === 'tr' ? 'Basla!' : 'Get Started!'}
              </button>
            )}
          </div>

          {/* Skip link */}
          {step < STEPS.length - 1 && (
            <div className="text-center mt-3">
              <button
                onClick={finish}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {lang === 'tr' ? 'Kurulumu atla' : 'Skip setup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
