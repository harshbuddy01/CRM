'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

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
    { href: '/masters/destinations', label: 'Masters', icon: Database, show: user?.permissions['master.manage_destinations'] || user?.permissions['master.manage_hotels'] },
    { href: '/users', label: 'Team', icon: Users, show: user?.permissions['users.manage'] },
  ];

  return (
    <aside className="w-64 border-r bg-muted/20 hidden md:flex flex-col h-screen fixed">
      <div className="h-14 flex items-center border-b px-6 font-bold text-lg">
        TravelCRM ✈️
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {links.map((link) => {
          if (link.show === false) return null;
          
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
            pathname === '/profile'
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-xs">{user?.name || 'Profile'}</span>
            <span className="text-[10px] opacity-70">{user?.roleLabel || ''}</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
