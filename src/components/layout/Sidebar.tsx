'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Logo from '@/components/ui/Logo';
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  BarChart3,
  X,
  Moon,
  Sun,
  MessageCircle,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const lang = useStore((s) => s.settings.language);
  const darkMode = useStore((s) => s.settings.darkMode);
  const updateSettings = useStore((s) => s.updateSettings);
  const invoices = useStore((s) => s.invoices);

  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  // Focused core: capture invoices, manage them, simple overview. The parked
  // items below still work as routes — just hidden from nav to keep it simple.
  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard', lang), icon: LayoutDashboard, badge: 0 },
    { href: '/invoices', label: t('nav.invoices', lang), icon: Receipt, badge: overdueCount },
    // PARKED — { href: '/orders', label: t('nav.orders', lang), icon: ShoppingCart, badge: 0 },
    // PARKED — { href: '/suppliers', label: t('nav.suppliers', lang), icon: Truck, badge: 0 },
    // PARKED — { href: '/customers', label: t('nav.customers', lang), icon: Users, badge: 0 },
    { href: '/reports', label: t('nav.reports', lang), icon: BarChart3, badge: 0 },
    // PARKED — { href: '/ai', label: t('nav.ai', lang), icon: Bot, badge: 0 },
    { href: '/settings', label: t('nav.settings', lang), icon: Settings, badge: 0 },
  ];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center px-4 border-b border-gray-200/80 gap-2">
        <div className="flex-1 min-w-0">
          <Logo size="text-lg" className="block leading-tight" />
          <span className="text-[10px] text-gray-400 block truncate">
            {t('nav.appTagline', lang)}
          </span>
        </div>
        {/* Mobile close button */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="md:hidden text-gray-400 hover:text-gray-600 shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'bg-violet-50 text-violet-700 font-medium shadow-sm shadow-violet-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-violet-600' : ''}`} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse-soft">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-3 border-t border-gray-200/80 space-y-1">
        <button
          onClick={() => updateSettings({ darkMode: !darkMode })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{darkMode ? (lang === 'tr' ? 'Acik Tema' : 'Light Mode') : (lang === 'tr' ? 'Karanlik Tema' : 'Dark Mode')}</span>
        </button>
        <button
          onClick={() => updateSettings({ language: lang === 'tr' ? 'en' : 'tr' })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{lang === 'tr' ? 'TR' : 'EN'} → {lang === 'tr' ? 'English' : 'Türkçe'}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200/80 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-xl md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
