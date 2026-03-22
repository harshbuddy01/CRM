'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { 
  LayoutDashboard, 
  User,
  Users, 
  Map, 
  FileText, 
  CreditCard,
  Target,
  Columns,
  Database,
  MapPin,
  Navigation,
  BarChart3,
  Settings,
  Contact,
  Briefcase,
  LogOut,
  Globe,
  DollarSign,
  Building2,
  Sheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen?.(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const links = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/pipeline', label: 'Pipeline', icon: Columns, show: true },
    { href: '/queries', label: 'Leads List', icon: Target, show: true },
    { href: '/tours', label: 'Tours List', icon: Map, show: user?.permissions['tour.view_all'] || user?.permissions['tour.view_assigned'] },
    { href: '/tours/ops', label: 'Operations', icon: MapPin, show: user?.permissions['tour.view_all'] },
    { href: '/tours/field', label: 'Field Agent', icon: Navigation, show: user?.permissions['tour.view_assigned'] },
    { href: '/proposals', label: 'Proposals', icon: FileText, show: true },
    { href: '/payments', label: 'Payment Ledger', icon: CreditCard, show: user?.role === 'admin' || user?.permissions['payment.view_all'] || user?.permissions['payment.view_assigned'] },
    { href: '/reports/lead-funnel', label: 'Reports', icon: BarChart3, show: user?.permissions['query.view_all'] },
    { href: '/clients', label: 'Clients', icon: Contact, show: true },
    { href: '/agents', label: 'B2B Agents', icon: Briefcase, show: true },
    { href: '/masters-v2', label: 'Masters', icon: Database, show: user?.permissions['master.manage_destinations'] || user?.permissions['master.manage_hotels'] },
    // Sprint 8 & Admin
    { href: '/cms/pages', label: 'Website CMS', icon: Globe, show: user?.role === 'admin' || user?.permissions['master.manage_destinations'], isSetting: true },
    { href: '/finance/expenses', label: 'Finance', icon: DollarSign, show: user?.role === 'admin' || user?.permissions['payment.view_all'], isSetting: true },
    { href: '/branches', label: 'Branches', icon: Building2, show: user?.permissions['users.manage'], isSetting: true },
    { href: '/integrations/sheets', label: 'Integrations (Coming Soon)', icon: Sheet, show: user?.permissions['users.manage'], isSetting: true },
    { href: '/users', label: 'Team', icon: Users, show: user?.permissions['users.manage'], isSetting: true },
    { href: '/settings', label: 'Settings', icon: Settings, show: user?.role === 'admin', isSetting: true },
  ];

  const renderLink = (link: any) => {
    if (link.show === false) return null;
    const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
    return (
      <Link 
        key={link.href} 
        href={link.href} 
        onClick={() => setOpen?.(false)}
        className={cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium", isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground hover:text-foreground")}
      >
        <link.icon className="w-4 h-4" />{link.label}
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden transition-all duration-300"
          onClick={() => setOpen?.(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-64 border-r bg-white z-[70] transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col h-screen",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label="Navigation Sidebar"
      >
        <div className="h-14 flex items-center justify-between border-b px-6 font-bold text-lg bg-slate-50">
          <span>TravelCRM ✈️</span>
          <button 
            onClick={() => setOpen?.(false)} 
            className="md:hidden p-1 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          {links.filter(l => !l.isSetting).map(renderLink)}
          
          {links.some(l => l.isSetting && l.show !== false) && (
            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administration</p>
            </div>
          )}
          
          {links.filter(l => l.isSetting).map(renderLink)}
        </nav>
        <div className="p-4 border-t bg-slate-50/50">
          <Link
            href="/profile"
            onClick={() => setOpen?.(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              pathname === '/profile'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold truncate w-32">{user?.name || 'Profile'}</span>
              <span className="text-[10px] opacity-70">{user?.roleLabel || ''}</span>
            </div>
          </Link>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium mt-1 w-full text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
