'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { analyzeDocument } from '@/lib/analyzer';
import { sampleCases } from '@/lib/sample-data';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, truncate, severityColor, copyToClipboard, exportToJSON } from '@/lib/utils';
import type { Language, AnalysisType, AnalysisResult } from '@/lib/types';
import {
  Bot, Upload, FileText, Loader2, AlertCircle, X, ChevronDown, Play, FlaskConical,
  Copy, Check, Download, AlertTriangle, ListChecks, MessageSquare, Info, HelpCircle, ArrowLeft,
} from 'lucide-react';

const analysisTypes: { value: AnalysisType; label: string; labelTr: string }[] = [
  { value: 'auto', label: 'Auto Detect', labelTr: 'Otomatik Algıla' },
  { value: 'supplier_offer', label: 'Supplier Offer', labelTr: 'Tedarikçi Teklifi' },
  { value: 'invoice', label: 'Invoice', labelTr: 'Fatura' },
  { value: 'logistics', label: 'Logistics', labelTr: 'Lojistik' },
  { value: 'procurement', label: 'Procurement', labelTr: 'Satınalma' },
  { value: 'finance', label: 'Finance', labelTr: 'Finans' },
  { value: 'customer_message', label: 'Customer Message', labelTr: 'Müşteri Mesajı' },
  { value: 'general', label: 'General', labelTr: 'Genel İş İletişimi' },
];

export default function AIPage() {
  const router = useRouter();
  const lang = useStore((s) => s.settings.language);
  const settings = useStore((s) => s.settings);
  const analyses = useStore((s) => s.analyses);
  const addAnalysis = useStore((s) => s.addAnalysis);
  const deleteAnalysis = useStore((s) => s.deleteAnalysis);

  const [tab, setTab] = useState<'analyze' | 'results' | 'tests'>('analyze');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('auto');
  const [outputLanguage, setOutputLanguage] = useState<Language>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [copiedField, setCopiedField] = useState('');

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError('');
    const formData = new FormData();
    formData.append('file', f);
    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  }, []);

  const handleAnalyze = async (content?: string) => {
    const textToAnalyze = content || text;
    if (!textToAnalyze.trim()) { setError(lang === 'tr' ? 'Lütfen analiz edilecek metin girin.' : 'Please provide text to analyze.'); return; }
    if (!settings.apiKey) { setError(lang === 'tr' ? 'Lütfen Ayarlar\'da API anahtarınızı ekleyin.' : 'Please add your API key in Settings.'); return; }

    setLoading(true);
    setError('');
    try {
      const result = await analyzeDocument(textToAnalyze, {
        analysisType, outputLanguage,
        apiProvider: settings.apiProvider, apiKey: settings.apiKey,
        sourceType: file ? 'upload' : 'paste', fileName: file?.name,
      });
      addAnalysis(result);
      setSelectedResult(result);
      setTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopiedField(field); setTimeout(() => setCopiedField(''), 2000); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ai.title', lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('ai.subtitle', lang)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'analyze' as const, icon: Bot, label: lang === 'tr' ? 'Analiz' : 'Analyze' },
          { key: 'results' as const, icon: FileText, label: lang === 'tr' ? 'Sonuçlar' : 'Results' },
          { key: 'tests' as const, icon: FlaskConical, label: lang === 'tr' ? 'Test Senaryoları' : 'Test Cases' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'remo-gradient text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ANALYZE TAB */}
      {tab === 'analyze' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-violet-400 bg-violet-50' : 'border-gray-200'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  {lang === 'tr' ? 'Dosya sürükleyin veya ' : 'Drag a file or '}
                  <label className="text-violet-600 cursor-pointer font-medium">
                    {lang === 'tr' ? 'seçin' : 'browse'}
                    <input type="file" className="hidden" accept=".pdf,.csv,.xlsx,.xls,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </label>
                </p>
                <p className="text-xs text-gray-400">PDF, Excel, CSV, TXT</p>
                {file && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg text-sm">
                    <FileText className="w-4 h-4" /> {file.name}
                    <button onClick={() => { setFile(null); setText(''); }}><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            </Card>
            <Card title={lang === 'tr' ? 'Metin Yapıştır' : 'Paste Text'}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={lang === 'tr' ? 'E-posta, fatura, teklif, WhatsApp mesajı...' : 'Email, invoice, offer, WhatsApp message...'}
                className="w-full h-48 border border-gray-200 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </Card>
          </div>
          <div className="space-y-6">
            <Card title={lang === 'tr' ? 'Analiz Seçenekleri' : 'Analysis Options'}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{lang === 'tr' ? 'Analiz Tipi' : 'Analysis Type'}</label>
                  <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    {analysisTypes.map((at) => <option key={at.value} value={at.value}>{lang === 'tr' ? at.labelTr : at.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{lang === 'tr' ? 'Çıktı Dili' : 'Output Language'}</label>
                  <select value={outputLanguage} onChange={(e) => setOutputLanguage(e.target.value as Language)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="auto">{lang === 'tr' ? 'Otomatik' : 'Auto Detect'}</option>
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </Card>
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <p>{error}</p>
              </div>
            )}
            <button onClick={() => handleAnalyze()} disabled={loading || !text.trim()}
              className="w-full remo-gradient text-white py-3 rounded-lg font-medium  disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{t('ai.analyzing', lang)}</> : <><Bot className="w-4 h-4" />{t('ai.analyze', lang)}</>}
            </button>
            {!settings.apiKey && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800">
                  {lang === 'tr' ? 'API anahtarı gerekli. ' : 'API key required. '}
                  <a href="/settings" className="font-medium underline">{lang === 'tr' ? 'Ayarlar\'dan ekleyin' : 'Add in Settings'}</a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {tab === 'results' && (
        <div>
          {selectedResult ? (
            <div>
              <button onClick={() => setSelectedResult(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="w-4 h-4" /> {lang === 'tr' ? 'Tüm sonuçlar' : 'All results'}
              </button>
              <ResultDetail result={selectedResult} lang={lang} copiedField={copiedField} onCopy={handleCopy} />
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">{lang === 'tr' ? 'Henüz analiz yok' : 'No analyses yet'}</p>
                </div>
              ) : analyses.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm cursor-pointer" onClick={() => setSelectedResult(a)}>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-gray-500">{a.documentType}</span>
                    <span className="text-xs text-gray-400">{a.detectedLanguage}</span>
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(a.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-900">{truncate(a.executiveSummary, 120)}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{a.risks.length} {lang === 'tr' ? 'risk' : 'risks'}</span>
                    <span>{a.actionItems.length} {lang === 'tr' ? 'aksiyon' : 'actions'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TESTS TAB */}
      {tab === 'tests' && (
        <div className="space-y-4">
          {sampleCases.map((sample) => (
            <Card key={sample.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{sample.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{sample.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setText(sample.content); handleAnalyze(sample.content); }}
                  disabled={loading || !settings.apiKey}
                  className="inline-flex items-center gap-2 remo-gradient text-white px-4 py-2 rounded-lg text-sm font-medium  disabled:opacity-50 ml-4 shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {t('ai.runTest', lang)}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultDetail({ result, lang, copiedField, onCopy }: {
  result: AnalysisResult; lang: 'tr' | 'en'; copiedField: string;
  onCopy: (text: string, field: string) => void;
}) {
  const ki = result.keyInformation;
  const infoRows = [
    ['Company', ki.companyName], ['Role', ki.supplierOrCustomer], ['Contact', ki.contactPerson],
    ['Product', ki.productOrService], ['Quantity', ki.quantity], ['Unit Price', ki.unitPrice],
    ['Total', ki.totalPrice], ['Currency', ki.currency], ['VAT', ki.vatOrTax],
    ['Delivery', ki.deliveryDate], ['Payment Terms', ki.paymentTerms],
    ['Invoice No', ki.invoiceNumber], ['Due Date', ki.dueDate], ['Incoterms', ki.incoterms],
  ].filter(([, val]) => val);

  return (
    <div className="space-y-6">
      <Card title={lang === 'tr' ? 'Özet' : 'Executive Summary'}
        action={<button onClick={() => onCopy(result.executiveSummary, 'summary')} className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-1">
          {copiedField === 'summary' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>}>
        <p className="text-sm text-gray-700 leading-relaxed">{result.executiveSummary}</p>
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span>{lang === 'tr' ? 'Güven' : 'Confidence'}: {Math.round(result.confidenceScore * 100)}%</span>
          <span>{result.documentType}</span>
          <span>{result.detectedLanguage}</span>
        </div>
      </Card>

      {infoRows.length > 0 && (
        <Card title={lang === 'tr' ? 'Temel Bilgiler' : 'Key Information'}>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            {infoRows.map(([label, value]) => (
              <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50">
                <span className="text-xs font-medium text-gray-500 w-24 shrink-0">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.risks.length > 0 && (
        <Card title={`${lang === 'tr' ? 'Riskler' : 'Risks'} (${result.risks.length})`} action={<AlertTriangle className="w-4 h-4 text-red-500" />}>
          <div className="space-y-3">
            {result.risks.map((risk, i) => (
              <div key={i} className={`p-4 rounded-lg border ${severityColor(risk.severity)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase">{risk.severity}</span>
                  <span className="text-sm font-medium">{risk.riskTitle}</span>
                </div>
                <p className="text-sm">{risk.explanation}</p>
                <p className="text-xs font-medium mt-1">{risk.recommendedAction}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.actionItems.length > 0 && (
        <Card title={`${lang === 'tr' ? 'Aksiyon Önerileri' : 'Action Items'} (${result.actionItems.length})`}>
          <div className="space-y-3">
            {result.actionItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                <ListChecks className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-900">{item.task}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>{item.ownerSuggestion}</span>
                    <span className={`font-medium ${item.urgency === 'high' || item.urgency === 'critical' ? 'text-red-600' : 'text-gray-600'}`}>{item.urgency}</span>
                    {item.suggestedDeadline && <span>{item.suggestedDeadline}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.professionalReplyDraft && (
        <Card title={lang === 'tr' ? 'Yanıt Taslağı' : 'Reply Draft'}
          action={<button onClick={() => onCopy(result.professionalReplyDraft, 'reply')} className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-1">
            {copiedField === 'reply' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />} {lang === 'tr' ? 'Kopyala' : 'Copy'}
          </button>}>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100">
            {result.professionalReplyDraft}
          </pre>
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {lang === 'tr' ? 'Göndermeden önce inceleme yapın. AI içeriği insan onayı gerektirir.' : 'Review before sending. AI content requires human approval.'}
          </p>
        </Card>
      )}

      <Card title={lang === 'tr' ? 'Dışa Aktar' : 'Export'}>
        <div className="flex gap-3">
          <button onClick={() => onCopy(result.executiveSummary, 'exp-sum')} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Copy className="w-4 h-4" /> {lang === 'tr' ? 'Özeti Kopyala' : 'Copy Summary'}
          </button>
          <button onClick={() => exportToJSON(result, `analysis-${result.id}.json`)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> JSON
          </button>
        </div>
      </Card>
    </div>
  );
}
