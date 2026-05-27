import Link from 'next/link';
import {
  FileText,
  Mail,
  ShieldCheck,
  Globe,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Document Analysis',
    desc: 'Upload PDFs, Excel, CSV files or paste raw text. AI extracts key business data automatically.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Email Automation',
    desc: 'Connect Gmail or Outlook. Forward emails to analyze supplier offers, invoices, and logistics updates.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Bilingual Support',
    desc: 'Understands Turkish, English, and mixed language messages including informal WhatsApp-style texts.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Risk Detection',
    desc: 'Identifies missing payment terms, unclear pricing, deadline risks, and suspicious changes.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Action Items',
    desc: 'Generates prioritized tasks with suggested owners, deadlines, and urgency levels.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Operations Dashboard',
    desc: 'Track processed documents, active risks, pending actions, and supplier activity in real-time.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

const useCases = [
  'Supplier offer comparison and risk assessment',
  'Invoice verification and payment tracking',
  'Logistics and shipment delay monitoring',
  'Procurement document processing',
  'Export/import communication management',
  'Customer request prioritization',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="remo-glass fixed top-0 w-full z-50 border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 remo-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Remo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/ai"
              className="text-sm remo-gradient text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 remo-hero-bg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Business Intelligence
          </div>
          <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            Turn messy emails & invoices into{' '}
            <span className="remo-gradient-text">clear actions</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Remo is your AI business assistant that understands Turkish and English
            communication. Reduce manual work, catch risks early, and respond faster.
          </p>
          <div className="animate-fade-in-up-delay-3 mt-10 flex items-center justify-center gap-4">
            <Link
              href="/ai"
              className="group inline-flex items-center gap-2 remo-gradient text-white px-7 py-3.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-violet-200"
            >
              Start Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-7 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Explore Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">The Problem</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            What SMEs deal with every day
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-5 h-5" />, title: 'Lost Time', desc: 'Hours spent reading emails, extracting data from PDFs, and manually entering information into spreadsheets.', accent: 'bg-red-50 text-red-500 border-red-100' },
              { icon: <AlertTriangle className="w-5 h-5" />, title: 'Missed Risks', desc: 'Unclear pricing, missing payment terms, and deadline conflicts buried in long email threads.', accent: 'bg-amber-50 text-amber-500 border-amber-100' },
              { icon: <Mail className="w-5 h-5" />, title: 'Delayed Responses', desc: 'Critical supplier offers and customer requests waiting days for a response due to information overload.', accent: 'bg-orange-50 text-orange-500 border-orange-100' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-200/80 remo-card-hover">
                <div className={`w-10 h-10 rounded-xl ${item.accent} border flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">Features</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            Everything you need to work smarter
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-2xl mx-auto">
            From document intake to professional reply drafts — automate your entire business communication workflow.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-200/80 remo-card-hover group">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest text-center mb-3">Use Cases</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Built for real business workflows
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <div key={uc} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200/80 remo-card-hover">
                <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0" />
                <span className="text-sm text-gray-700">{uc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Security & Privacy First</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
            OAuth-only authentication. No raw passwords stored. AI generates suggestions — human
            approval required before any action. Your data stays under your control.
          </p>
          <div className="inline-block bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
            <p className="text-xs text-amber-700">
              Demo version: Do not upload highly sensitive documents. Human review is recommended
              before financial, legal, or contractual decisions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 remo-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to streamline your operations?
          </h2>
          <p className="text-violet-200 mb-10 text-lg">
            Start analyzing your business documents in seconds. No setup required.
          </p>
          <Link
            href="/ai"
            className="group inline-flex items-center gap-2 bg-white text-violet-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-violet-50 transition-colors shadow-lg"
          >
            Start Analysis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 remo-gradient rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">R</span>
            </div>
            <span>Remo — AI Business Assistant</span>
          </div>
          <span>TR / EN</span>
        </div>
      </footer>
    </div>
  );
}
