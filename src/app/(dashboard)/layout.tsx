'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { MobileNav } from '@/components/MobileNav';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Wait for Zustand hydration before rendering to avoid SSR/client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch — show nothing until Zustand has hydrated.
  // Route protection is handled entirely by middleware.ts (server-side).
  if (!isMounted) return null;

  // If user is not in Zustand store (e.g. after logout), render nothing.
  // Middleware will redirect to /login on the next navigation.
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={cn("flex-1 flex flex-col md:ml-64 transition-all pb-24 md:pb-0")}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
      <MobileNav onMenuClick={() => setSidebarOpen(true)} />
      <PwaInstallBanner />
    </div>
  );
}
