'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SESSION_KEY = 'streamkart-promo-dismissed';

export default function DemoPromoterBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 animate-in slide-in-from-bottom-6 zoom-in-95 duration-500 ease-out fill-mode-forwards"
      role="status"
      aria-live="polite"
    >
      <div className="relative rounded-2xl border border-white/[0.12] bg-slate-900/70 px-5 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Headline */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
          <h4 className="text-sm font-semibold text-white">
            Enjoying the demo?
          </h4>
        </div>

        {/* Body */}
        <p className="mt-1.5 pr-6 text-[13px] leading-relaxed text-slate-300">
          Get StreamKart CRM customized for your travel business — WhatsApp API,
          PDF itineraries, B2B portal &amp; more.
        </p>

        {/* Buttons */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="h-8 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-emerald-500 active:scale-95"
          >
            <a
              href="https://wa.me/917004283531?text=Hi!%20I%20tried%20the%20StreamKart%20TravelCRM%20demo%20and%20I%E2%80%99d%20like%20to%20know%20more."
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-slate-600 bg-transparent px-4 text-xs font-semibold text-slate-200 transition-transform hover:bg-white/10 active:scale-95"
          >
            <a
              href="mailto:support@streamkart.shop?subject=StreamKart%20CRM%20Demo%20Request"
              target="_blank"
              rel="noopener noreferrer"
            >
              Schedule Demo
            </a>
          </Button>
        </div>

        {/* Inline contact */}
        <p className="mt-2.5 text-[11px] text-slate-500">
          📧 support@streamkart.shop &nbsp;|&nbsp; 📞 +91 70042 83531
        </p>
      </div>
    </div>
  );
}
