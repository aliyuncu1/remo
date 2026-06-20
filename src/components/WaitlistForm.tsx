'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      });
      if (!res.ok) throw new Error('failed');
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center gap-3 justify-center">
        <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
        <p className="text-white font-medium">
          Teşekkürler! Sizi listemize ekledik, çok yakında haber vereceğiz. 🎉
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className="flex-1 px-5 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="group inline-flex items-center justify-center gap-2 bg-white text-violet-700 px-6 py-4 rounded-xl font-semibold hover:bg-violet-50 transition-colors shadow-lg disabled:opacity-70 whitespace-nowrap"
        >
          {state === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Erken Erişim
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Firma adınız (opsiyonel)"
        className="w-full mt-3 px-5 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm"
      />
      {state === 'error' && (
        <p className="text-white/90 text-sm mt-3">Bir sorun oluştu. Lütfen tekrar deneyin.</p>
      )}
    </form>
  );
}
