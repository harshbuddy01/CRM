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
  Sheet,
  CalendarRange,
  Image as ImageIcon,
  Compass,
  Activity,
  MessageSquare,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/ui-store';
import { X } from 'lucide-react';

interface SidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const IMMORTAL_EMAILS = [
  'anish629028@gmail.com',
  'harshbuddy01@gmail.com',
  'amanasha481@gmail.com'
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUiStore();
  
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
    { href: '/tours', label: 'Tours & Operations', icon: Map, show: user?.permissions['tour.view_all'] || user?.permissions['tour.view_assigned'] },
    { href: '/proposals', label: 'Proposals', icon: FileText, show: true },
    { href: '/whatsapp', label: 'WhatsApp Inbox', icon: MessageSquare, show: true },
    { href: '/marketing/broadcast', label: 'Broadcast', icon: Megaphone, show: user?.role === 'admin' },
    { href: '/itineraries', label: 'Itineraries', icon: CalendarRange, show: true },
    { href: '/payments', label: 'Payment Ledger', icon: CreditCard, show: user?.role === 'admin' || user?.permissions['payment.view_all'] || user?.permissions['payment.view_assigned'] },
    { href: '/reports/lead-funnel', label: 'Reports', icon: BarChart3, show: user?.permissions['query.view_all'] },
    { href: '/clients', label: 'Clients', icon: Contact, show: true },
    { href: '/agents', label: 'B2B Agents', icon: Briefcase, show: true },
    { href: '/masters-v2', label: 'Masters', icon: Database, show: user?.permissions['master.manage_destinations'] || user?.permissions['master.manage_hotels'] },
    { href: '/library', label: 'Library', icon: ImageIcon, show: true },
    // Sprint 8 & Admin
    { href: '/cms/website-content', label: 'Website Content', icon: Compass, show: user?.role === 'admin' || user?.permissions['master.manage_destinations'], isSetting: true },
    { href: '/cms/pages', label: 'Website CMS', icon: Globe, show: user?.role === 'admin' || user?.permissions['master.manage_destinations'], isSetting: true },
    { href: '/finance/expenses', label: 'Finance', icon: DollarSign, show: user?.role === 'admin' || user?.permissions['payment.view_all'], isSetting: true },
    { href: '/branches', label: 'Branches', icon: Building2, show: user?.permissions['users.manage'], isSetting: true },
    { href: '/integrations/sheets', label: 'Integrations (Coming Soon)', icon: Sheet, show: user?.permissions['users.manage'], isSetting: true },
    { href: '/users', label: 'Team', icon: Users, show: user?.permissions['users.manage'], isSetting: true },
    { href: '/activity', label: 'My Activity', icon: Activity, show: !user?.permissions['users.manage'], isSetting: true },
    { href: '/settings', label: 'Settings', icon: Settings, show: user?.role === 'admin', isSetting: true },
  ];

  const renderLink = (link: any) => {
    if (link.show === false) return null;
    const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
    return (
      <Link 
        key={link.href} 
        href={link.href} 
        data-tour-target={link.href}
        title={sidebarCollapsed ? link.label : undefined}
        onClick={() => setOpen?.(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium relative group", 
          sidebarCollapsed ? "md:justify-center md:px-2" : "",
          isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <link.icon className="w-4 h-4 shrink-0" />
        <span className={cn(sidebarCollapsed ? "md:hidden" : "")}>{link.label}</span>
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
          "fixed inset-y-0 left-0 border-r bg-white z-[70] transform transition-all duration-300 ease-in-out md:translate-x-0 flex flex-col h-screen",
          sidebarCollapsed ? "w-64 md:w-16" : "w-64",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label="Navigation Sidebar"
      >
        <div className={cn(
          "h-14 flex items-center border-b px-4 font-bold text-lg bg-slate-50 transition-all",
          sidebarCollapsed ? "md:justify-center md:px-2" : "justify-between px-6"
        )}>
          {sidebarCollapsed ? (
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex p-2 hover:bg-slate-200/70 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-slate-700" />
            </button>
          ) : (
            <>
              <span>TravelCRM ✈️</span>
              <button
                onClick={toggleSidebarCollapsed}
                className="hidden md:flex p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Collapse Sidebar (Big Screen)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
          <span className="md:hidden">TravelCRM ✈️</span>

          <button 
            onClick={() => setOpen?.(false)} 
            className="md:hidden p-1 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className={cn(
          "flex-1 overflow-y-auto py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 transition-all",
          sidebarCollapsed ? "px-2" : "px-4"
        )}>
          {links.filter(l => !l.isSetting).map(renderLink)}
          
          {links.some(l => l.isSetting && l.show !== false) && (
            <div className={cn("pt-6 pb-2", sidebarCollapsed ? "md:pt-3 md:pb-1 text-center" : "")}>
              {sidebarCollapsed ? (
                <div className="hidden md:block w-6 h-[1px] bg-slate-200 mx-auto" />
              ) : (
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administration</p>
              )}
              <p className="md:hidden px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administration</p>
            </div>
          )}
          
          {links.filter(l => l.isSetting).map(renderLink)}
        </nav>

        <div className={cn("p-4 border-t bg-slate-50/50 transition-all", sidebarCollapsed ? "md:p-2" : "")}>
          <Link
            href="/profile"
            onClick={() => setOpen?.(false)}
            title={user?.name || 'Profile'}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              sidebarCollapsed ? "md:justify-center md:px-0" : "",
              pathname === '/profile'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4 shrink-0" />
            <div className={cn("flex flex-col", sidebarCollapsed ? "md:hidden" : "")}>
              <span className="text-xs font-semibold truncate w-32">{user?.name || 'Profile'}</span>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight",
                IMMORTAL_EMAILS.some(e => e.toLowerCase() === user?.email?.toLowerCase().trim()) 
                  ? "text-purple-600" 
                  : "opacity-70"
              )}>
                {IMMORTAL_EMAILS.some(e => e.toLowerCase() === user?.email?.toLowerCase().trim()) ? 'System Owner' : (user?.roleLabel || '')}
              </span>
            </div>
          </Link>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            title="Logout"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium mt-1 w-full text-red-500 hover:bg-red-50",
              sidebarCollapsed ? "md:justify-center md:px-0" : ""
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={cn(sidebarCollapsed ? "md:hidden" : "")}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
