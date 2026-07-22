'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Play, Pause, ChevronRight, ChevronLeft, X, CheckCircle2, 
  LayoutDashboard, Users, FileText, Zap, CreditCard, Compass, Settings, Database, BarChart3, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  id: number;
  title: string;
  badge: string;
  targetPath: string;
  sidebarLabel: string;
  subtitle: string;
  description: string;
  howToUse: string;
  icon: any;
}

const CLEAN_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Overview & Business Analytics',
    badge: '1 OF 8 • OVERVIEW',
    targetPath: '/',
    sidebarLabel: 'Overview',
    subtitle: 'Real-time Agency Command Center',
    description: 'Track monthly lead volume, active pipeline revenue, conversion velocity, and quick action shortcuts.',
    howToUse: 'Use this dashboard every morning to monitor team performance and access quick 1-click lead/proposal shortcuts.',
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: 'Kanban Lead Pipeline',
    badge: '2 OF 8 • PIPELINE',
    targetPath: '/pipeline',
    sidebarLabel: 'Pipeline',
    subtitle: 'Visual Drag-and-Drop Deal Tracking',
    description: 'Enquiries from Facebook, Google & WhatsApp land here automatically with auto round-robin assignment.',
    howToUse: 'Drag and drop lead cards across stages (New → Contacted → Proposal Sent → Won) as deals progress.',
    icon: Users,
  },
  {
    id: 3,
    title: 'Lead Management & Queries',
    badge: '3 OF 8 • LEADS LIST',
    targetPath: '/queries',
    sidebarLabel: 'Leads List',
    subtitle: 'Complete Client Interaction Log',
    description: 'View full client history, travel preferences, budget requirements, and communication logs in one place.',
    howToUse: 'Click on any client lead to view their notes, update status, or click "Create Proposal" to start an itinerary.',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Itinerary & Photo Proposal Builder',
    badge: '4 OF 8 • ITINERARIES',
    targetPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    subtitle: '15-Second Multi-Day Proposals',
    description: 'Build day-by-day travel plans with hotel photos, day-wise sightseeing, flights, cabs, and pricing.',
    howToUse: 'Select hotel photos from library, set day-wise activities, auto-calculate totals, and export branded PDF proposals.',
    icon: Compass,
  },
  {
    id: 5,
    title: 'Hotel, Destination & Tariff Masters',
    badge: '5 OF 8 • MASTERS',
    targetPath: '/masters-v2',
    sidebarLabel: 'Masters',
    subtitle: 'Central Inventory & Photo Library',
    description: 'Centralized database for contracted hotel rates, room categories, transport tariffs, and high-res property photos.',
    howToUse: 'Add contracted hotel rates and upload hotel photos to your master library for instant 1-click proposal reuse.',
    icon: Database,
  },
  {
    id: 6,
    title: 'Sales Reports & Analytics',
    badge: '6 OF 8 • REPORTS',
    targetPath: '/reports/lead-funnel',
    sidebarLabel: 'Reports',
    subtitle: 'Conversion Funnel & Revenue Insights',
    description: 'Comprehensive analytics on sales rep conversion rates, lead funnel bottlenecks, and monthly collections.',
    howToUse: 'Analyze which marketing channels (Google/Meta/WhatsApp) deliver highest ROI and track rep closure rates.',
    icon: BarChart3,
  },
  {
    id: 7,
    title: 'Invoices, GST & Online Payments',
    badge: '7 OF 8 • FINANCE',
    targetPath: '/finance/invoices',
    sidebarLabel: 'Finance',
    subtitle: 'Tax Invoicing & Razorpay Collection',
    description: 'Generate GST and TCS compliant tax invoices and send Razorpay / UPI online payment links directly.',
    howToUse: 'Click "Create Invoice" to generate tax-compliant bills, track part-payments, and auto-send WhatsApp receipts.',
    icon: CreditCard,
  },
  {
    id: 8,
    title: 'Company Settings & White-Label Setup',
    badge: '8 OF 8 • SETTINGS',
    targetPath: '/settings',
    sidebarLabel: 'Settings',
    subtitle: 'Branding & Meta WhatsApp API Keys',
    description: 'Upload your agency logo, set GST/PAN details, configure email signatures, and connect Meta WhatsApp API keys.',
    howToUse: 'Customize company profile info so all exported PDFs and client links display your agency brand.',
    icon: Settings,
  },
];

export default function InteractiveDemoTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasDismissedHeader, setHasDismissedHeader] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = CLEAN_STEPS[currentStepIdx];

  // Highlight active sidebar item
  useEffect(() => {
    if (!isActive) return;
    const elements = document.querySelectorAll('[data-tour-target]');
    elements.forEach((el) => {
      const target = el.getAttribute('data-tour-target');
      if (target === step.targetPath) {
        el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-1', 'bg-emerald-50', 'text-emerald-700', 'font-bold');
      } else {
        el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-1', 'bg-emerald-50', 'text-emerald-700', 'font-bold');
      }
    });
  }, [isActive, currentStepIdx, step]);

  // Auto-play timer (8 seconds per page)
  useEffect(() => {
    if (isPlaying && isActive) {
      timerRef.current = setTimeout(() => {
        if (currentStepIdx < CLEAN_STEPS.length - 1) {
          handleGoToStep(currentStepIdx + 1);
        } else {
          setIsPlaying(false);
        }
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isActive, currentStepIdx]);

  const handleStartTour = () => {
    setIsActive(true);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    navigateToStep(0);
  };

  const navigateToStep = (idx: number) => {
    const s = CLEAN_STEPS[idx];
    if (s.targetPath && pathname !== s.targetPath) {
      router.push(s.targetPath);
    }
  };

  const handleGoToStep = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= CLEAN_STEPS.length) return;
    setCurrentStepIdx(newIdx);
    navigateToStep(newIdx);
  };

  const handleEndTour = () => {
    setIsActive(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Cleanup highlighted rings
    const elements = document.querySelectorAll('[data-tour-target]');
    elements.forEach((el) => {
      el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-1', 'bg-emerald-50', 'text-emerald-700', 'font-bold');
    });
  };

  return (
    <>
      {/* 🌟 Top Floating Header Banner (Sleek, Minimalist) */}
      {!isActive && !hasDismissedHeader && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-30 max-w-md w-[92%] md:w-auto bg-slate-900/95 text-white backdrop-blur-xl border border-slate-800 rounded-full shadow-2xl p-1.5 px-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <div className="text-xs font-medium">
              <span className="font-bold text-slate-100">Interactive Walkthrough: </span>
              <span className="text-slate-300">Guided tour of CRM modules</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleStartTour}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-3.5 rounded-full shadow-md gap-1.5"
            >
              <Play className="h-3 w-3 fill-current" />
              Start Tour
            </Button>
            <button
              onClick={() => setHasDismissedHeader(true)}
              className="text-slate-400 hover:text-white p-1 rounded-full"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 🎬 Professional Floating Tour Tooltip Box (Positioned Top-Left next to Sidebar - ZERO WhatsApp overlap) */}
      {isActive && (
        <div className="fixed top-20 left-4 md:left-72 z-30 w-[92%] max-w-sm bg-slate-900/95 text-slate-100 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-4 animate-in slide-in-from-top-4 duration-300 select-none">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${((currentStepIdx + 1) / CLEAN_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Header Badge & Close */}
          <div className="flex items-center justify-between mb-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {step.badge}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleEndTour}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                title="Close (X)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">{step.title}</h3>
                <span className="text-[10px] text-emerald-400 font-medium">Sidebar → {step.sidebarLabel}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* How To Use Box */}
          <div className="my-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-200 leading-relaxed">
            <span className="text-emerald-400 font-bold block mb-0.5">💡 How to use this page:</span>
            {step.howToUse}
          </div>

          {/* Final Step CTA */}
          {currentStepIdx === CLEAN_STEPS.length - 1 ? (
            <div className="space-y-1.5 pt-1">
              <a
                href="https://wa.me/917004283531?text=Hi!%20I%20completed%20the%20StreamKart%20CRM%20walkthrough%20and%20want%20to%20discuss%20building%20a%20custom%20CRM."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Chat on WhatsApp (+91 70042 83531)
              </a>
              <button
                onClick={handleEndTour}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1"
              >
                Close Walkthrough
              </button>
            </div>
          ) : (
            /* Navigation Controls */
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleGoToStep(currentStepIdx - 1)}
                  disabled={currentStepIdx === 0}
                  variant="outline"
                  className="h-7 px-2.5 text-[11px] bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3 w-3 mr-0.5" /> Prev
                </Button>

                <button
                  onClick={handleEndTour}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                >
                  Skip
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center gap-1">
                {CLEAN_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleGoToStep(i)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === currentStepIdx ? "w-4 bg-emerald-500" : "bg-slate-700"
                    )}
                  />
                ))}
              </div>

              <Button
                onClick={() => handleGoToStep(currentStepIdx + 1)}
                className="h-7 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Next <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          )}

        </div>
      )}
    </>
  );
}
