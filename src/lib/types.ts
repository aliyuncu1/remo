// ==================== CORE ENUMS ====================

export type Language = 'auto' | 'tr' | 'en';
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'e-fatura' | 'e-arsiv' | 'standard';
export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
export type OrderType = 'purchase' | 'sales';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'other';

export type AnalysisType =
  | 'auto' | 'supplier_offer' | 'invoice' | 'logistics'
  | 'procurement' | 'finance' | 'customer_message' | 'general';

export type WorkflowStatus =
  | 'new' | 'needs_review' | 'missing_info' | 'high_risk' | 'ready_to_reply' | 'completed';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';

// ==================== BUSINESS ENTITIES ====================

export interface Company {
  id: string;
  name: string;
  taxId: string; // Vergi No
  taxOffice: string; // Vergi Dairesi
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  iban?: string;
  bankName?: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Supplier extends Company {
  type: 'supplier';
  category: string;
  totalOrders: number;
  totalSpent: number;
  currency: Currency;
  rating: number; // 1-5
  lastOrderDate?: string;
}

export interface Customer extends Company {
  type: 'customer';
  sector: string;
  totalOrders: number;
  totalRevenue: number;
  currency: Currency;
  lastOrderDate?: string;
}

// ==================== INVOICES (e-Fatura) ====================

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string; // adet, kg, m, etc.
  unitPrice: number;
  vatRate: number; // 1, 10, 20 (%)
  vatAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  type: InvoiceType;
  status: InvoiceStatus;
  direction: 'incoming' | 'outgoing';
  issueDate: string;
  dueDate: string;
  paidDate?: string;

  // Parties
  fromCompany: string; // company name
  fromTaxId: string;
  toCompany: string;
  toTaxId: string;
  toAddress: string;

  // Items
  items: InvoiceItem[];
  subtotal: number;
  totalVat: number;
  totalAmount: number;
  currency: Currency;

  // e-Fatura fields
  eFaturaId?: string; // GIB UUID
  eFaturaStatus?: 'pending' | 'sent' | 'accepted' | 'rejected';
  ettn?: string; // Elektronik Temel Tanımlayıcı Numara

  // Payment
  paymentMethod?: PaymentMethod;
  bankName?: string;
  iban?: string;

  notes?: string;
  createdAt: string;
}

// ==================== ORDERS ====================

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  counterparty: string; // supplier or customer name
  counterpartyId: string;

  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  currency: Currency;

  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  incoterms?: string;

  linkedInvoiceId?: string;
  notes?: string;
  createdAt: string;
}

// ==================== AI ANALYSIS ====================

export interface Risk {
  severity: RiskSeverity;
  riskTitle: string;
  explanation: string;
  recommendedAction: string;
}

export interface ActionItem {
  task: string;
  ownerSuggestion: string;
  urgency: Urgency;
  suggestedDeadline: string;
  missingInputNeeded: string;
}

export interface KeyInformation {
  companyName: string;
  supplierOrCustomer: string;
  contactPerson: string;
  productOrService: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  currency: string;
  vatOrTax: string;
  deliveryDate: string;
  deliveryTerms: string;
  paymentTerms: string;
  invoiceNumber: string;
  offerNumber: string;
  dueDate: string;
  bankDetails: string;
  countryOrCity: string;
  incoterms: string;
  contractOrPenaltyTerms: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  status: WorkflowStatus;
  sourceType: 'upload' | 'email' | 'paste';
  fileName?: string;
  detectedLanguage: string;
  documentType: string;
  confidenceScore: number;
  executiveSummary: string;
  keyInformation: KeyInformation;
  uncertainFields: string[];
  missingInformation: string[];
  risks: Risk[];
  actionItems: ActionItem[];
  professionalReplyDraft: string;
  csvRows: Record<string, string>[];
  rawExtractedText: string;
}

// ==================== DASHBOARD ====================

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  overdueInvoices: number;
  pendingOrders: number;
  activeSuppliers: number;
  activeCustomers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'invoice' | 'order' | 'payment' | 'analysis' | 'supplier' | 'customer';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  currency?: Currency;
}

// ==================== APP STATE ====================

export interface AppSettings {
  language: 'tr' | 'en';
  outputLanguage: Language;
  apiProvider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  companyName: string;
  companyTaxId: string;
  companyTaxOffice: string;
  currency: Currency;
  onboardingComplete: boolean;
  darkMode: boolean;
}

export interface InboxConnection {
  provider: 'gmail' | 'outlook';
  email: string;
  connected: boolean;
  lastSync?: string;
  monitoringEnabled: boolean;
  filters: InboxFilter;
}

export interface InboxFilter {
  onlyWithAttachments: boolean;
  keywords: string[];
  selectedSuppliers: string[];
}

// ==================== GMAIL INTEGRATION ====================

export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp ms
  email: string;
}

export interface GmailAttachment {
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  subject: string;
  from: string;
  date: string;
}

export interface GmailImportedInvoice {
  id: string; // temporary ID for review
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  fileName: string;
  parsedData: {
    invoiceNumber: string;
    fromCompany: string;
    toCompany: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    totalVat: number;
    totalAmount: number;
    currency: Currency;
    type: InvoiceType;
    items: InvoiceItem[];
    notes: string;
  };
  rawText: string;
  selected: boolean;
}
