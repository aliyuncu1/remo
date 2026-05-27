'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import {
  Camera,
  Upload,
  Mail,
  MessageCircle,
  FileText,
  PenLine,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Smartphone,
  ArrowRight,
  Sparkles,
  ZoomIn,
} from 'lucide-react';

type CaptureStep = 'choose' | 'camera' | 'preview' | 'processing' | 'result' | 'error';

interface ExtractedInvoice {
  invoiceNumber?: string;
  fromCompany?: string;
  toCompany?: string;
  totalAmount?: number;
  currency?: string;
  vatAmount?: number;
  subtotal?: number;
  issueDate?: string;
  dueDate?: string;
  items?: Array<{ description: string; quantity: number; unitPrice: number; vatRate: number; total: number }>;
}

export default function InvoiceCapturePage() {
  const lang = useStore((s) => s.settings.language);
  const settings = useStore((s) => s.settings);
  const addInvoices = useStore((s) => s.addInvoices);
  const router = useRouter();

  const [step, setStep] = useState<CaptureStep>('choose');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedInvoice | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError(lang === 'tr' ? 'Kameraya erisim saglanamadi.' : 'Could not access camera.');
      setStep('error');
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    setStep('preview');
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError(lang === 'tr' ? 'Sadece resim ve PDF dosyalari desteklenir.' : 'Only image and PDF files are supported.');
      setStep('error');
      return;
    }

    setCapturedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    } else {
      // PDF - go straight to processing
      setCapturedImage(null);
      setStep('preview');
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  // Process with AI — calls our server-side API (no client API key needed)
  const processWithAI = async () => {
    setStep('processing');

    try {
      let base64Data: string;
      let mediaType: string;

      if (capturedImage) {
        base64Data = capturedImage.split(',')[1];
        mediaType = capturedImage.split(';')[0].split(':')[1] || 'image/jpeg';
      } else if (capturedFile) {
        const buffer = await capturedFile.arrayBuffer();
        base64Data = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        mediaType = 'application/pdf';
      } else {
        throw new Error('No file to process');
      }

      const res = await fetch('/api/invoice-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: base64Data, mediaType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      if (!data.result) {
        setError(lang === 'tr' ? 'Bu dosyadan fatura bilgisi cikaramadik.' : 'Could not extract invoice data from this file.');
        setStep('error');
        return;
      }

      setExtracted(data.result);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  // Save to store
  const saveInvoice = () => {
    if (!extracted) return;

    const invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: extracted.invoiceNumber || `INV-${Date.now()}`,
      type: 'e-fatura' as const,
      status: 'draft' as const,
      direction: 'incoming' as const,
      issueDate: extracted.issueDate || new Date().toISOString().split('T')[0],
      dueDate: extracted.dueDate || '',
      fromCompany: extracted.fromCompany || '',
      fromTaxId: '',
      toCompany: extracted.toCompany || settings.companyName || '',
      toTaxId: settings.companyTaxId || '',
      toAddress: '',
      items: (extracted.items || []).map((item, i) => ({
        id: `item_${Date.now()}_${i}`,
        description: item.description,
        quantity: item.quantity || 1,
        unit: 'adet',
        unitPrice: item.unitPrice || 0,
        vatRate: item.vatRate || 20,
        vatAmount: ((item.unitPrice || 0) * (item.quantity || 1) * (item.vatRate || 20)) / 100,
        total: item.total || 0,
      })),
      subtotal: extracted.subtotal || (extracted.totalAmount || 0) - (extracted.vatAmount || 0),
      totalVat: extracted.vatAmount || 0,
      totalAmount: extracted.totalAmount || 0,
      currency: (extracted.currency || 'TRY') as 'TRY' | 'USD' | 'EUR',
      createdAt: new Date().toISOString(),
    };

    addInvoices([invoice]);
    router.push('/invoices');
  };

  // Reset
  const reset = () => {
    stopCamera();
    setCapturedImage(null);
    setCapturedFile(null);
    setExtracted(null);
    setError('');
    setStep('choose');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'tr' ? 'Fatura Yakala' : 'Capture Invoice'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {lang === 'tr'
            ? 'Faturanizi istediginiz yontemle gonderin — AI gerisini halletsin.'
            : 'Send your invoice however you want — AI handles the rest.'}
        </p>
      </div>

      {/* Step: Choose Method */}
      {step === 'choose' && (
        <div>
          {/* Hero drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-8 ${
              dragOver
                ? 'border-violet-500 bg-violet-50 scale-[1.01]'
                : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-violet-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {lang === 'tr' ? 'Fatura Surukle & Birak' : 'Drag & Drop Invoice'}
            </p>
            <p className="text-sm text-gray-500">
              {lang === 'tr'
                ? 'veya dosya secmek icin tiklayin (PDF, JPG, PNG)'
                : 'or click to select a file (PDF, JPG, PNG)'}
            </p>
            {dragOver && (
              <div className="absolute inset-0 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                <p className="text-violet-700 font-semibold text-lg">
                  {lang === 'tr' ? 'Birakin!' : 'Drop it!'}
                </p>
              </div>
            )}
          </div>

          {/* Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Camera */}
            <button
              onClick={startCamera}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {lang === 'tr' ? 'Kamera ile Cek' : 'Take Photo'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'tr'
                    ? 'Kagit faturayi telefonunuzla cekin'
                    : 'Snap a paper invoice with your phone'}
                </p>
              </div>
            </button>

            {/* Gmail */}
            <button
              onClick={() => router.push('/invoices/import')}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                <Mail className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {lang === 'tr' ? 'Gmail\'den Aktar' : 'Import from Gmail'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'tr'
                    ? 'E-posta eklerini otomatik tara'
                    : 'Auto-scan email attachments'}
                </p>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => {
                // Show WhatsApp instructions modal or redirect
                const whatsappNumber = '905XXXXXXXXX'; // TODO: Replace with actual number
                window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Merhaba, fatura gondermek istiyorum.')}`, '_blank');
              }}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {lang === 'tr' ? 'WhatsApp\'tan Gonder' : 'Send via WhatsApp'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'tr'
                    ? 'Fatura PDF/fotografini WhatsApp ile gonderin'
                    : 'Send invoice PDF/photo via WhatsApp'}
                </p>
              </div>
            </button>

            {/* Email forward */}
            <button
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all text-left group"
              onClick={() => {
                navigator.clipboard.writeText('fatura@remo.app');
                alert(lang === 'tr' ? 'E-posta adresi kopyalandi!' : 'Email address copied!');
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {lang === 'tr' ? 'E-posta ile Yonlendir' : 'Forward by Email'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'tr'
                    ? 'Faturalari fatura@remo.app adresine yonlendirin'
                    : 'Forward invoices to fatura@remo.app'}
                </p>
                <p className="text-[10px] text-violet-600 font-mono mt-1">fatura@remo.app</p>
              </div>
            </button>

            {/* Manual entry */}
            <button
              onClick={() => router.push('/invoices/new')}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                <PenLine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {lang === 'tr' ? 'Manuel Giris' : 'Manual Entry'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'tr'
                    ? 'Fatura bilgilerini elle girin'
                    : 'Enter invoice details manually'}
                </p>
              </div>
            </button>

            {/* Mobile share */}
            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 text-left opacity-75">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {lang === 'tr' ? 'Paylasim ile Gonder' : 'Share to Remo'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'tr'
                    ? 'Herhangi bir uygulamadan Paylas > Remo'
                    : 'From any app: Share > Remo'}
                </p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium mt-1.5">
                  {lang === 'tr' ? 'Yakinda' : 'Coming soon'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Powered badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'tr'
                ? 'Tum yontemler AI destekli — fatura otomatik okunur ve kaydedilir'
                : 'All methods are AI-powered — invoices are automatically read and saved'}
            </span>
          </div>
        </div>
      )}

      {/* Step: Camera */}
      {step === 'camera' && (
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-black rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-[4/3] object-cover"
            />
            {/* Capture guide overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-white/30 rounded-xl" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/70 text-sm">
                  {lang === 'tr' ? 'Faturayi cerceve icine alin' : 'Align invoice within the frame'}
                </p>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {lang === 'tr' ? 'Iptal' : 'Cancel'}
            </button>
            <button
              onClick={capturePhoto}
              className="px-8 py-3 rounded-xl remo-gradient text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {lang === 'tr' ? 'Cek' : 'Capture'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            {capturedImage ? (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured invoice"
                  className="w-full rounded-xl border border-gray-200"
                />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-lg shadow hover:bg-white"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : capturedFile ? (
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
                <FileText className="w-10 h-10 text-violet-600" />
                <div>
                  <p className="font-medium text-gray-900">{capturedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(capturedFile.size / 1024).toFixed(0)} KB — {capturedFile.type}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-between mt-6">
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                {lang === 'tr' ? 'Tekrar Cek' : 'Retake'}
              </button>
              <button
                onClick={processWithAI}
                className="px-6 py-2.5 rounded-xl remo-gradient text-white font-medium hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {lang === 'tr' ? 'AI ile Oku' : 'Read with AI'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 remo-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {lang === 'tr' ? 'Fatura Okunuyor...' : 'Reading Invoice...'}
          </h2>
          <p className="text-sm text-gray-500">
            {lang === 'tr'
              ? 'AI fatura icerigini analiz ediyor. Bu birkaç saniye surebilir.'
              : 'AI is analyzing the invoice content. This may take a few seconds.'}
          </p>
          <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto mt-6" />
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && extracted && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {lang === 'tr' ? 'Fatura Basariyla Okundu!' : 'Invoice Read Successfully!'}
            </h2>
          </div>

          <Card>
            <div className="space-y-4">
              {/* Invoice header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{lang === 'tr' ? 'Fatura No' : 'Invoice No'}</p>
                  <p className="text-lg font-bold text-gray-900">{extracted.invoiceNumber || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{lang === 'tr' ? 'Toplam' : 'Total'}</p>
                  <p className="text-2xl font-bold text-violet-600">
                    {extracted.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {extracted.currency || 'TL'}
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Gonderen' : 'From'}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{extracted.fromCompany || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Alici' : 'To'}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{extracted.toCompany || '—'}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Tarih' : 'Date'}</p>
                  <p className="text-sm text-gray-900 mt-1">{extracted.issueDate || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{lang === 'tr' ? 'Vade' : 'Due'}</p>
                  <p className="text-sm text-gray-900 mt-1">{extracted.dueDate || '—'}</p>
                </div>
              </div>

              {/* Items */}
              {extracted.items && extracted.items.length > 0 && (
                <>
                  <hr className="border-gray-100" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{lang === 'tr' ? 'Kalemler' : 'Items'}</p>
                    <div className="space-y-2">
                      {extracted.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.description}
                            {item.quantity > 1 && <span className="text-gray-400"> x{item.quantity}</span>}
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {extracted.currency || 'TL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Totals */}
              <hr className="border-gray-100" />
              <div className="space-y-1">
                {extracted.subtotal != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{lang === 'tr' ? 'Ara Toplam' : 'Subtotal'}</span>
                    <span className="text-gray-900">
                      {extracted.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {extracted.currency || 'TL'}
                    </span>
                  </div>
                )}
                {extracted.vatAmount != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">KDV</span>
                    <span className="text-gray-900">
                      {extracted.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {extracted.currency || 'TL'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-1">
                  <span className="text-gray-900">{lang === 'tr' ? 'Genel Toplam' : 'Total'}</span>
                  <span className="text-violet-600">
                    {(extracted.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {extracted.currency || 'TL'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-between mt-6">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              {lang === 'tr' ? 'Baska Fatura' : 'Another Invoice'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/invoices/new')}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                {lang === 'tr' ? 'Duzelt' : 'Edit'}
              </button>
              <button
                onClick={saveInvoice}
                className="px-6 py-2.5 rounded-xl remo-gradient text-white font-medium hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'tr' ? 'Kaydet' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {lang === 'tr' ? 'Bir Hata Olustu' : 'Something Went Wrong'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl remo-gradient text-white font-medium hover:opacity-90 transition-opacity text-sm"
          >
            {lang === 'tr' ? 'Tekrar Dene' : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
}
