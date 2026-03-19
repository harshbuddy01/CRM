'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  FileText, 
  CreditCard,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const links = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/queries', label: 'Queries (Leads)', icon: Target, show: true },
    { href: '/tours', label: 'Tours & Ops', icon: Map, show: user?.permissions['tour.view_all'] || user?.permissions['tour.view_assigned'] },
    { href: '/proposals', label: 'Proposals', icon: FileText, show: true },
    { href: '/payments', label: 'Payments', icon: CreditCard, show: user?.permissions['payment.view_all'] || user?.permissions['payment.view_assigned'] },
    { href: '/users', label: 'Team', icon: Users, show: user?.permissions['users.view'] },
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
      <div className="p-4 border-t text-xs text-muted-foreground">
        Role: <span className="font-semibold text-foreground">{user?.roleLabel || 'Loading...'}</span>
      </div>
    </aside>
  );
}
