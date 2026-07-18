'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { MobileNav } from '@/components/MobileNav';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { ChatbotDrawer } from '@/components/ChatbotDrawer';
import WhatsappSimulator from '@/components/WhatsappSimulator';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Wait for Zustand hydration before rendering to avoid SSR/client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Strict client-side route guard: if hydration is done and user/token is missing, redirect immediately.
  useEffect(() => {
    if (isMounted && (!user || !accessToken)) {
      logout(); // Clear stale cookies to prevent server-side middleware redirect loop
      router.replace('/login');
    }
  }, [isMounted, user, accessToken, router, logout]);

  // Prevent hydration mismatch — show nothing until Zustand has hydrated.
  if (!isMounted) return null;

  // If user is not in Zustand store, render nothing (the useEffect above will redirect them)
  if (!user || !accessToken) return null;

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
      <ChatbotDrawer />
      <WhatsappSimulator />
    </div>
  );
}
