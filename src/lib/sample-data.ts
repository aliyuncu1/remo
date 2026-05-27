export const sampleCases = [
  {
    id: 'test-1',
    title: 'English Supplier Offer Email',
    description: 'A formal supplier offer from a German steel company',
    content: `Subject: Quotation for Steel Plates - Q2 2026

Dear Mr. Yilmaz,

Thank you for your inquiry regarding steel plates for your construction project.

We are pleased to offer the following:

Product: Hot-Rolled Steel Plates (S355J2+N)
Quantity: 500 metric tons
Unit Price: EUR 890 per ton
Total: EUR 445,000
VAT: 19% (EUR 84,550)
Grand Total: EUR 529,550

Delivery Terms: CIF Istanbul
Payment Terms: 30% advance, 70% upon delivery
Delivery Date: Within 6-8 weeks after order confirmation
Validity: This offer is valid until June 30, 2026

Bank Details:
IBAN: DE89 3704 0044 0532 0130 00
BIC: COBADEFFXXX
Bank: Commerzbank AG

Please note that prices are subject to change based on raw material market fluctuations. Packaging and transport insurance are included.

We look forward to your response.

Best regards,
Hans Mueller
Sales Director
Stahl Europa GmbH
Munich, Germany
Tel: +49 89 1234 5678
Email: h.mueller@stahleuropa.de`,
  },
  {
    id: 'test-2',
    title: 'Turkish Supplier Offer (Tedarikçi Teklifi)',
    description: 'A Turkish language supplier quotation for packaging materials',
    content: `Konu: Ambalaj Malzemesi Teklifi

Sayın Mehmet Bey,

Talebiniz doğrultusunda aşağıdaki teklifimizi sunarız:

Ürün: Oluklu Mukavva Kutu (50x40x30 cm)
Miktar: 10.000 adet
Birim Fiyat: 8,50 TL/adet
Toplam: 85.000 TL
KDV (%20): 17.000 TL
Genel Toplam: 102.000 TL

Teslimat: Fabrika teslim (İstanbul, Tuzla)
Ödeme Koşulları: %50 sipariş onayında, %50 teslimatta
Teslimat Süresi: Sipariş onayından itibaren 2 hafta
Teklif Geçerliliği: 15 gün

Banka Bilgileri:
Banka: Garanti BBVA
IBAN: TR33 0006 2000 1234 0006 2945 01
Hesap Sahibi: ABC Ambalaj San. Tic. A.Ş.

Minimum sipariş adedi 5.000'dir. 20.000 adet üzeri siparişlerde %5 indirim uygulanır.

Kağıt hammadde fiyatlarındaki dalgalanmalara bağlı olarak fiyatlar değişiklik gösterebilir.

Saygılarımla,
Ayşe Kaya
Satış Müdürü
ABC Ambalaj San. Tic. A.Ş.
İstanbul
Tel: +90 216 555 1234`,
  },
  {
    id: 'test-3',
    title: 'Mixed TR-EN Logistics Email',
    description: 'A bilingual logistics update about a delayed shipment',
    content: `Subject: RE: Shipment Update - Container MSKU7234561

Merhaba Ahmet Bey,

I'm writing to update you on the shipment status.

Container number MSKU7234561 için durum güncellemesi:

Current Status: Vessel delayed at Port Said
Original ETA Istanbul: May 25, 2026
Revised ETA: June 2, 2026 (tahmini)

Delay reason: Süveyş Kanalı'nda yaşanan trafik yoğunluğu nedeniyle 7-8 günlük gecikme bekleniyor.

Shipment details:
- 2x 40ft HC containers
- Origin: Shanghai, China
- Destination: Ambarlı Port, Istanbul
- B/L Number: MAEU123456789
- Commodity: Electronic components
- Weight: 24,500 kg per container
- Value: USD 185,000

Gümrükleme için gerekli dokümanlar hazır mı? We need the following before arrival:
1. Import license
2. Conformity certificate
3. Insurance certificate

Demurrage charges may apply if documents are not ready: USD 150/day per container after 5 free days.

Lütfen en kısa sürede bilgi veriniz.

Best regards / Saygılarımla,
Maria Chen
Logistics Coordinator
Global Freight Solutions
Shanghai / Istanbul`,
  },
  {
    id: 'test-4',
    title: 'Messy WhatsApp-style Message',
    description: 'An informal business message with typos and casual language',
    content: `ahmet abi selamlar
dünkü toplantıda konuştuğumuz malzeme hakkında yazıyorum
500 ton çelik levha lazım acil
fiyat 890 euro civarı dedi adam ama belki 850ye düşer bi soralım
teslim 6 hafta diyo ama bence 8 haftayı bulur
ödeme 30 peşin 70 teslimde istiyo
bi de şu var istanbul cif demiş ama gümrük masrafları dahil mi bilemedim
bankası alman bankası commerzbank
vade farkı var mı bilmiyorum sormak lazım
acil cevap lazım yarına kadar dönmemiz gerekiyo
ah bi de euro mu dolar mı net söylemedi galiba euro ama teyit edelim
geçen seferki gibi sorun olmasın
hadi kolay gelsin`,
  },
  {
    id: 'test-5',
    title: 'Invoice PDF Simulation',
    description: 'Simulated invoice text extracted from a PDF',
    content: `INVOICE

Invoice No: INV-2026-0847
Date: May 15, 2026
Due Date: June 14, 2026

From:
TechParts Industrial Supply Co.
1234 Industrial Blvd, Suite 500
Chicago, IL 60601, USA
Tax ID: US-87-1234567

Bill To:
Yılmaz Enerji A.Ş.
Atatürk Mah. Sanayi Cad. No:45
Gebze, Kocaeli 41400
Turkey
Tax ID: TR-1234567890

Items:
1. Industrial Transformer (500kVA) - Qty: 3 - Unit: $12,500.00 - Total: $37,500.00
2. Circuit Breaker Panel (400A) - Qty: 10 - Unit: $1,850.00 - Total: $18,500.00
3. Copper Busbar (2m) - Qty: 50 - Unit: $340.00 - Total: $17,000.00
4. Installation Kit - Qty: 3 - Unit: $2,200.00 - Total: $6,600.00

Subtotal: $79,600.00
Shipping & Insurance (CIF Istanbul): $4,200.00
Total: $83,800.00

Payment Terms: Net 30
Payment Method: Wire Transfer

Bank Details:
Bank: JPMorgan Chase
Account: TechParts Industrial Supply Co.
Account No: 4567890123
Routing: 021000021
SWIFT: CHASUS33

Notes:
- All items are certified per IEC 61936 standards
- Warranty: 24 months from delivery date
- Late payment penalty: 1.5% per month
- Delivery includes on-site inspection

Please reference invoice number INV-2026-0847 in your payment.`,
  },
];
