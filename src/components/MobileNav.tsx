'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Map, FileText, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: 'Home', icon: LayoutDashboard, exact: true },
    { href: '/queries', label: 'Leads', icon: Target },
    { href: '/tours', label: 'Tours', icon: Map },
    { href: '/proposals', label: 'Docs', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] z-50 md:hidden shadow-[0_-1px_15px_rgba(0,0,0,0.08)]">
      {tabs.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-4 transition-all duration-300 relative",
              isActive ? "text-primary scale-110" : "text-slate-400 active:scale-95"
            )}
          >
            <tab.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(30,58,138,0.5)]" />
            )}
          </Link>
        );
      })}
      
      <button
        onClick={onMenuClick}
        className="flex flex-col items-center gap-1 py-1 px-4 text-slate-400 active:scale-95 transition-all duration-300"
      >
        <Menu className="w-6 h-6 stroke-[2]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
      </button>
    </nav>
  );
}
