import type { Invoice, Order, Supplier, Customer, ActivityItem } from './types';

export const demoSuppliers: Supplier[] = [
  {
    id: 'sup-1', type: 'supplier', name: 'Stahl Europa GmbH', taxId: 'DE-123456789', taxOffice: 'Munich',
    address: 'Industriestr. 45, Munich', city: 'Munich', country: 'Germany',
    phone: '+49 89 1234 5678', email: 'info@stahleuropa.de', category: 'Çelik / Metal',
    totalOrders: 24, totalSpent: 1_250_000, currency: 'EUR', rating: 4, lastOrderDate: '2026-05-10',
    iban: 'DE89 3704 0044 0532 0130 00', bankName: 'Commerzbank',
  },
  {
    id: 'sup-2', type: 'supplier', name: 'ABC Ambalaj San. Tic. A.Ş.', taxId: '1234567890', taxOffice: 'Tuzla',
    address: 'Sanayi Mah. Fabrika Cad. No:12, Tuzla', city: 'İstanbul', country: 'Türkiye',
    phone: '+90 216 555 1234', email: 'satis@abcambalaj.com.tr', category: 'Ambalaj',
    totalOrders: 48, totalSpent: 850_000, currency: 'TRY', rating: 5, lastOrderDate: '2026-05-15',
    iban: 'TR33 0006 2000 1234 0006 2945 01', bankName: 'Garanti BBVA',
  },
  {
    id: 'sup-3', type: 'supplier', name: 'TechParts Industrial Supply Co.', taxId: 'US-87-1234567', taxOffice: 'Chicago',
    address: '1234 Industrial Blvd, Chicago, IL', city: 'Chicago', country: 'USA',
    phone: '+1 312 555 0199', email: 'sales@techparts.com', category: 'Elektronik / Enerji',
    totalOrders: 12, totalSpent: 520_000, currency: 'USD', rating: 4, lastOrderDate: '2026-05-01',
    iban: 'US 021000021 4567890123', bankName: 'JPMorgan Chase',
  },
  {
    id: 'sup-4', type: 'supplier', name: 'Anadolu Kimya Ltd. Şti.', taxId: '9876543210', taxOffice: 'Gebze',
    address: 'OSB 5. Cadde No:8, Gebze', city: 'Kocaeli', country: 'Türkiye',
    phone: '+90 262 555 9876', email: 'bilgi@anadolukimya.com.tr', category: 'Kimyasal',
    totalOrders: 36, totalSpent: 420_000, currency: 'TRY', rating: 3, lastOrderDate: '2026-04-28',
    iban: 'TR76 0001 0012 3456 7890 1234 56', bankName: 'Ziraat Bankası',
  },
  {
    id: 'sup-5', type: 'supplier', name: 'Global Freight Solutions', taxId: 'CN-SHFR-2020', taxOffice: 'Shanghai',
    address: '888 Pudong Ave, Shanghai', city: 'Shanghai', country: 'China',
    phone: '+86 21 5555 8888', email: 'logistics@globalfreight.cn', category: 'Lojistik',
    totalOrders: 18, totalSpent: 180_000, currency: 'USD', rating: 4, lastOrderDate: '2026-05-12',
  },
];

export const demoCustomers: Customer[] = [
  {
    id: 'cust-1', type: 'customer', name: 'Yılmaz Enerji A.Ş.', taxId: '1112223334', taxOffice: 'Gebze',
    address: 'Atatürk Mah. Sanayi Cad. No:45, Gebze', city: 'Kocaeli', country: 'Türkiye',
    phone: '+90 262 555 4567', email: 'satin.alma@yilmazenerji.com.tr', sector: 'Enerji',
    totalOrders: 15, totalRevenue: 2_100_000, currency: 'TRY', lastOrderDate: '2026-05-14',
  },
  {
    id: 'cust-2', type: 'customer', name: 'Özdemir İnşaat Ltd. Şti.', taxId: '5556667778', taxOffice: 'Kadıköy',
    address: 'Bağdat Cad. No:220, Kadıköy', city: 'İstanbul', country: 'Türkiye',
    phone: '+90 216 555 7890', email: 'info@ozdemirinsaat.com.tr', sector: 'İnşaat',
    totalOrders: 22, totalRevenue: 3_450_000, currency: 'TRY', lastOrderDate: '2026-05-18',
  },
  {
    id: 'cust-3', type: 'customer', name: 'Balkan Trade S.R.L.', taxId: 'RO-12345678', taxOffice: 'Bucharest',
    address: 'Str. Victoriei 100, Bucharest', city: 'Bucharest', country: 'Romania',
    phone: '+40 21 555 1234', email: 'office@balkantrade.ro', sector: 'İthalat/İhracat',
    totalOrders: 8, totalRevenue: 380_000, currency: 'EUR', lastOrderDate: '2026-04-22',
  },
  {
    id: 'cust-4', type: 'customer', name: 'Demir Makina San. A.Ş.', taxId: '3334445556', taxOffice: 'Nilüfer',
    address: 'OSB 2. Yol No:15, Nilüfer', city: 'Bursa', country: 'Türkiye',
    phone: '+90 224 555 3456', email: 'muhsebe@demirmakina.com.tr', sector: 'Makina',
    totalOrders: 19, totalRevenue: 1_750_000, currency: 'TRY', lastOrderDate: '2026-05-08',
  },
];

export const demoInvoices: Invoice[] = [
  {
    id: 'inv-1', invoiceNumber: 'FTR-2026-0142', type: 'e-fatura', status: 'paid', direction: 'outgoing',
    issueDate: '2026-05-01', dueDate: '2026-05-31', paidDate: '2026-05-18',
    fromCompany: 'Şirketim A.Ş.', fromTaxId: '9990001112', toCompany: 'Yılmaz Enerji A.Ş.', toTaxId: '1112223334',
    toAddress: 'Atatürk Mah. Sanayi Cad. No:45, Gebze, Kocaeli',
    items: [
      { id: 'i1', description: 'Endüstriyel Trafo (500kVA)', quantity: 3, unit: 'adet', unitPrice: 125_000, vatRate: 20, vatAmount: 75_000, total: 375_000 },
      { id: 'i2', description: 'Montaj ve Devreye Alma', quantity: 1, unit: 'hizmet', unitPrice: 45_000, vatRate: 20, vatAmount: 9_000, total: 45_000 },
    ],
    subtotal: 420_000, totalVat: 84_000, totalAmount: 504_000, currency: 'TRY',
    eFaturaId: 'GIB-2026-A1B2C3', eFaturaStatus: 'accepted', ettn: 'F47AC10B-58CC-4372-A567-0E02B2C3D479',
    paymentMethod: 'bank_transfer', bankName: 'İş Bankası', iban: 'TR12 0006 4000 0011 2345 6789 01',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'inv-2', invoiceNumber: 'FTR-2026-0143', type: 'e-fatura', status: 'sent', direction: 'outgoing',
    issueDate: '2026-05-10', dueDate: '2026-06-10',
    fromCompany: 'Şirketim A.Ş.', fromTaxId: '9990001112', toCompany: 'Özdemir İnşaat Ltd. Şti.', toTaxId: '5556667778',
    toAddress: 'Bağdat Cad. No:220, Kadıköy, İstanbul',
    items: [
      { id: 'i3', description: 'Çelik Konstrüksiyon Malzemesi', quantity: 50, unit: 'ton', unitPrice: 18_500, vatRate: 20, vatAmount: 185_000, total: 925_000 },
    ],
    subtotal: 925_000, totalVat: 185_000, totalAmount: 1_110_000, currency: 'TRY',
    eFaturaId: 'GIB-2026-D4E5F6', eFaturaStatus: 'sent', ettn: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'inv-3', invoiceNumber: 'INV-2026-0847', type: 'standard', status: 'overdue', direction: 'incoming',
    issueDate: '2026-04-15', dueDate: '2026-05-15',
    fromCompany: 'TechParts Industrial Supply Co.', fromTaxId: 'US-87-1234567',
    toCompany: 'Şirketim A.Ş.', toTaxId: '9990001112',
    toAddress: 'Merkez Mah. İş Cad. No:1, Kadıköy, İstanbul',
    items: [
      { id: 'i4', description: 'Industrial Transformer (500kVA)', quantity: 3, unit: 'pcs', unitPrice: 12_500, vatRate: 0, vatAmount: 0, total: 37_500 },
      { id: 'i5', description: 'Circuit Breaker Panel (400A)', quantity: 10, unit: 'pcs', unitPrice: 1_850, vatRate: 0, vatAmount: 0, total: 18_500 },
      { id: 'i6', description: 'Copper Busbar (2m)', quantity: 50, unit: 'pcs', unitPrice: 340, vatRate: 0, vatAmount: 0, total: 17_000 },
    ],
    subtotal: 73_000, totalVat: 0, totalAmount: 83_800, currency: 'USD',
    notes: 'CIF Istanbul. Late payment penalty: 1.5% per month.',
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'inv-4', invoiceNumber: 'FTR-2026-0089', type: 'e-arsiv', status: 'paid', direction: 'incoming',
    issueDate: '2026-05-05', dueDate: '2026-05-20', paidDate: '2026-05-16',
    fromCompany: 'ABC Ambalaj San. Tic. A.Ş.', fromTaxId: '1234567890',
    toCompany: 'Şirketim A.Ş.', toTaxId: '9990001112',
    toAddress: 'Merkez Mah. İş Cad. No:1, Kadıköy, İstanbul',
    items: [
      { id: 'i7', description: 'Oluklu Mukavva Kutu (50x40x30)', quantity: 10_000, unit: 'adet', unitPrice: 8.50, vatRate: 20, vatAmount: 17_000, total: 85_000 },
    ],
    subtotal: 85_000, totalVat: 17_000, totalAmount: 102_000, currency: 'TRY',
    eFaturaStatus: 'accepted',
    paymentMethod: 'bank_transfer', bankName: 'Garanti BBVA', iban: 'TR33 0006 2000 1234 0006 2945 01',
    createdAt: '2026-05-05T11:00:00Z',
  },
  {
    id: 'inv-5', invoiceNumber: 'FTR-2026-0144', type: 'e-fatura', status: 'draft', direction: 'outgoing',
    issueDate: '2026-05-19', dueDate: '2026-06-19',
    fromCompany: 'Şirketim A.Ş.', fromTaxId: '9990001112',
    toCompany: 'Demir Makina San. A.Ş.', toTaxId: '3334445556',
    toAddress: 'OSB 2. Yol No:15, Nilüfer, Bursa',
    items: [
      { id: 'i8', description: 'Hidrolik Pres Yedek Parça Seti', quantity: 5, unit: 'set', unitPrice: 28_000, vatRate: 20, vatAmount: 28_000, total: 140_000 },
      { id: 'i9', description: 'Teknik Servis (Yerinde)', quantity: 2, unit: 'gün', unitPrice: 15_000, vatRate: 20, vatAmount: 6_000, total: 30_000 },
    ],
    subtotal: 170_000, totalVat: 34_000, totalAmount: 204_000, currency: 'TRY',
    createdAt: '2026-05-19T16:00:00Z',
  },
];

export const demoOrders: Order[] = [
  {
    id: 'ord-1', orderNumber: 'PO-2026-078', type: 'purchase', status: 'in_transit',
    counterparty: 'Stahl Europa GmbH', counterpartyId: 'sup-1',
    items: [
      { id: 'oi1', productName: 'Hot-Rolled Steel Plates (S355J2+N)', quantity: 500, unit: 'ton', unitPrice: 890, total: 445_000 },
    ],
    subtotal: 445_000, totalAmount: 529_550, currency: 'EUR',
    orderDate: '2026-04-20', expectedDelivery: '2026-06-02', trackingNumber: 'MSKU7234561',
    shippingMethod: 'Sea Freight', incoterms: 'CIF Istanbul',
    createdAt: '2026-04-20T09:00:00Z',
  },
  {
    id: 'ord-2', orderNumber: 'SO-2026-145', type: 'sales', status: 'confirmed',
    counterparty: 'Özdemir İnşaat Ltd. Şti.', counterpartyId: 'cust-2',
    items: [
      { id: 'oi2', productName: 'Çelik Konstrüksiyon Malzemesi', quantity: 50, unit: 'ton', unitPrice: 18_500, total: 925_000 },
    ],
    subtotal: 925_000, totalAmount: 1_110_000, currency: 'TRY',
    orderDate: '2026-05-10', expectedDelivery: '2026-05-25',
    linkedInvoiceId: 'inv-2',
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'ord-3', orderNumber: 'PO-2026-079', type: 'purchase', status: 'delivered',
    counterparty: 'ABC Ambalaj San. Tic. A.Ş.', counterpartyId: 'sup-2',
    items: [
      { id: 'oi3', productName: 'Oluklu Mukavva Kutu (50x40x30)', quantity: 10_000, unit: 'adet', unitPrice: 8.50, total: 85_000 },
    ],
    subtotal: 85_000, totalAmount: 102_000, currency: 'TRY',
    orderDate: '2026-04-28', expectedDelivery: '2026-05-12', actualDelivery: '2026-05-10',
    linkedInvoiceId: 'inv-4',
    createdAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'ord-4', orderNumber: 'SO-2026-146', type: 'sales', status: 'pending',
    counterparty: 'Balkan Trade S.R.L.', counterpartyId: 'cust-3',
    items: [
      { id: 'oi4', productName: 'Industrial Valve Set', quantity: 200, unit: 'pcs', unitPrice: 450, total: 90_000 },
      { id: 'oi5', productName: 'Gasket Kit', quantity: 200, unit: 'pcs', unitPrice: 85, total: 17_000 },
    ],
    subtotal: 107_000, totalAmount: 107_000, currency: 'EUR',
    orderDate: '2026-05-18', expectedDelivery: '2026-06-15', incoterms: 'FOB Istanbul',
    createdAt: '2026-05-18T11:00:00Z',
  },
  {
    id: 'ord-5', orderNumber: 'PO-2026-080', type: 'purchase', status: 'confirmed',
    counterparty: 'Anadolu Kimya Ltd. Şti.', counterpartyId: 'sup-4',
    items: [
      { id: 'oi6', productName: 'Endüstriyel Solvent (IPA)', quantity: 5_000, unit: 'lt', unitPrice: 42, total: 210_000 },
    ],
    subtotal: 210_000, totalAmount: 252_000, currency: 'TRY',
    orderDate: '2026-05-15', expectedDelivery: '2026-05-28',
    createdAt: '2026-05-15T09:00:00Z',
  },
];

export const demoActivities: ActivityItem[] = [
  { id: 'act-1', type: 'payment', title: 'Ödeme alındı', description: 'Yılmaz Enerji A.Ş. — FTR-2026-0142', timestamp: '2026-05-18T14:30:00Z', amount: 504_000, currency: 'TRY' },
  { id: 'act-2', type: 'order', title: 'Yeni sipariş oluşturuldu', description: 'Balkan Trade S.R.L. — SO-2026-146', timestamp: '2026-05-18T11:00:00Z', amount: 107_000, currency: 'EUR' },
  { id: 'act-3', type: 'invoice', title: 'Fatura taslağı hazırlandı', description: 'Demir Makina — FTR-2026-0144', timestamp: '2026-05-19T16:00:00Z', amount: 204_000, currency: 'TRY' },
  { id: 'act-4', type: 'payment', title: 'Ödeme yapıldı', description: 'ABC Ambalaj — FTR-2026-0089', timestamp: '2026-05-16T10:00:00Z', amount: 102_000, currency: 'TRY' },
  { id: 'act-5', type: 'order', title: 'Sipariş yolda', description: 'Stahl Europa — PO-2026-078 (MSKU7234561)', timestamp: '2026-05-14T08:00:00Z', amount: 529_550, currency: 'EUR' },
  { id: 'act-6', type: 'invoice', title: 'Vadesi geçen fatura', description: 'TechParts — INV-2026-0847 (5 gün gecikme)', timestamp: '2026-05-15T00:00:00Z', amount: 83_800, currency: 'USD' },
  { id: 'act-7', type: 'supplier', title: 'Yeni tedarikçi eklendi', description: 'Global Freight Solutions — Lojistik', timestamp: '2026-05-12T09:00:00Z' },
  { id: 'act-8', type: 'order', title: 'Sipariş teslim edildi', description: 'ABC Ambalaj — PO-2026-079', timestamp: '2026-05-10T15:00:00Z' },
];
