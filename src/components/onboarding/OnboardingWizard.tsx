'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Building2, Database, Globe, ChevronRight, Check, Sparkles, Camera, FileText, MessageCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const loadDemoData = useStore((s) => s.loadDemoData);
  const clearAllData = useStore((s) => s.clearAllData);
  const demoLoaded = useStore((s) => s.demoLoaded);
  const lang = settings.language;

  const [companyName, setCompanyName] = useState(settings.companyName);

  const finish = (withDemo: boolean) => {
    if (companyName.trim()) {
      updateSettings({ companyName: companyName.trim() });
    }
    if (withDemo) {
      if (!demoLoaded) loadDemoData();
    } else {
      // init() auto-loads demo data, so "start empty" must explicitly clear it.
      clearAllData();
    }
    updateSettings({ onboardingComplete: true });
  };

  const TOTAL_STEPS = 2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Progress bar */}
        <div className="flex gap-1 p-3">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-violet-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="px-8 pb-8 pt-4">
          {/* Step 0: Welcome + Language + Company Name */}
          {step === 0 && (
            <div>
              <div className="text-center mb-8">
                <Logo size="text-4xl" className="mb-5 animate-float" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {lang === 'tr' ? 'Remo\'ya Hoş Geldiniz!' : 'Welcome to Remo!'}
                </h2>
                <p className="text-sm text-gray-500">
                  {lang === 'tr'
                    ? 'AI destekli fatura asistanınız. Hadi başlayalım.'
                    : 'Your AI-powered invoice assistant. Let\'s get started.'}
                </p>
              </div>

              {/* Language selector */}
              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={() => updateSettings({ language: 'tr' })}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    lang === 'en'
                      ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
              </div>

              {/* Company name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {lang === 'tr' ? 'Firma Adınız' : 'Company Name'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={lang === 'tr' ? 'örneğin: Yılmaz Tekstil' : 'e.g. Yilmaz Textiles'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  {lang === 'tr' ? 'Daha sonra ayarlardan değiştirebilirsiniz.' : 'You can change this later in settings.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 1: How it works + Demo data option */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {lang === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}
                </h2>
                <p className="text-sm text-gray-500">
                  {lang === 'tr' ? 'Faturanızı istediğiniz yöntemle gönderin.' : 'Send your invoice however you want.'}
                </p>
              </div>

              {/* Methods preview */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: <Camera className="w-4 h-4" />, label: lang === 'tr' ? 'Fotoğraf çekin' : 'Take a photo', color: 'bg-blue-50 text-blue-600' },
                  { icon: <FileText className="w-4 h-4" />, label: lang === 'tr' ? 'PDF veya resim yükleyin' : 'Upload PDF or image', color: 'bg-violet-50 text-violet-600' },
                  { icon: <MessageCircle className="w-4 h-4" />, label: lang === 'tr' ? 'WhatsApp ile gönderin' : 'Send via WhatsApp', color: 'bg-green-50 text-green-600' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg ${m.color} flex items-center justify-center shrink-0`}>
                      {m.icon}
                    </div>
                    <span className="text-sm text-gray-700">{m.label}</span>
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 ml-auto" />
                    <span className="text-xs text-violet-500">{lang === 'tr' ? 'AI okur' : 'AI reads'}</span>
                  </div>
                ))}
              </div>

              {/* Start options */}
              <div className="space-y-3">
                <button
                  onClick={() => finish(true)}
                  className="w-full p-4 rounded-xl remo-gradient text-white text-left transition-all hover:opacity-90"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        {lang === 'tr' ? 'Demo verileriyle keşfet' : 'Explore with demo data'}
                      </p>
                      <p className="text-xs text-violet-200 mt-0.5">
                        {lang === 'tr' ? 'Örnek faturalar ve müşterilerle platformu görün' : 'See the platform with sample invoices and customers'}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => finish(false)}
                  className="w-full p-4 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {lang === 'tr' ? 'Boş başlat' : 'Start empty'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lang === 'tr' ? 'Kendi faturalarınızla başlayın' : 'Start with your own invoices'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step === 0 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => finish(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {lang === 'tr' ? 'Atla' : 'Skip'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-6 py-2.5 remo-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {lang === 'tr' ? 'Devam' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
