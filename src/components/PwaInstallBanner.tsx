'use client';

import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other' | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if dismissed in this session
    let dismissed = null;
    try {
      dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    } catch (e) {
      // In private browsing or restricted environments, sessionStorage might throw
    }
    if (dismissed) return;

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    // Show after a delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem('pwa-banner-dismissed', 'true');
    } catch (e) {
      // Ignore storage errors
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:hidden">
      <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5 duration-500">
        <button 
          onClick={dismiss} 
          className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-xl shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-sm">Install TravelCRM App</h3>
            <p className="text-[11px] opacity-90 leading-tight mt-1">
              {platform === 'ios' 
                ? "Tap the Share icon below and then 'Add to Home Screen' for a seamless app experience."
                : "Add to your home screen for fast access and native-like performance."}
            </p>
          </div>
        </div>

        {platform === 'ios' ? (
          <div className="mt-4 flex items-center justify-center gap-4 py-2.5 px-3 bg-white/10 rounded-xl border border-white/5 shadow-inner">
            <div className="flex flex-col items-center gap-1">
              <Share className="w-5 h-5 text-sky-300" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Share</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <PlusSquare className="w-5 h-5 text-emerald-300" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white">Add to Home</span>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full mt-4 bg-white text-primary hover:bg-slate-100 font-bold rounded-xl shadow-lg h-10"
            onClick={dismiss}
          >
            Got It
          </Button>
        )}
      </div>
    </div>
  );
}
