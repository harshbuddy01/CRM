'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Play, Pause, ChevronRight, ChevronLeft, X, CheckCircle2, 
  MessageSquare, Compass, Settings, Database, ArrowRight, LayoutDashboard, Users, FileText, Zap, CreditCard, Sparkles
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
  bullets: string[];
  actionEvent?: { type: string; detail: any };
  icon: any;
}

const EXECUTIVE_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Dashboard Overview',
    badge: '1 OF 7 • OVERVIEW',
    targetPath: '/',
    sidebarLabel: 'Overview',
    subtitle: 'Real-time Agency Analytics',
    description: 'Centralized dashboard tracking monthly lead volume, active pipeline revenue, closure velocity, and team performance.',
    bullets: [
      'Live revenue & conversion analytics',
      'Instant shortcuts for new leads & itineraries',
    ],
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: 'Kanban Lead Pipeline',
    badge: '2 OF 7 • LEADS & PIPELINE',
    targetPath: '/pipeline',
    sidebarLabel: 'Pipeline',
    subtitle: 'Automated Lead Management',
    description: 'Inquiries from Facebook, Google & WhatsApp automatically route into your pipeline with automated sales rep assignment.',
    bullets: [
      'Round-robin lead auto-assignment',
      'Drag-and-drop Kanban status stages',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        text: '🔔 *NEW LEAD ASSIGNED*\n\nClient: Rahul Verma\nDestination: Maldives 4N/5D\nBudget: ₹2.2 Lakhs\nAssigned To: Senior Sales Rep',
        buttons: ['Trigger Auto WhatsApp Greeting', 'Generate Itinerary'],
      },
    },
    icon: Users,
  },
  {
    id: 3,
    title: 'Itinerary & Proposal Builder',
    badge: '3 OF 7 • PROPOSALS',
    targetPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    subtitle: '15-Second Multi-Day Proposals',
    description: 'Generate day-wise travel itineraries with auto-calculated hotel, flight, and transfer pricing in seconds.',
    bullets: [
      'Branded PDF export with company logo',
      'Interactive client web link with photo carousels',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        card: {
          type: 'proposal',
          title: '🌴 Bali Tropical Getaway (5D/4N)',
          subtitle: 'Client: Ankit & Riya Sharma',
          tag: 'PDF READY',
          badgeColor: 'bg-emerald-500',
          details: [
            { label: 'Hotel', value: 'The Seminyak Resort (5★)' },
            { label: 'Flights', value: 'IndiGo Direct (DEL - DPS)' },
            { label: 'Activities', value: 'Nusa Penida & Sunset Cruise' },
            { label: 'Total Price', value: '₹98,500 (Incl. 5% GST)' },
          ],
        },
        buttons: ['Send PDF to Client WhatsApp', 'Generate Invoice'],
      },
    },
    icon: FileText,
  },
  {
    id: 4,
    title: 'B2B Agent Portal',
    badge: '4 OF 7 • B2B NETWORK',
    targetPath: '/agents',
    sidebarLabel: 'B2B Agents',
    subtitle: 'Sub-Agent Wholesale Network',
    description: 'Empower B2B travel partners with dedicated logins to set custom markups, track commissions, and issue co-branded proposals.',
    bullets: [
      'Custom per-agent markup configurations',
      'Co-branded PDF proposals with agent branding',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        card: {
          type: 'b2b',
          title: 'B2B Partner: Royal Travels',
          subtitle: 'Agent ID: AGENT-902',
          tag: '10% MARKUP ACTIVE',
          badgeColor: 'bg-sky-500',
          details: [
            { label: 'Agent Name', value: 'Vikram Singh' },
            { label: 'Commission Tier', value: 'Gold Partner (10%)' },
            { label: 'Co-Branded PDF', value: 'Agent Logo Auto-Attached' },
            { label: 'Live Ledger', value: '₹45,000 Credit Limit' },
          ],
        },
        buttons: ['Bali Proposal Demo', 'View Pricing'],
      },
    },
    icon: Zap,
  },
  {
    id: 5,
    title: 'Masters Database',
    badge: '5 OF 7 • INVENTORY',
    targetPath: '/masters-v2',
    sidebarLabel: 'Masters',
    subtitle: 'Central Hotel & Rate Library',
    description: 'Store contracted hotel rates, transport tariffs, and sightseeing packages in a centralized database for instant proposal assembly.',
    bullets: [
      'Seasonal hotel contracted rates',
      'Pre-built sightseeing & activity database',
    ],
    icon: Database,
  },
  {
    id: 6,
    title: 'Invoices & Payments',
    badge: '6 OF 7 • FINANCE',
    targetPath: '/finance/invoices',
    sidebarLabel: 'Finance',
    subtitle: 'GST Billing & Instant Collection',
    description: 'Generate GST-compliant tax invoices and send Razorpay / UPI payment collection links directly to client WhatsApp.',
    bullets: [
      'GST & TCS compliant tax invoices',
      'Automated Razorpay & UPI payment links',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        card: {
          type: 'invoice',
          title: 'Tax Invoice #INV-2026-409',
          subtitle: 'StreamKart Travel Services',
          tag: 'PAID VIA RAZORPAY',
          badgeColor: 'bg-emerald-600',
          details: [
            { label: 'Package', value: 'Bali 5D/4N Package' },
            { label: 'Base Amount', value: '₹93,809' },
            { label: 'GST (5%)', value: '₹4,691' },
            { label: 'Total Paid', value: '₹98,500' },
          ],
        },
        buttons: ['Mark Payment Received', 'Pricing & Setup'],
      },
    },
    icon: CreditCard,
  },
  {
    id: 7,
    title: 'White-Label Settings',
    badge: '7 OF 7 • CONFIGURATION',
    targetPath: '/settings',
    sidebarLabel: 'Settings',
    subtitle: 'Custom Branding & API Keys',
    description: 'Upload your company logo, set GST credentials, configure email signatures, and connect Meta WhatsApp API keys.',
    bullets: [
      'Custom branding & white-label domain setup',
      'Meta WhatsApp Business API integration',
    ],
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

  const step = EXECUTIVE_STEPS[currentStepIdx];

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

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && isActive) {
      timerRef.current = setTimeout(() => {
        if (currentStepIdx < EXECUTIVE_STEPS.length - 1) {
          handleGoToStep(currentStepIdx + 1);
        } else {
          setIsPlaying(false);
        }
      }, 7500);
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
    const s = EXECUTIVE_STEPS[idx];
    if (s.targetPath && pathname !== s.targetPath) {
      router.push(s.targetPath);
    }
    if (s.actionEvent) {
      window.dispatchEvent(
        new CustomEvent(s.actionEvent.type, { detail: s.actionEvent.detail })
      );
    }
  };

  const handleGoToStep = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= EXECUTIVE_STEPS.length) return;
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
      {/* 🌟 Top Floating Header Banner (Sleek Executive Style) */}
      {!isActive && !hasDismissedHeader && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 max-w-lg w-[92%] md:w-auto bg-slate-900/95 text-white backdrop-blur-xl border border-slate-800 rounded-full shadow-2xl p-1.5 px-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <div className="text-xs">
              <span className="font-bold text-slate-100">Product Walkthrough: </span>
              <span className="text-slate-400">Explore key CRM modules interactively</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleStartTour}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-3.5 rounded-full shadow-md gap-1.5"
            >
              <Play className="h-3 w-3 fill-current" />
              Start Walkthrough
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

      {/* 🎬 Professional Floating Tour Panel (Positioned Top-Left / Mid-Left to NEVER overlap WhatsApp simulator) */}
      {isActive && (
        <div className="fixed top-20 left-4 md:left-72 z-40 w-[92%] max-w-sm bg-slate-900/95 text-slate-100 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-4 animate-in slide-in-from-top-4 duration-300 select-none">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${((currentStepIdx + 1) / EXECUTIVE_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Header Badge & Controls */}
          <div className="flex items-center justify-between mb-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
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
                title="Close"
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
                <span className="text-[10px] text-slate-400">Sidebar → {step.sidebarLabel}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="my-2.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            {step.bullets.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Final Step CTA */}
          {currentStepIdx === EXECUTIVE_STEPS.length - 1 ? (
            <div className="space-y-1.5 pt-1">
              <a
                href="https://wa.me/917004283531?text=Hi!%20I%20reviewed%20the%20StreamKart%20CRM%20Walkthrough%20and%20want%20to%20discuss%20building%20a%20custom%20CRM%20for%20my%20agency."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat on WhatsApp (+91 70042 83531)
              </a>
              <a
                href="mailto:support@streamkart.shop?subject=Custom%20Travel%20CRM%20Request"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800"
              >
                📧 Email Team (support@streamkart.shop)
              </a>
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
                {EXECUTIVE_STEPS.map((_, i) => (
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
