import { create } from 'zustand';
import type { AnalysisResult, AppSettings, Invoice, Order, Supplier, Customer, ActivityItem, DashboardStats, GmailTokens } from './types';
import { demoInvoices, demoOrders, demoSuppliers, demoCustomers, demoActivities } from './demo-data';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

interface AppStore {
  // Data
  invoices: Invoice[];
  orders: Order[];
  suppliers: Supplier[];
  customers: Customer[];
  activities: ActivityItem[];
  analyses: AnalysisResult[];
  settings: AppSettings;
  initialized: boolean;
  demoLoaded: boolean;

  // Gmail
  gmailConnected: boolean;
  gmailTokens: GmailTokens | null;
  gmailLastSync: string | null;

  // Init
  init: () => void;
  loadDemoData: () => void;
  clearAllData: () => void;

  // Analyses
  addAnalysis: (result: AnalysisResult) => void;
  updateAnalysisStatus: (id: string, status: AnalysisResult['status']) => void;
  deleteAnalysis: (id: string) => void;

  // Invoices
  addInvoice: (invoice: Invoice) => void;
  addInvoices: (invoices: Invoice[]) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;

  // Gmail
  setGmailTokens: (tokens: GmailTokens) => void;
  disconnectGmail: () => void;
  setGmailLastSync: (date: string) => void;

  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Stats
  getStats: () => DashboardStats;
}

const defaultSettings: AppSettings = {
  language: 'tr',
  outputLanguage: 'auto',
  apiProvider: 'anthropic',
  apiKey: '',
  companyName: '',
  companyTaxId: '',
  companyTaxOffice: '',
  currency: 'TRY',
  onboardingComplete: false,
  darkMode: false,
};

export const useStore = create<AppStore>((set, get) => ({
  invoices: [],
  orders: [],
  suppliers: [],
  customers: [],
  activities: [],
  analyses: [],
  settings: defaultSettings,
  initialized: false,
  demoLoaded: false,
  gmailConnected: false,
  gmailTokens: null,
  gmailLastSync: null,

  init: () => {
    if (get().initialized) return;
    const settings = loadFromStorage('sme_settings', defaultSettings);
    const demoLoaded = loadFromStorage('sme_demo_loaded', false);
    const invoices = loadFromStorage<Invoice[]>('sme_invoices', []);
    const orders = loadFromStorage<Order[]>('sme_orders', []);
    const suppliers = loadFromStorage<Supplier[]>('sme_suppliers', []);
    const customers = loadFromStorage<Customer[]>('sme_customers', []);
    const activities = loadFromStorage<ActivityItem[]>('sme_activities', []);
    const analyses = loadFromStorage<AnalysisResult[]>('sme_analyses', []);
    const gmailTokens = loadFromStorage<GmailTokens | null>('sme_gmail_tokens', null);
    const gmailLastSync = loadFromStorage<string | null>('sme_gmail_last_sync', null);

    if (!demoLoaded) {
      saveToStorage('sme_invoices', demoInvoices);
      saveToStorage('sme_orders', demoOrders);
      saveToStorage('sme_suppliers', demoSuppliers);
      saveToStorage('sme_customers', demoCustomers);
      saveToStorage('sme_activities', demoActivities);
      saveToStorage('sme_demo_loaded', true);
      set({
        invoices: demoInvoices,
        orders: demoOrders,
        suppliers: demoSuppliers,
        customers: demoCustomers,
        activities: demoActivities,
        analyses,
        settings,
        gmailTokens,
        gmailConnected: !!gmailTokens,
        gmailLastSync,
        initialized: true,
        demoLoaded: true,
      });
    } else {
      set({
        invoices,
        orders,
        suppliers,
        customers,
        activities,
        analyses,
        settings,
        gmailTokens,
        gmailConnected: !!gmailTokens,
        gmailLastSync,
        initialized: true,
        demoLoaded: true,
      });
    }
  },

  loadDemoData: () => {
    saveToStorage('sme_invoices', demoInvoices);
    saveToStorage('sme_orders', demoOrders);
    saveToStorage('sme_suppliers', demoSuppliers);
    saveToStorage('sme_customers', demoCustomers);
    saveToStorage('sme_activities', demoActivities);
    saveToStorage('sme_demo_loaded', true);
    set({
      invoices: demoInvoices,
      orders: demoOrders,
      suppliers: demoSuppliers,
      customers: demoCustomers,
      activities: demoActivities,
      demoLoaded: true,
    });
  },

  clearAllData: () => {
    saveToStorage('sme_invoices', []);
    saveToStorage('sme_orders', []);
    saveToStorage('sme_suppliers', []);
    saveToStorage('sme_customers', []);
    saveToStorage('sme_activities', []);
    saveToStorage('sme_analyses', []);
    // Keep demoLoaded true so init() doesn't repopulate demo data on next load.
    saveToStorage('sme_demo_loaded', true);
    set({
      invoices: [],
      orders: [],
      suppliers: [],
      customers: [],
      activities: [],
      analyses: [],
      demoLoaded: true,
    });
  },

  addAnalysis: (result) => {
    const updated = [result, ...get().analyses];
    saveToStorage('sme_analyses', updated);
    set({ analyses: updated });
  },

  updateAnalysisStatus: (id, status) => {
    const updated = get().analyses.map((a) => (a.id === id ? { ...a, status } : a));
    saveToStorage('sme_analyses', updated);
    set({ analyses: updated });
  },

  deleteAnalysis: (id) => {
    const updated = get().analyses.filter((a) => a.id !== id);
    saveToStorage('sme_analyses', updated);
    set({ analyses: updated });
  },

  addInvoice: (invoice) => {
    const updated = [invoice, ...get().invoices];
    saveToStorage('sme_invoices', updated);
    set({ invoices: updated });
  },

  addInvoices: (newInvoices) => {
    const updated = [...newInvoices, ...get().invoices];
    saveToStorage('sme_invoices', updated);
    set({ invoices: updated });
  },

  updateInvoiceStatus: (id, status) => {
    const updated = get().invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv));
    saveToStorage('sme_invoices', updated);
    set({ invoices: updated });
  },

  setGmailTokens: (tokens) => {
    saveToStorage('sme_gmail_tokens', tokens);
    set({ gmailTokens: tokens, gmailConnected: true });
  },

  disconnectGmail: () => {
    saveToStorage('sme_gmail_tokens', null);
    saveToStorage('sme_gmail_last_sync', null);
    set({ gmailTokens: null, gmailConnected: false, gmailLastSync: null });
  },

  setGmailLastSync: (date) => {
    saveToStorage('sme_gmail_last_sync', date);
    set({ gmailLastSync: date });
  },

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    saveToStorage('sme_settings', updated);
    set({ settings: updated });
  },

  getStats: () => {
    const { invoices, orders, suppliers, customers, activities } = get();

    const outgoing = invoices.filter((i) => i.direction === 'outgoing');
    const incoming = invoices.filter((i) => i.direction === 'incoming');

    const totalRevenue = outgoing
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const totalExpenses = incoming
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const outstandingReceivables = outgoing
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const outstandingPayables = incoming
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalRevenue,
      totalExpenses,
      outstandingReceivables,
      outstandingPayables,
      overdueInvoices: invoices.filter((i) => i.status === 'overdue').length,
      pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
      activeSuppliers: suppliers.length,
      activeCustomers: customers.length,
      recentActivity: activities.slice(0, 10),
    };
  },
}));
