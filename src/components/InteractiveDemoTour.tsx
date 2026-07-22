'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ChevronRight, ChevronLeft, Sparkles, X, CheckCircle2, 
  MessageSquare, Zap, FileText, Users, CreditCard, ShieldCheck, Phone, ArrowRight, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  id: number;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  features: string[];
  actionEvent?: { type: string; detail: any };
  targetPath?: string;
  icon: any;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Smart Lead Pipeline & Round-Robin Assignment',
    badge: 'STEP 1 OF 6 • LEAD CAPTURE',
    tagline: 'Never lose a travel enquiry again',
    description: 'Enquiries from Google Ads, Facebook, WhatsApp, and Website forms land automatically into your CRM pipeline with 0 manual effort.',
    features: [
      'Round-Robin auto assignment to sales team',
      'Lead priority scoring & budget tracking',
      'Follow-up reminders with WhatsApp integration',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        text: '🔔 *NEW LEAD ALERT*\n\nClient: Rahul Verma\nDestination: Maldives 4N/5D\nBudget: ₹2.2 Lakhs\nStatus: Auto-Assigned to Sales Rep',
        buttons: ['Trigger Auto WhatsApp Greeting', 'Generate Itinerary'],
      },
    },
    icon: Users,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 2,
    title: '15-Second AI Proposal & Itinerary Builder',
    badge: 'STEP 2 OF 6 • PROPOSAL ENGINE',
    tagline: 'Create luxury day-wise itineraries in seconds',
    description: 'Type client preferences or choose a template — StreamKart builds a day-by-day itinerary complete with hotels, flights, cab transfers & cost breakdown.',
    features: [
      'Auto-calculates flight, hotel & transfer totals',
      '1-Click PDF generation with company logo',
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
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 3,
    title: 'Official WhatsApp Business API Automation',
    badge: 'STEP 3 OF 6 • WHATSAPP AUTOMATION',
    tagline: '98%+ Open Rate Client Communication',
    description: 'Automate client updates, PDF proposals, payment receipts, and travel vouchers directly to your client\'s WhatsApp.',
    features: [
      'Official WhatsApp API integration (Meta Approved)',
      'Automated trip countdown & departure alerts',
      'Broadcast marketing studio for past leads',
    ],
    actionEvent: {
      type: 'crm-whatsapp-trigger',
      detail: {
        text: '📱 *WHATSAPP CLIENT VIEW PREVIEW*\n\n"Hi Ankit! Your Bali trip itinerary is ready 🌴\nView proposal & book online: https://streamkart.shop/proposal/8812"\n\n✅ *Status: Delivered & Read (Blue Ticks)*',
        buttons: ['Generate GST Invoice', 'View B2B Portal'],
      },
    },
    icon: MessageSquare,
    color: 'from-teal-600 to-cyan-600',
  },
  {
    id: 4,
    title: 'B2B Sub-Agent Wholesale Portal',
    badge: 'STEP 4 OF 6 • B2B EXPANSION',
    tagline: 'Empower sub-agents & expand your network',
    description: 'Give travel agent partners their own branded portal. They can apply custom markups, view live commissions, and print co-branded client proposals.',
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
    color: 'from-purple-600 to-indigo-600',
  },
  {
    id: 5,
    title: 'GST Invoicing & Razorpay Instant Collect',
    badge: 'STEP 5 OF 6 • FINANCE & BILLING',
    tagline: 'Collect payments & generate tax invoices in 1 click',
    description: 'Auto-calculate CGST, SGST, IGST, and TCS. Send Razorpay online payment links directly via SMS or WhatsApp for 100% automated collection.',
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
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 6,
    title: 'Ready for a Custom CRM for Your Travel Agency?',
    badge: 'FINAL STEP • GET STARTED NOW',
    tagline: 'We build & customize this exact CRM for your business!',
    description: 'Join 100+ travel agencies scaling their sales by 3x with StreamKart CRM. Get dedicated setup, custom branding, and 24/7 priority support.',
    features: [
      'Custom branding & white-label domain',
      'Meta WhatsApp Business API Approval',
      '1-on-1 Onboarding & Data Import',
    ],
    icon: ShieldCheck,
    color: 'from-pink-600 to-rose-600',
  },
];

export default function InteractiveDemoTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasDismissedHeader, setHasDismissedHeader] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = TOUR_STEPS[currentStepIdx];

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && isActive) {
      timerRef.current = setTimeout(() => {
        if (currentStepIdx < TOUR_STEPS.length - 1) {
          handleGoToStep(currentStepIdx + 1);
        } else {
          setIsPlaying(false);
        }
      }, 7000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isActive, currentStepIdx]);

  const handleStartTour = () => {
    setIsActive(true);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    triggerStepAction(0);
  };

  const triggerStepAction = (idx: number) => {
    const s = TOUR_STEPS[idx];
    if (s.actionEvent) {
      window.dispatchEvent(
        new CustomEvent(s.actionEvent.type, { detail: s.actionEvent.detail })
      );
    }
  };

  const handleGoToStep = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= TOUR_STEPS.length) return;
    setCurrentStepIdx(newIdx);
    triggerStepAction(newIdx);
  };

  const handleEndTour = () => {
    setIsActive(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <>
      {/* 🌟 Top Floating Header Banner (Unmissable for Demo Visitors) */}
      {!isActive && !hasDismissedHeader && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 max-w-xl w-[92%] md:w-auto bg-slate-900/95 text-white backdrop-blur-xl border border-emerald-500/40 rounded-full shadow-2xl p-2 px-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-extrabold text-amber-300">Live Product Demo: </span>
              <span className="text-slate-200">Take a 60-sec interactive guided tour!</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleStartTour}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs h-7 px-3.5 rounded-full shadow-md gap-1.5 animate-pulse"
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

      {/* 🎬 Interactive Step-by-Step Tour Card */}
      {isActive && (
        <>
          {/* Subtle Overlay Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40 transition-opacity"
            onClick={handleEndTour}
          />

          {/* Tour Card Floating Box */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-lg bg-slate-950 text-slate-100 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-5 animate-in zoom-in-95 duration-300">
            
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Header / Badge */}
            <div className="flex items-center justify-between mb-3 pt-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {step.badge}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  title={isPlaying ? 'Pause auto-play' : 'Play auto-play'}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <button
                  onClick={handleEndTour}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-xl text-white bg-gradient-to-br shadow-md", step.color)}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white leading-tight">{step.title}</h3>
                  <p className="text-xs font-semibold text-emerald-400">{step.tagline}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {step.description}
              </p>
            </div>

            {/* Features Checklist */}
            <div className="my-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
              {step.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Final Step Call to Action */}
            {currentStepIdx === TOUR_STEPS.length - 1 ? (
              <div className="space-y-2 pt-1">
                <a
                  href="https://wa.me/917004283531?text=Hi!%20I%20tested%20the%20StreamKart%20CRM%20Demo%20and%20want%20to%20discuss%20building%20a%20custom%20CRM%20for%20my%20agency."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat on WhatsApp (+91 70042 83531)
                </a>
                <a
                  href="mailto:support@streamkart.shop?subject=Custom%20Travel%20CRM%20Request"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
                >
                  📧 Email Team (support@streamkart.shop)
                </a>
              </div>
            ) : (
              /* Navigation Buttons */
              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <Button
                  onClick={() => handleGoToStep(currentStepIdx - 1)}
                  disabled={currentStepIdx === 0}
                  variant="outline"
                  className="h-8 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>

                <div className="flex items-center gap-1">
                  {TOUR_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleGoToStep(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === currentStepIdx ? "w-5 bg-emerald-500" : "bg-slate-700"
                      )}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => handleGoToStep(currentStepIdx + 1)}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}

          </div>
        </>
      )}
    </>
  );
}
