'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const reportTabs = [
  { href: '/reports/lead-funnel', label: 'Lead Funnel' },
  { href: '/reports/sales', label: 'Sales' },
  { href: '/reports/collections', label: 'Collections' },
  { href: '/reports/tours', label: 'Tours' },
  { href: '/reports/marketing', label: 'Marketing' },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Report Sub-Navigation Tabs */}
      <div className="border-b">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {reportTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                pathname === tab.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      {children}
    </div>
  );
}
