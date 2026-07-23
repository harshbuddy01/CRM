'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft, X, Play, Pause, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: number;
  section: string;
  title: string;
  targetPath: string;
  sidebarLabel: string;
  what: string;
  howTo: string;
  tip?: string;
  gradient: string;
  accent: string;
}

const STEPS: TourStep[] = [
  {
    id: 1,
    section: '1 of 12 — DASHBOARD',
    title: 'Overview & Live Analytics',
    targetPath: '/',
    sidebarLabel: 'Overview',
    what: 'Your daily command center. See live lead count, active pipeline value, monthly revenue, and closure rate at a glance.',
    howTo: 'Use the Quick Shortcuts to instantly create a new lead or jump to your pipeline. The stats refresh in real time.',
    tip: 'Check this page every morning before starting your day.',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    accent: '#a78bfa',
  },
  {
    id: 2,
    section: '2 of 12 — PIPELINE',
    title: 'Kanban Lead Pipeline',
    targetPath: '/pipeline',
    sidebarLabel: 'Pipeline',
    what: 'Leads from Facebook, Google, WhatsApp, and website enquiry forms land here automatically. Each card is a live deal.',
    howTo: 'Drag cards across columns: New → Contacted → Proposal Sent → Negotiation → Won. Use filters to view by agent or destination.',
    tip: 'Click any card to open full lead details, notes, and call history.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    accent: '#38bdf8',
  },
  {
    id: 3,
    section: '3 of 12 — LEADS LIST',
    title: 'Leads & Client Queries',
    targetPath: '/queries',
    sidebarLabel: 'Leads List',
    what: 'Full searchable table of every client enquiry. Each row shows destination, budget, assigned agent, and follow-up status.',
    howTo: 'Click any row to open the lead detail page. From there you can: add notes, attach documents, change status, or assign a proposal.',
    tip: 'Use the "Assign Proposal" button inside a lead to link a created itinerary directly to that client.',
    gradient: 'from-sky-600 via-blue-600 to-indigo-700',
    accent: '#60a5fa',
  },
  {
    id: 4,
    section: '4 of 12 — ITINERARIES (MASTER TEMPLATES)',
    title: 'Master Itinerary Templates',
    targetPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    what: 'Pre-built, reusable day-wise itinerary templates for popular destinations (Bali, Maldives, Kashmir, Dubai, etc).',
    howTo: 'Click "Master Templates" tab → Click any itinerary to open the drag-and-drop builder. Add hotels, photos, sightseeing, cab details, and pricing per day.',
    tip: 'Once a master template is ready, duplicate it to create a client-specific copy instantly.',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    accent: '#34d399',
  },
  {
    id: 5,
    section: '5 of 12 — ITINERARIES (CLIENT COPIES)',
    title: 'Client Working Copies',
    targetPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    what: 'Personalized client-specific itinerary drafts cloned from master templates. Customize pricing, dates, and hotels per client.',
    howTo: 'Click "Client Working Copies" tab → Open any copy → Adjust hotel, cab, and activity costs → Generate branded PDF → Share proposal link.',
    tip: 'Send the client a live web proposal link with interactive photos — no PDF attachment needed.',
    gradient: 'from-teal-600 via-emerald-600 to-green-600',
    accent: '#10b981',
  },
  {
    id: 6,
    section: '6 of 12 — PROPOSALS',
    title: 'Proposals & Quote Tracking',
    targetPath: '/proposals',
    sidebarLabel: 'Proposals',
    what: 'Central tracking for all proposals sent to clients. See open, accepted, revised, and expired quotes in one view.',
    howTo: 'Filter by agent or status. Click any proposal to view the full quote, send a revised version, or mark it as confirmed to auto-create the booking.',
    tip: 'Once a client accepts a proposal, click "Convert to Tour" to auto-generate the tour operations sheet.',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accent: '#f59e0b',
  },
  {
    id: 7,
    section: '7 of 12 — MASTERS DATABASE',
    title: 'Hotels, Destinations & Tariff Masters',
    targetPath: '/masters-v2',
    sidebarLabel: 'Masters',
    what: 'Your central inventory database: contracted hotels with season-wise room rates, transport tariffs, sightseeing packages, and high-res photos.',
    howTo: 'Add a hotel → Set room categories, meal plan, and seasonal pricing → Upload property photos. These become available instantly inside the itinerary builder.',
    tip: 'Upload multiple hotel photos per property — they appear in the client proposal carousel automatically.',
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    accent: '#f472b6',
  },
  {
    id: 8,
    section: '8 of 12 — TOURS & OPERATIONS',
    title: 'Active Tours & Dispatch',
    targetPath: '/tours',
    sidebarLabel: 'Tours List',
    what: 'Live view of all confirmed tours. Shows departure dates, client names, assigned drivers, hotel check-in status, and voucher generation.',
    howTo: 'Open any tour → Click "Generate Voucher" to create hotel, transfer, or guide vouchers → Send directly to supplier via WhatsApp.',
    tip: 'Field Agents can view their assigned tours from the Field Agent mobile view.',
    gradient: 'from-fuchsia-600 via-purple-600 to-violet-600',
    accent: '#c084fc',
  },
  {
    id: 9,
    section: '9 of 12 — B2B AGENTS',
    title: 'B2B Sub-Agent Network',
    targetPath: '/agents',
    sidebarLabel: 'B2B Agents',
    what: 'Give travel agent partners a dedicated login. They can view leads assigned to them, set custom markups, and issue co-branded proposals.',
    howTo: 'Add a B2B agent → Set their markup % and credit limit → Assign leads to them. They log in on the same URL and see only their data.',
    tip: 'Proposals sent through B2B agents automatically carry the agent\'s own company logo.',
    gradient: 'from-indigo-600 via-blue-600 to-cyan-600',
    accent: '#818cf8',
  },
  {
    id: 10,
    section: '10 of 12 — REPORTS',
    title: 'Sales Reports & Analytics',
    targetPath: '/reports/lead-funnel',
    sidebarLabel: 'Reports',
    what: 'Track lead-to-closure funnel, monthly collection targets, individual sales rep performance, and marketing channel ROI.',
    howTo: 'Use the "Lead Funnel" report to see where deals are dropping off. Use "Sales Report" to compare agent targets vs. achieved revenue.',
    tip: 'Filter by date range and branch to isolate performance of specific teams or marketing campaigns.',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    accent: '#fb923c',
  },
  {
    id: 11,
    section: '11 of 12 — FINANCE',
    title: 'Invoices, GST & Razorpay',
    targetPath: '/finance/invoices',
    sidebarLabel: 'Finance',
    what: 'Generate GST-compliant tax invoices with CGST/SGST/IGST and 5%/20% TCS auto-calculated. Collect payments via Razorpay/UPI links.',
    howTo: 'Open a confirmed booking → Click "Generate Invoice" → System auto-calculates tax → Send Razorpay payment link via WhatsApp → Mark paid when received.',
    tip: 'Track part-payments and balance due. Payment receipts auto-dispatch to client WhatsApp when payment is marked.',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    accent: '#4ade80',
  },
  {
    id: 12,
    section: '12 of 12 — SETTINGS',
    title: 'Branding & System Configuration',
    targetPath: '/settings',
    sidebarLabel: 'Settings',
    what: 'Upload your agency logo, set company GST/PAN details, configure email signature templates, and connect Meta WhatsApp Business API keys.',
    howTo: 'Go to Settings → Upload Logo → Fill in company address & GST → Paste your WhatsApp API key. All exported PDFs and proposals will now carry your brand.',
    tip: 'Uploading a high-quality logo (PNG, transparent background, min 400px wide) ensures your proposals look premium.',
    gradient: 'from-slate-600 via-zinc-600 to-gray-600',
    accent: '#94a3b8',
  },
];

export default function InteractiveDemoTour() {
  const [isActive, setIsActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = STEPS[stepIdx];

  // Highlight sidebar link
  useEffect(() => {
    if (!isActive) return;
    document.querySelectorAll('[data-tour-target]').forEach((el) => {
      const t = el.getAttribute('data-tour-target');
      if (t === step.targetPath) {
        el.classList.add('!bg-emerald-500', '!text-white', 'shadow-lg', 'ring-2', 'ring-emerald-400', 'ring-offset-1');
      } else {
        el.classList.remove('!bg-emerald-500', '!text-white', 'shadow-lg', 'ring-2', 'ring-emerald-400', 'ring-offset-1');
      }
    });
  }, [isActive, stepIdx, step]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && isActive) {
      timerRef.current = setTimeout(() => {
        if (stepIdx < STEPS.length - 1) goToStep(stepIdx + 1);
        else setIsPlaying(false);
      }, 9000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, isActive, stepIdx]);

  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= STEPS.length) return;
    setStepIdx(idx);
    const path = STEPS[idx].targetPath;
    if (pathname !== path) router.push(path);
  };

  const startTour = () => {
    setIsActive(true);
    setStepIdx(0);
    setIsPlaying(true);
    if (pathname !== STEPS[0].targetPath) router.push(STEPS[0].targetPath);
  };

  const endTour = () => {
    setIsActive(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    document.querySelectorAll('[data-tour-target]').forEach((el) => {
      el.classList.remove('!bg-emerald-500', '!text-white', 'shadow-lg', 'ring-2', 'ring-emerald-400', 'ring-offset-1');
    });
  };

  return (
    <>
      {/* ── LAUNCH BANNER ── */}
      {!isActive && !dismissed && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-full shadow-2xl border border-white/10 backdrop-blur-xl animate-in slide-in-from-top-4 duration-500"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-semibold text-white/90">
              <span className="text-emerald-400">Interactive Walkthrough</span>
              <span className="text-white/50 mx-1.5">·</span>
              <span className="text-white/70">12 modules · guided page-by-page tour</span>
            </p>
          </div>
          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-black rounded-full shadow-md"
            style={{ background: 'linear-gradient(90deg,#34d399,#059669)' }}
          >
            <Play className="h-3 w-3 fill-black" />
            Start Tour
          </button>
          <button onClick={() => setDismissed(true)} className="text-white/30 hover:text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── TOUR CARD ── */}
      {isActive && (
        <div
          className="fixed top-20 left-4 md:left-[268px] z-30 w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300"
          style={{ background: 'linear-gradient(160deg, #0f172a 0%, #111827 100%)' }}
        >
          {/* Progress bar */}
          <div className="h-[3px] w-full bg-white/10">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((stepIdx + 1) / STEPS.length) * 100}%`,
                background: `linear-gradient(90deg, ${step.accent}, #fff4)`,
              }}
            />
          </div>

          {/* Gradient accent strip at top */}
          <div className={cn('h-1 w-full bg-gradient-to-r', step.gradient)} />

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: step.accent }}>
                  {step.section}
                </p>
                <h3 className="text-[15px] font-extrabold text-white leading-tight">{step.title}</h3>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">
                  Sidebar → <span className="text-white/60">{step.sidebarLabel}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={endTour}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* What this page does */}
            <div className="mb-2.5 p-3 rounded-xl border border-white/10 bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: step.accent }}>
                What this page does
              </p>
              <p className="text-[12px] text-white/80 leading-relaxed">{step.what}</p>
            </div>

            {/* How to use */}
            <div className="mb-2.5 p-3 rounded-xl border border-white/10 bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                How to use it
              </p>
              <p className="text-[12px] text-white/70 leading-relaxed">{step.howTo}</p>
            </div>

            {/* Tip */}
            {step.tip && (
              <div
                className="mb-3 px-3 py-2 rounded-xl text-[11px] text-white/80 leading-relaxed border border-white/10"
                style={{ background: `${step.accent}15` }}
              >
                <span className="font-bold" style={{ color: step.accent }}>💡 Tip: </span>
                {step.tip}
              </div>
            )}

            {/* Final step CTA */}
            {stepIdx === STEPS.length - 1 ? (
              <div className="space-y-2 pt-1">
                <a
                  href="https://wa.me/917004283531?text=Hi!%20I%20finished%20the%20StreamKart%20CRM%20walkthrough%20and%20want%20a%20custom%20CRM%20for%20my%20agency."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#25d366,#128c7e)' }}
                >
                  Chat on WhatsApp · +91 70042 83531
                </a>
                <button
                  onClick={endTour}
                  className="w-full text-center text-[11px] text-white/30 hover:text-white/60 py-1"
                >
                  Close Walkthrough
                </button>
              </div>
            ) : (
              /* Navigation */
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToStep(stepIdx - 1)}
                    disabled={stepIdx === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                  </button>
                  <button
                    onClick={endTour}
                    className="text-[10px] text-white/25 hover:text-white/50 underline underline-offset-2"
                  >
                    Skip
                  </button>
                </div>

                {/* Dots */}
                <div className="flex items-center gap-1">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToStep(i)}
                      className="rounded-full transition-all"
                      style={{
                        width: i === stepIdx ? '16px' : '6px',
                        height: '6px',
                        background: i === stepIdx ? step.accent : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => goToStep(stepIdx + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-black transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(90deg,${step.accent},${step.accent}cc)` }}
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
