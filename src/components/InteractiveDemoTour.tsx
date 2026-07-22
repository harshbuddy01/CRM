'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Play, Pause, ChevronRight, ChevronLeft, Sparkles, X, CheckCircle2, 
  MessageSquare, Zap, FileText, Users, CreditCard, ShieldCheck, Gamepad2, Compass, Settings, Database, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourLevel {
  level: number;
  title: string;
  badge: string;
  targetPath: string;
  sidebarLabel: string;
  tagline: string;
  description: string;
  actionInstruction: string;
  features: string[];
  actionEvent?: { type: string; detail: any };
  icon: any;
  color: string;
}

const GAME_LEVELS: TourLevel[] = [
  {
    level: 1,
    title: 'Level 1: Dashboard Analytics & Quick Actions',
    badge: '🎮 LEVEL 1 OF 7 • OVERVIEW',
    targetPath: '/',
    sidebarLabel: 'Overview',
    tagline: '360° Real-time Agency Command Center',
    description: 'Welcome to your CRM Game Tutorial! Level 1 shows your live command center — monthly lead counts, pipeline revenue, and quick action shortcuts.',
    actionInstruction: 'Click "Next Level" or select "Pipeline" on the left menu to unlock Level 2!',
    features: [
      'Live monthly revenue & lead velocity stats',
      'Quick 1-click lead creation shortcuts',
      'Branch-level team productivity tracking',
    ],
    icon: Compass,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    level: 2,
    title: 'Level 2: Kanban Lead Pipeline & Auto Assignment',
    badge: '🎮 LEVEL 2 OF 7 • LEADS & PIPELINE',
    targetPath: '/pipeline',
    sidebarLabel: 'Pipeline',
    tagline: 'Auto-capture leads & drag-and-drop deals',
    description: 'Level 2 unlocked! Leads from Facebook Ads, Google & WhatsApp land in your pipeline automatically and get auto-assigned to sales reps via round-robin.',
    actionInstruction: 'Watch the Kanban stages. Click "Next Level" to unlock Level 3: Proposal Engine!',
    features: [
      'Round-robin sales team auto assignment',
      'Drag-and-drop Kanban deal status stages',
      'WhatsApp automated follow-up reminders',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        text: '🔔 *LEVEL 2 UNLOCKED: LIVE LEAD ALERT*\n\nClient: Rahul Verma\nDestination: Maldives 4N/5D\nBudget: ₹2.2 Lakhs\nStatus: Auto-Assigned to Senior Sales Rep',
        buttons: ['Trigger Auto WhatsApp Greeting', 'Generate Itinerary'],
      },
    },
    icon: Users,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    level: 3,
    title: 'Level 3: 15-Second AI Proposal & Itinerary Builder',
    badge: '🎮 LEVEL 3 OF 7 • PROPOSAL ENGINE',
    targetPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    tagline: 'Build luxury day-wise itineraries in seconds',
    description: 'Level 3 unlocked! Turn client requests into day-by-day itineraries complete with hotels, flights, cab transfers & cost breakdown in 15 seconds.',
    actionInstruction: 'Click "Next Level" to explore Level 4: B2B Agent Portal!',
    features: [
      'Auto-calculates flight, hotel & transfer totals',
      '1-Click PDF generation with your logo',
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
    color: 'from-purple-600 to-indigo-600',
  },
  {
    level: 4,
    title: 'Level 4: B2B Sub-Agent Wholesale Portal',
    badge: '🎮 LEVEL 4 OF 7 • B2B EXPANSION',
    targetPath: '/agents',
    sidebarLabel: 'B2B Agents',
    tagline: 'Scale your wholesale agent network',
    description: 'Level 4 unlocked! Give sub-agents their own login panel to set custom markups, track live commissions, and print co-branded proposals.',
    actionInstruction: 'Click "Next Level" to unlock Level 5: System Masters!',
    features: [
      'Per-agent custom markup settings (% or flat)',
      'Live agent ledger & credit limit management',
      'Co-branded PDFs with sub-agent logo',
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
    color: 'from-amber-600 to-orange-600',
  },
  {
    level: 5,
    title: 'Level 5: Masters & Inventory Database',
    badge: '🎮 LEVEL 5 OF 7 • SYSTEM MASTERS',
    targetPath: '/masters-v2',
    sidebarLabel: 'Masters',
    tagline: 'Central hotel & sightseeing tariff library',
    description: 'Level 5 unlocked! Store all contracted hotel rates, transport tariffs, and destination packages in one central database for instant proposal reuse.',
    actionInstruction: 'Click "Next Level" to unlock Level 6: GST Invoicing!',
    features: [
      'Contracted hotel rates & seasonal pricing',
      'Transfer & cab tariff master list',
      'Pre-built sightseeing & activity database',
    ],
    icon: Database,
    color: 'from-teal-600 to-cyan-600',
  },
  {
    level: 6,
    title: 'Level 6: GST Invoicing & Razorpay Instant Collect',
    badge: '🎮 LEVEL 6 OF 7 • FINANCE & BILLING',
    targetPath: '/finance/invoices',
    sidebarLabel: 'Finance',
    tagline: 'Collect online payments & GST billing in 1 click',
    description: 'Level 6 unlocked! Generate GST-compliant invoices and send Razorpay/UPI payment links directly to client WhatsApp for 100% automated collection.',
    actionInstruction: 'Click "Next Level" to view Level 7: System Settings!',
    features: [
      'GST & TCS compliant tax invoices',
      'Razorpay/UPI online payment link generation',
      'Auto payment receipt & voucher dispatch',
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
    color: 'from-pink-600 to-rose-600',
  },
  {
    level: 7,
    title: 'Level 7: White-Label Branding & WhatsApp API',
    badge: '🎮 LEVEL 7 OF 7 • SYSTEM CONFIG',
    targetPath: '/settings',
    sidebarLabel: 'Settings',
    tagline: 'White-label the entire CRM under your agency brand',
    description: 'Congratulations on reaching Level 7! Upload your agency logo, GST info, and connect Meta WhatsApp API keys to run the CRM on your custom domain.',
    actionInstruction: 'Ready to order a custom CRM for your travel business?',
    features: [
      'Custom branding & white-label domain setup',
      'Meta WhatsApp Business API Integration',
      '1-on-1 Onboarding & Data Migration',
    ],
    icon: Settings,
    color: 'from-indigo-600 to-purple-600',
  },
];

export default function InteractiveDemoTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasDismissedHeader, setHasDismissedHeader] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const level = GAME_LEVELS[currentLevelIdx];

  // Highlight active sidebar item
  useEffect(() => {
    if (!isActive) return;
    const elements = document.querySelectorAll('[data-tour-target]');
    elements.forEach((el) => {
      const target = el.getAttribute('data-tour-target');
      if (target === level.targetPath) {
        el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'bg-emerald-50', 'text-emerald-700');
      } else {
        el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'bg-emerald-50', 'text-emerald-700');
      }
    });
  }, [isActive, currentLevelIdx, level]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && isActive) {
      timerRef.current = setTimeout(() => {
        if (currentLevelIdx < GAME_LEVELS.length - 1) {
          handleGoToLevel(currentLevelIdx + 1);
        } else {
          setIsPlaying(false);
        }
      }, 8500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isActive, currentLevelIdx]);

  const handleStartGame = () => {
    setIsActive(true);
    setCurrentLevelIdx(0);
    setIsPlaying(true);
    navigateToLevel(0);
  };

  const navigateToLevel = (idx: number) => {
    const l = GAME_LEVELS[idx];
    if (l.targetPath && pathname !== l.targetPath) {
      router.push(l.targetPath);
    }
    if (l.actionEvent) {
      window.dispatchEvent(
        new CustomEvent(l.actionEvent.type, { detail: l.actionEvent.detail })
      );
    }
  };

  const handleGoToLevel = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= GAME_LEVELS.length) return;
    setCurrentLevelIdx(newIdx);
    navigateToLevel(newIdx);
  };

  const handleEndGame = () => {
    setIsActive(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Cleanup highlighted rings
    const elements = document.querySelectorAll('[data-tour-target]');
    elements.forEach((el) => {
      el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'bg-emerald-50', 'text-emerald-700');
    });
  };

  return (
    <>
      {/* 🌟 Top Floating Header Banner (Unmissable for Demo Visitors) */}
      {!isActive && !hasDismissedHeader && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 max-w-xl w-[92%] md:w-auto bg-slate-900/95 text-white backdrop-blur-xl border border-emerald-500/40 rounded-full shadow-2xl p-2 px-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="h-5 w-5 text-amber-300 animate-bounce" />
            <div className="text-xs">
              <span className="font-extrabold text-amber-300">Interactive Game Walkthrough: </span>
              <span className="text-slate-200">Play Levels 1–7 & watch CRM auto-navigate!</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs h-7 px-3.5 rounded-full shadow-md gap-1.5 animate-pulse"
            >
              <Play className="h-3 w-3 fill-current" />
              Play Demo Game
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

      {/* 🎬 Game Level Floating Guidance Box */}
      {isActive && (
        <div className="fixed top-20 right-4 md:right-8 z-50 w-[94%] max-w-sm bg-slate-950/95 text-slate-100 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-4.5 animate-in slide-in-from-top-6 duration-300 select-none">
          
          {/* Level Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500"
              style={{ width: `${((currentLevelIdx + 1) / GAME_LEVELS.length) * 100}%` }}
            />
          </div>

          {/* Level Badge & Controls */}
          <div className="flex items-center justify-between mb-2 pt-1">
            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {level.badge}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-6 w-6 text-slate-400 hover:text-white"
                title={isPlaying ? 'Pause auto-play' : 'Play auto-play'}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
              <button
                onClick={handleEndGame}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-900"
                title="Close Tour (X)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg text-white bg-gradient-to-br shadow-md", level.color)}>
                <level.icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight">{level.title}</h3>
                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  👈 Target: Sidebar → {level.sidebarLabel}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              {level.description}
            </p>
          </div>

          {/* Action Instruction Box */}
          <div className="my-2 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-200 font-semibold flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{level.actionInstruction}</span>
          </div>

          {/* Features Checklist */}
          <div className="mb-2.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
            {level.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Final Level Call to Action */}
          {currentLevelIdx === GAME_LEVELS.length - 1 ? (
            <div className="space-y-1.5 pt-1">
              <a
                href="https://wa.me/917004283531?text=Hi!%20I%20completed%20all%207%20Levels%20of%20the%20StreamKart%20CRM%20Game%20Demo.%20I%20want%20a%20custom%20CRM%20for%20my%20travel%20agency!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Chat on WhatsApp (+91 70042 83531)
              </a>
              <a
                href="mailto:support@streamkart.shop?subject=Custom%20Travel%20CRM%20Order"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
              >
                📧 Email Team (support@streamkart.shop)
              </a>
            </div>
          ) : (
            /* Navigation Buttons */
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handleGoToLevel(currentLevelIdx - 1)}
                  disabled={currentLevelIdx === 0}
                  variant="outline"
                  className="h-7 px-2.5 text-[11px] bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3 w-3 mr-0.5" /> Prev
                </Button>
                
                <button
                  onClick={handleEndGame}
                  className="text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-1 underline"
                >
                  Skip
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1">
                {GAME_LEVELS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleGoToLevel(i)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === currentLevelIdx ? "w-4 bg-emerald-500" : "bg-slate-700"
                    )}
                  />
                ))}
              </div>

              <Button
                onClick={() => handleGoToLevel(currentLevelIdx + 1)}
                className="h-7 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Next Level <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          )}

        </div>
      )}
    </>
  );
}
