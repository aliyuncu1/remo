'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, Currency } from './types';

const FONT_NAME = 'DejaVuSans';

// Cache the base64-encoded fonts so we only fetch them once per session.
let fontCache: Promise<{ regular: string; bold: string }> | null = null;

async function fetchFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font: ${url}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function loadFonts() {
  if (!fontCache) {
    fontCache = Promise.all([
      fetchFontBase64('/fonts/DejaVuSans.ttf'),
      fetchFontBase64('/fonts/DejaVuSans-Bold.ttf'),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return fontCache;
}

// Turkish-style currency for the PDF: "504.000,00 TL". Avoids glyph issues with ₺.
function pdfCurrency(amount: number, currency: Currency = 'TRY'): string {
  const codes: Record<string, string> = { TRY: 'TL', USD: 'USD', EUR: 'EUR', GBP: 'GBP' };
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${codes[currency] || currency}`;
}

export async function exportInvoicePDF(invoice: Invoice, lang: 'tr' | 'en' = 'tr') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Embed a Unicode font so Turkish characters (ş, ğ, ı, İ, ö, ü, ç) render correctly.
  const { regular, bold } = await loadFonts();
  doc.addFileToVFS('DejaVuSans.ttf', regular);
  doc.addFont('DejaVuSans.ttf', FONT_NAME, 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', bold);
  doc.addFont('DejaVuSans-Bold.ttf', FONT_NAME, 'bold');
  doc.setFont(FONT_NAME, 'normal');

  // Header bar
  doc.setFillColor(124, 58, 237); // violet-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(FONT_NAME, 'bold');
  doc.text('Remo', 14, 18);

  doc.setFontSize(9);
  doc.setFont(FONT_NAME, 'normal');
  doc.text(invoice.type.toUpperCase(), pageWidth - 14, 12, { align: 'right' });

  doc.setFontSize(14);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(invoice.invoiceNumber, pageWidth - 14, 20, { align: 'right' });

  doc.setTextColor(31, 41, 55); // gray-800

  // From / To section
  const y = 40;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.setFont(FONT_NAME, 'normal');
  doc.text(lang === 'tr' ? 'GÖNDEREN' : 'FROM', 14, y);
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(invoice.fromCompany, 14, y + 7);
  doc.setFont(FONT_NAME, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  if (invoice.fromTaxId) {
    doc.text(`${lang === 'tr' ? 'VKN' : 'Tax ID'}: ${invoice.fromTaxId}`, 14, y + 14);
  }

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(lang === 'tr' ? 'ALICI' : 'TO', pageWidth / 2 + 10, y);
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(invoice.toCompany, pageWidth / 2 + 10, y + 7);
  doc.setFont(FONT_NAME, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  if (invoice.toTaxId) {
    doc.text(`${lang === 'tr' ? 'VKN' : 'Tax ID'}: ${invoice.toTaxId}`, pageWidth / 2 + 10, y + 14);
  }
  if (invoice.toAddress) {
    const addressLines = doc.splitTextToSize(invoice.toAddress, 70);
    doc.text(addressLines, pageWidth / 2 + 10, y + 20);
  }

  // Dates section
  const dateY = y + 35;
  doc.setFillColor(249, 250, 251); // gray-50
  doc.roundedRect(14, dateY - 5, pageWidth - 28, 20, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont(FONT_NAME, 'normal');
  doc.text(lang === 'tr' ? 'DÜZENLEME TARİHİ' : 'ISSUE DATE', 20, dateY + 2);
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(invoice.issueDate, 20, dateY + 9);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont(FONT_NAME, 'normal');
  doc.text(lang === 'tr' ? 'VADE TARİHİ' : 'DUE DATE', 80, dateY + 2);
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(invoice.dueDate, 80, dateY + 9);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont(FONT_NAME, 'normal');
  doc.text(lang === 'tr' ? 'DURUM' : 'STATUS', 140, dateY + 2);
  doc.setFontSize(10);
  const statusLabels: Record<string, Record<string, string>> = {
    tr: { draft: 'Taslak', sent: 'Gönderildi', paid: 'Ödendi', overdue: 'Vadesi Geçti', cancelled: 'İptal' },
    en: { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled' },
  };
  const statusColors: Record<string, [number, number, number]> = {
    draft: [107, 114, 128],
    sent: [29, 78, 216],
    paid: [22, 163, 74],
    overdue: [220, 38, 38],
    cancelled: [107, 114, 128],
  };
  const sColor = statusColors[invoice.status] || [31, 41, 55];
  doc.setTextColor(sColor[0], sColor[1], sColor[2]);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(statusLabels[lang][invoice.status] || invoice.status, 140, dateY + 9);

  // Items table
  const tableStartY = dateY + 25;
  doc.setFont(FONT_NAME, 'normal');

  const tableHeaders = lang === 'tr'
    ? ['Açıklama', 'Miktar', 'Birim', 'Birim Fiyat', 'KDV %', 'KDV Tutarı', 'Toplam']
    : ['Description', 'Qty', 'Unit', 'Unit Price', 'VAT %', 'VAT Amt', 'Total'];

  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unit,
    pdfCurrency(item.unitPrice, invoice.currency),
    `%${item.vatRate}`,
    pdfCurrency(item.vatAmount, invoice.currency),
    pdfCurrency(item.total, invoice.currency),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: { font: FONT_NAME },
    headStyles: {
      font: FONT_NAME,
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      font: FONT_NAME,
      fontSize: 8,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'center', cellWidth: 14 },
      2: { halign: 'center', cellWidth: 14 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'right', cellWidth: 28 },
      6: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
  });

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  const totalsX = pageWidth - 14;
  const totalsLabelX = pageWidth - 80;

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.setFont(FONT_NAME, 'normal');
  doc.text(lang === 'tr' ? 'Ara Toplam:' : 'Subtotal:', totalsLabelX, finalY);
  doc.setTextColor(31, 41, 55);
  doc.text(pdfCurrency(invoice.subtotal, invoice.currency), totalsX, finalY, { align: 'right' });

  doc.setTextColor(107, 114, 128);
  doc.text(lang === 'tr' ? 'KDV Toplamı:' : 'Total VAT:', totalsLabelX, finalY + 7);
  doc.setTextColor(31, 41, 55);
  doc.text(pdfCurrency(invoice.totalVat, invoice.currency), totalsX, finalY + 7, { align: 'right' });

  // Grand total with highlight
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(totalsLabelX - 5, finalY + 12, totalsX - totalsLabelX + 10, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(FONT_NAME, 'bold');
  doc.text(lang === 'tr' ? 'GENEL TOPLAM:' : 'TOTAL:', totalsLabelX, finalY + 20);
  doc.text(pdfCurrency(invoice.totalAmount, invoice.currency), totalsX, finalY + 20, { align: 'right' });

  // Notes
  if (invoice.notes) {
    const notesY = finalY + 35;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont(FONT_NAME, 'normal');
    doc.text(lang === 'tr' ? 'NOTLAR' : 'NOTES', 14, notesY);
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 28);
    doc.text(noteLines, 14, notesY + 6);
  }

  // Payment info
  if (invoice.iban || invoice.bankName) {
    const payY = finalY + (invoice.notes ? 55 : 35);
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont(FONT_NAME, 'normal');
    doc.text(lang === 'tr' ? 'ÖDEME BİLGİLERİ' : 'PAYMENT INFO', 14, payY);
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    if (invoice.bankName) doc.text(`${lang === 'tr' ? 'Banka' : 'Bank'}: ${invoice.bankName}`, 14, payY + 6);
    if (invoice.iban) doc.text(`IBAN: ${invoice.iban}`, 14, payY + 12);
  }

  // e-Fatura reference
  if (invoice.eFaturaId || invoice.ettn) {
    const refY = doc.internal.pageSize.getHeight() - 30;
    doc.setFillColor(249, 250, 251);
    doc.rect(0, refY - 5, pageWidth, 25, 'F');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.setFont(FONT_NAME, 'normal');
    if (invoice.eFaturaId) doc.text(`e-Fatura UUID: ${invoice.eFaturaId}`, 14, refY + 2);
    if (invoice.ettn) doc.text(`ETTN: ${invoice.ettn}`, 14, refY + 8);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 8;
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.setFont(FONT_NAME, 'normal');
  doc.text('Remo — AI-Powered Business Operations', 14, footerY);
  doc.text(`${lang === 'tr' ? 'Oluşturulma' : 'Generated'}: ${new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}`, pageWidth - 14, footerY, { align: 'right' });

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
