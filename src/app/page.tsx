import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import WaitlistForm from '@/components/WaitlistForm';
import {
  Camera,
  MessageCircle,
  Mail,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  Users,
  Receipt,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="remo-glass fixed top-0 w-full z-50 border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Logo size="text-2xl" />
          </div>
          <div className="flex items-center gap-3">
            <a href="#fiyat" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Fiyatlandırma
            </a>
            <a href="#nasil" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Nasıl Çalışır
            </a>
            <Link
              href="/dashboard"
              className="text-sm remo-gradient text-white px-5 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 remo-hero-bg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI Destekli Fatura Yönetimi
          </div>
          <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            Faturalarla uğraşmayı{' '}
            <span className="remo-gradient-text">bırakın</span>
            <br />
            AI halletsin
          </h1>
          <p className="animate-fade-in-up-delay-2 mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Fotoğraf çekin, PDF yükleyin veya e-postadan aktarın.
            Remo faturalarınızı saniyeler içinde okur, kaydeder ve muhasebecinize hazırlar.
          </p>
          <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 remo-gradient text-white px-8 py-4 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-violet-200 text-lg"
            >
              Ücretsiz Deneyin
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="text-sm text-gray-400">Kredi kartı gerekmez — hemen başlayın</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil" className="py-20 px-6 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">Nasıl Çalışır</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            3 adımda fatura yönetimi
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Kurulum yok, eğitim yok. Hemen başlayabilirsiniz.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <Camera className="w-6 h-6" />,
                title: 'Gönderin',
                desc: 'Faturanızı çekin, PDF yükleyin, e-postadan aktarın veya WhatsApp ile gönderin. Nasıl isterseniz.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                step: '2',
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Okusun',
                desc: 'Yapay zekâ fatura numarasını, tutarı, KDV\'yi, tarihlerini ve tüm kalemleri otomatik çıkarır.',
                color: 'bg-violet-50 text-violet-600',
              },
              {
                step: '3',
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: 'Onaylayın',
                desc: 'Sonucu kontrol edin, onaylayın. Fatura sisteme kaydedilir, ay sonunda muhasebecinize aktarın.',
                color: 'bg-emerald-50 text-emerald-600',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 remo-gradient rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Input methods */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">Her Yöntem</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            Faturanız nereden gelirse gelsin
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Kâğıt, e-posta, WhatsApp, PDF — farketmez. Remo hepsini okur.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Camera className="w-5 h-5" />, title: 'Kamera ile Çekin', desc: 'Kâğıt faturayı telefonunuzla fotoğraflayın', color: 'bg-blue-50 text-blue-600' },
              { icon: <FileText className="w-5 h-5" />, title: 'PDF / Görsel Yükleyin', desc: 'Sürükleyip bırakın veya dosya seçin', color: 'bg-violet-50 text-violet-600' },
              { icon: <Mail className="w-5 h-5" />, title: 'Gmail Senkronizasyonu', desc: 'E-posta eklerini otomatik tarayın', color: 'bg-red-50 text-red-500' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp ile Gönderin', desc: 'Fatura fotoğrafını WhatsApp ile gönderin', color: 'bg-green-50 text-green-600' },
              { icon: <Receipt className="w-5 h-5" />, title: 'E-posta Yönlendirme', desc: 'Faturaları özel adresinize yönlendirin', color: 'bg-amber-50 text-amber-600' },
              { icon: <Zap className="w-5 h-5" />, title: 'Manuel Giriş', desc: 'Fatura bilgilerini kendiniz girin', color: 'bg-orange-50 text-orange-600' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl border border-gray-200/80 remo-card-hover">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">Özellikler</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-14">
            Sadece fatura okumak değil
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Canlı Dashboard', desc: 'Gelir, gider, nakit akışı ve vadesi gelen faturaları tek ekranda görün.' },
              { icon: <TrendingUp className="w-5 h-5" />, title: 'Raporlar', desc: 'Aylık gelir-gider grafikleri, en çok harcanan tedarikçiler, en çok gelir getiren müşteriler.' },
              { icon: <Users className="w-5 h-5" />, title: 'Müşteri & Tedarikçi Takibi', desc: 'Tüm iş ortaklarınızı, geçmiş işlemlerini ve bakiyelerini takip edin.' },
              { icon: <FileText className="w-5 h-5" />, title: 'PDF Fatura Oluşturma', desc: 'Profesyonel fatura PDF\'leri oluşturun ve indirin. e-Fatura uyumlu.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Muhasebeci Aktarımı', desc: 'Ay sonunda tek tıkla Excel dosyası oluşturun, muhasebecinize gönderin.' },
              { icon: <Clock className="w-5 h-5" />, title: 'Vade Takibi', desc: 'Vadesi yaklaşan ve geçen faturaları otomatik takip edin, bildirim alın.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200/80 remo-card-hover">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyat" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">Fiyatlandırma</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            Her bütçeye uygun plan
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Ücretsiz başlayın. Büyüdükçe yükseltin.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <h3 className="font-bold text-gray-900 text-lg">Başlangıç</h3>
              <p className="text-sm text-gray-500 mt-1">Denemek için</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-gray-900">Ücretsiz</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Ayda 10 fatura', 'Kamera ile çekme', 'PDF yükleme', 'Temel dashboard'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block text-center w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Hemen Başla
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-violet-500 p-8 relative shadow-lg shadow-violet-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 remo-gradient text-white text-xs font-bold rounded-full">
                Popüler
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Profesyonel</h3>
              <p className="text-sm text-gray-500 mt-1">Büyüyen işletmeler için</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-gray-900">₺499</span>
                <span className="text-gray-500 text-sm">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Sınırsız fatura', 'Gmail senkronizasyonu', 'WhatsApp entegrasyonu', 'Excel muhasebeci aktarımı', 'PDF fatura oluşturma', 'Detaylı raporlar'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block text-center w-full py-3 rounded-xl remo-gradient text-white font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Ücretsiz Dene — 14 Gün
              </Link>
            </div>

            {/* Business */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <h3 className="font-bold text-gray-900 text-lg">İşletme</h3>
              <p className="text-sm text-gray-500 mt-1">Büyük ekipler için</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-gray-900">₺999</span>
                <span className="text-gray-500 text-sm">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Profesyonel\'deki her şey', 'Çoklu kullanıcı', 'Öncelikli destek', 'API erişimi', 'Özel entegrasyonlar'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block text-center w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                İletişime Geçin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 remo-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Erken erişim listesine katılın
          </h2>
          <p className="text-violet-200 mb-10 text-lg">
            Remo&apos;yu ilk kullananlardan olun. İlk 10 faturanız ücretsiz, kredi kartı gerekmez.
          </p>
          <WaitlistForm />
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
            >
              Önce demoyu denemek ister misiniz?
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Logo size="text-base" />
            <span>— KOBİ&apos;ler için AI Fatura Asistanı</span>
          </div>
          <div className="flex gap-6">
            <a href="#nasil" className="hover:text-gray-600">Nasıl Çalışır</a>
            <a href="#fiyat" className="hover:text-gray-600">Fiyatlandırma</a>
            <Link href="/dashboard" className="hover:text-gray-600">Giriş Yap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
