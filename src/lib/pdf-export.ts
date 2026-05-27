'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from './types';
import { formatCurrency } from './i18n';

export function exportInvoicePDF(invoice: Invoice, lang: 'tr' | 'en' = 'tr') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header gradient bar
  doc.setFillColor(124, 58, 237); // violet-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Company logo placeholder
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Remo', 14, 18);

  // Invoice type badge
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.type.toUpperCase(), pageWidth - 14, 12, { align: 'right' });

  // Invoice number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, pageWidth - 14, 20, { align: 'right' });

  // Reset text color
  doc.setTextColor(31, 41, 55); // gray-800

  // From / To section
  const y = 40;

  // From
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(lang === 'tr' ? 'GONDEREN' : 'FROM', 14, y);
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.fromCompany, 14, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  if (invoice.fromTaxId) {
    doc.text(`${lang === 'tr' ? 'VKN' : 'Tax ID'}: ${invoice.fromTaxId}`, 14, y + 14);
  }

  // To
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(lang === 'tr' ? 'ALICI' : 'TO', pageWidth / 2 + 10, y);
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.toCompany, pageWidth / 2 + 10, y + 7);
  doc.setFont('helvetica', 'normal');
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
  doc.text(lang === 'tr' ? 'DUZENLEME TARIHI' : 'ISSUE DATE', 20, dateY + 2);
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.issueDate, 20, dateY + 9);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(lang === 'tr' ? 'VADE TARIHI' : 'DUE DATE', 80, dateY + 2);
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.dueDate, 80, dateY + 9);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(lang === 'tr' ? 'DURUM' : 'STATUS', 140, dateY + 2);
  doc.setFontSize(10);
  const statusLabels: Record<string, Record<string, string>> = {
    tr: { draft: 'Taslak', sent: 'Gonderildi', paid: 'Odendi', overdue: 'Vadesi Gecti', cancelled: 'Iptal' },
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
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabels[lang][invoice.status] || invoice.status, 140, dateY + 9);

  // Items table
  const tableStartY = dateY + 25;
  doc.setFont('helvetica', 'normal');

  const tableHeaders = lang === 'tr'
    ? ['Aciklama', 'Miktar', 'Birim', 'Birim Fiyat', 'KDV %', 'KDV Tutar', 'Toplam']
    : ['Description', 'Qty', 'Unit', 'Unit Price', 'VAT %', 'VAT Amt', 'Total'];

  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unit,
    formatCurrency(item.unitPrice, invoice.currency),
    `%${item.vatRate}`,
    formatCurrency(item.vatAmount, invoice.currency),
    formatCurrency(item.total, invoice.currency),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'right', cellWidth: 25 },
      6: { halign: 'right', cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  });

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  const totalsX = pageWidth - 14;
  const totalsLabelX = pageWidth - 80;

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(lang === 'tr' ? 'Ara Toplam:' : 'Subtotal:', totalsLabelX, finalY);
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), totalsX, finalY, { align: 'right' });

  doc.setTextColor(107, 114, 128);
  doc.text(lang === 'tr' ? 'KDV Toplam:' : 'Total VAT:', totalsLabelX, finalY + 7);
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrency(invoice.totalVat, invoice.currency), totalsX, finalY + 7, { align: 'right' });

  // Grand total with highlight
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(totalsLabelX - 5, finalY + 12, totalsX - totalsLabelX + 10, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'tr' ? 'GENEL TOPLAM:' : 'TOTAL:', totalsLabelX, finalY + 20);
  doc.text(formatCurrency(invoice.totalAmount, invoice.currency), totalsX, finalY + 20, { align: 'right' });

  // Notes
  if (invoice.notes) {
    const notesY = finalY + 35;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'normal');
    doc.text(lang === 'tr' ? 'ODEME BILGILERI' : 'PAYMENT INFO', 14, payY);
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
    if (invoice.eFaturaId) doc.text(`e-Fatura UUID: ${invoice.eFaturaId}`, 14, refY + 2);
    if (invoice.ettn) doc.text(`ETTN: ${invoice.ettn}`, 14, refY + 8);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 8;
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('Remo — AI-Powered Business Operations', 14, footerY);
  doc.text(`${lang === 'tr' ? 'Olusturulma' : 'Generated'}: ${new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}`, pageWidth - 14, footerY, { align: 'right' });

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
