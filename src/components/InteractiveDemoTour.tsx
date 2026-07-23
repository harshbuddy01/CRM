'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronRight, ChevronLeft, X, Play, Pause, MousePointerClick, 
  Lightbulb, ArrowRight, GripHorizontal, Minimize2, Maximize2, Move
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubStep {
  instruction: string;
  action?: string;          
  highlightText?: string;   
  highlightSelector?: string; 
  tip?: string;
}

interface TourSection {
  title: string;
  path: string;
  sidebarPath: string;
  sidebarLabel: string;
  accent: string;
  bg: string;               
  steps: SubStep[];
}

// ─── Tour Content ───────────────────────────────────────────────────────────

const SECTIONS: TourSection[] = [
  {
    title: 'Dashboard Overview',
    path: '/',
    sidebarPath: '/',
    sidebarLabel: 'Overview',
    accent: '#4f46e5',
    bg: 'rgba(79,70,229,0.08)',
    steps: [
      {
        instruction: 'These 4 cards update in real-time every time the page loads — Monthly Leads, Pipeline Total, Revenue Collected this month, and overall Closure %.',
        tip: 'Check this dashboard every morning to see how your team is performing today.',
      },
      {
        instruction: 'Use "New Lead" to manually add a client enquiry. Leads from your Facebook Ads, Google Ads, and website forms appear here automatically via API integration.',
        action: 'Click → NEW LEAD button',
        highlightText: 'New Lead',
        tip: 'Every new lead is auto-assigned to a sales rep using round-robin.',
      },
      {
        instruction: 'Click "Lead Pipeline" to open the Kanban board where you can visually track all active deals by status.',
        action: 'Click → LEAD PIPELINE button',
        highlightText: 'Lead Pipeline',
      },
    ],
  },
  {
    title: 'Kanban Lead Pipeline',
    path: '/pipeline',
    sidebarPath: '/pipeline',
    sidebarLabel: 'Pipeline',
    accent: '#0891b2',
    bg: 'rgba(8,145,178,0.08)',
    steps: [
      {
        instruction: 'Every client enquiry appears as a card on this Kanban board. Cards are auto-assigned to sales reps and sorted by their current deal stage.',
        tip: 'Leads from Facebook, Google, WhatsApp, and website forms arrive here automatically.',
      },
      {
        instruction: 'Drag any lead card left or right to move it between stages: New → Contacted → Proposal Sent → Negotiation → Won → Lost.',
        action: 'Drag a card to another column',
        tip: 'Each move triggers an automatic WhatsApp status update to the client if configured.',
      },
      {
        instruction: 'Click any lead card to open the full client details — travel requirements, budget, follow-up notes, and communication history.',
        action: 'Click any lead card to open it',
      },
    ],
  },
  {
    title: 'Leads & Queries List',
    path: '/queries',
    sidebarPath: '/queries',
    sidebarLabel: 'Leads List',
    accent: '#0369a1',
    bg: 'rgba(3,105,161,0.08)',
    steps: [
      {
        instruction: 'This is the searchable list of every client enquiry. Each row shows the client name, destination, budget, assigned agent, and current follow-up status.',
        tip: 'Use the search bar to find any client by name, destination, or phone number.',
      },
      {
        instruction: 'Click any row to open the full lead. Inside you can: add call notes, upload documents, change the status, send emails, and assign a proposal.',
        action: 'Click any lead row to open it',
      },
      {
        instruction: 'Inside a lead, use the "Assign Proposal" button to link an itinerary you have already built to this specific client.',
        action: 'Inside a lead → click "Assign Proposal"',
        tip: 'Once a proposal is assigned, the client can view it via a personalised web link.',
      },
    ],
  },
  {
    title: 'Itinerary Builder — Master Templates',
    path: '/itineraries',
    sidebarPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    accent: '#059669',
    bg: 'rgba(5,150,105,0.08)',
    steps: [
      {
        instruction: 'The Itineraries page has two tabs. "Master Templates" are your reusable blueprints — one master template per destination (Bali, Maldives, Kashmir, Dubai, etc.).',
        action: 'Click → Master Templates tab',
        highlightText: 'Master Templates',
        tip: 'Build a master once. Reuse it for every client going to that destination.',
      },
      {
        instruction: 'Click any master template to open the drag-and-drop day-wise builder. Add hotels, photos, sightseeing activities, cab transfers, and per-person pricing for each day.',
        action: 'Click any master itinerary to open builder',
      },
      {
        instruction: 'Inside the builder: each day has a hotel section, activity list, meal plan, and transport row. Prices auto-calculate based on rooms and pax count.',
        action: 'Click any day row inside the builder',
        tip: 'Upload hotel room photos directly inside the builder — they appear in the client PDF.',
      },
    ],
  },
  {
    title: 'Itinerary Builder — Client Working Copies',
    path: '/itineraries',
    sidebarPath: '/itineraries',
    sidebarLabel: 'Itineraries',
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    steps: [
      {
        instruction: '"Client Working Copies" are personalised itineraries cloned from a master template for a specific client. They have custom dates, pricing, and hotel selections.',
        action: 'Click → Client Working Copies tab',
        highlightText: 'Client Working Copies',
      },
      {
        instruction: 'Open any client copy → adjust pricing, swap hotels, change dates. Then click "Generate PDF" to download a branded proposal with your logo.',
        action: 'Open client copy → click "Generate PDF"',
        tip: 'The PDF includes your agency logo, GST details, and terms — auto-filled from Settings.',
      },
      {
        instruction: 'Click "Share Link" to generate a live interactive web proposal the client can view on their phone — with photo carousels, day-wise breakdown, and pricing.',
        action: 'Click → Share Link or Share Proposal',
        tip: 'Clients can approve or request changes directly through the proposal link.',
      },
    ],
  },
  {
    title: 'Masters — Hotels & Tariff Database',
    path: '/masters-v2',
    sidebarPath: '/masters-v2',
    sidebarLabel: 'Masters',
    accent: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    steps: [
      {
        instruction: 'Masters is your centralized inventory database. Everything you add here — hotels, rates, photos — becomes available inside the Itinerary Builder instantly.',
        tip: 'Think of Masters as your product catalog. Build it once, use everywhere.',
      },
      {
        instruction: 'Go to the Hotels section. Click "Add Hotel" to add a contracted property. Enter the hotel name, location, star rating, room categories, meal plan, and contracted rate per night.',
        action: 'Click → Hotels → Add Hotel',
        tip: 'Add seasonal pricing (peak vs. off-peak) per room type.',
      },
      {
        instruction: 'After adding a hotel, click on it and use the "Photos" tab to upload high-resolution property photos. These photos appear automatically inside client PDF proposals.',
        action: 'Open hotel → click Photos tab → Upload',
        tip: 'Upload at least 5 photos per hotel — lobby, room, pool, and exterior.',
      },
      {
        instruction: 'Go to the Destinations section to add destination guides, popular sightseeing points, and activity descriptions that auto-populate inside the itinerary builder.',
        action: 'Click → Destinations tab',
      },
      {
        instruction: 'Go to the Transport section to add cab, taxi, and transfer rates between airports, hotels, and sightseeing spots. These auto-calculate in the itinerary pricing.',
        action: 'Click → Transport tab',
      },
    ],
  },
  {
    title: 'Tours & Operations',
    path: '/tours',
    sidebarPath: '/tours',
    sidebarLabel: 'Tours List',
    accent: '#d97706',
    bg: 'rgba(217,119,6,0.08)',
    steps: [
      {
        instruction: 'Tours List shows all confirmed bookings with departure dates, client details, hotel check-in status, and assigned field agents.',
        tip: 'A lead becomes a "Tour" after the client confirms and pays an advance.',
      },
      {
        instruction: 'Click any tour → click "Generate Voucher" to create hotel booking vouchers, transfer vouchers, and guide vouchers. Send them to suppliers directly via WhatsApp.',
        action: 'Open a tour → click "Generate Voucher"',
      },
      {
        instruction: '"Field Agent" view in the sidebar shows field staff only their assigned tours for that day — departure time, pickup point, hotel details, and client contacts.',
        action: 'Click → Field Agent in sidebar',
        tip: 'Field agents access this on their phone. No extra app needed.',
      },
    ],
  },
  {
    title: 'WhatsApp Business Integration',
    path: '/settings',
    sidebarPath: '/settings',
    sidebarLabel: 'Settings',
    accent: '#16a34a',
    bg: 'rgba(22,163,74,0.08)',
    steps: [
      {
        instruction: 'The CRM connects to Meta WhatsApp Business API — allowing you to send automated messages, proposals, invoices, and follow-ups to clients via official WhatsApp.',
        tip: 'This is the Official Meta API — messages come from your agency\'s verified WhatsApp number with a blue tick.',
      },
      {
        instruction: 'To activate: go to Settings → Integrations → paste your WhatsApp Phone Number ID and API Token from your Meta Business account.',
        action: 'Settings → WhatsApp API section → paste credentials',
      },
      {
        instruction: 'Once active, the system auto-sends WhatsApp messages when: a new lead is assigned, a proposal is shared, a payment link is generated, or a tour is confirmed.',
        tip: 'Message templates are pre-built — you can customize them from Settings → Templates.',
      },
    ],
  },
  {
    title: 'Reports & Sales Analytics',
    path: '/reports/lead-funnel',
    sidebarPath: '/reports/lead-funnel',
    sidebarLabel: 'Reports',
    accent: '#dc2626',
    bg: 'rgba(220,38,38,0.08)',
    steps: [
      {
        instruction: 'Lead Funnel report shows how many leads entered each stage this month and how many dropped off — so you know exactly where your sales process is breaking.',
        action: 'Click → Lead Funnel in the Reports submenu',
        tip: 'A healthy funnel has 60%+ leads moving from New to Contacted within 24 hours.',
      },
      {
        instruction: 'Sales Report shows each agent\'s monthly target vs. achieved revenue, number of deals closed, and average deal value. Use this for team reviews.',
        action: 'Click → Sales Report tab',
      },
      {
        instruction: 'Marketing Report shows which source (Facebook / Google / WhatsApp / Walk-in) is generating the most leads and the highest conversion rate.',
        action: 'Click → Marketing Report tab',
        tip: 'Use this to decide where to increase your ad budget every month.',
      },
      {
        instruction: 'Collections Report shows total payments received, pending balances, and overdue amounts — filterable by date range and branch.',
        action: 'Click → Collections tab',
      },
    ],
  },
  {
    title: 'GST Invoicing & Payments',
    path: '/finance/invoices',
    sidebarPath: '/finance/invoices',
    sidebarLabel: 'Finance',
    accent: '#0891b2',
    bg: 'rgba(8,145,178,0.08)',
    steps: [
      {
        instruction: 'Create a GST-compliant tax invoice in one click. CGST, SGST, IGST, and 5% TCS on tour packages are automatically calculated based on the booking amount.',
        action: 'Click → Create Invoice button',
        tip: 'The invoice pulls client details, package amount, and company GST number automatically.',
      },
      {
        instruction: 'After creating an invoice, click "Send Payment Link" to generate a Razorpay or UPI payment link. The client receives it directly on WhatsApp.',
        action: 'Open invoice → click "Send Payment Link"',
      },
      {
        instruction: 'Track partial payments here. Each payment received updates the "Balance Due" automatically. When fully paid, mark as "Paid" to trigger automatic receipt dispatch to client.',
        action: 'Open invoice → click "Mark as Paid" when payment received',
        tip: 'An automatic WhatsApp receipt is sent to the client the moment you mark payment.',
      },
    ],
  },
  {
    title: 'B2B Sub-Agent Network',
    path: '/agents',
    sidebarPath: '/agents',
    sidebarLabel: 'B2B Agents',
    accent: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    steps: [
      {
        instruction: 'B2B Agents are travel agent partners who send you group bookings. Add them here and give them a dedicated login to the CRM under their own credentials.',
        action: 'Click → Add B2B Agent',
        tip: 'B2B agents can only see the leads and tours assigned to them — not your full data.',
      },
      {
        instruction: 'Set a custom markup percentage or fixed amount per agent. When they view a proposal, prices are automatically marked up for their client — without them seeing your cost.',
        action: 'Open agent → set Markup % field',
      },
      {
        instruction: 'Each B2B agent gets a co-branded PDF proposal with their agency logo — not yours. The booking still comes through your CRM and you manage the operations.',
        action: 'Open agent → click "Generate Co-Branded PDF"',
        tip: 'This white-labeling feature is exclusive to StreamKart CRM — no other travel software offers it.',
      },
    ],
  },
  {
    title: 'Settings & White-Label Setup',
    path: '/settings',
    sidebarPath: '/settings',
    sidebarLabel: 'Settings',
    accent: '#374151',
    bg: 'rgba(55,65,81,0.08)',
    steps: [
      {
        instruction: 'Upload your agency logo here. It will automatically appear on all exported PDFs, proposals, invoices, and client web links. This is your full white-label setup.',
        action: 'Settings → Company Profile → Upload Logo',
        tip: 'Use a PNG file with transparent background, minimum 400px wide for best quality.',
      },
      {
        instruction: 'Add your GST number, PAN, company address, and bank details. These auto-fill into every invoice generated in the system.',
        action: 'Settings → Company Profile → Tax Details',
      },
      {
        instruction: 'Configure your email signature and automated email templates for lead confirmations, proposal emails, and payment reminders sent to clients.',
        action: 'Settings → Email Templates',
        tip: 'Rich text editor supports your logo, formatted text, and clickable CTA buttons.',
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTotalSteps() {
  return SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);
}

function getAbsoluteIndex(sectionIdx: number, stepIdx: number) {
  let count = 0;
  for (let i = 0; i < sectionIdx; i++) count += SECTIONS[i].steps.length;
  return count + stepIdx;
}

function highlightByText(text: string, color: string) {
  if (!text) return null;
  const all = Array.from(document.querySelectorAll('button, a, [role="tab"], h1, h2, h3, span, div'));
  const el = all.find(e => e.textContent?.trim() === text || e.textContent?.trim().includes(text));
  if (!el) return null;
  (el as HTMLElement).style.outline = `2px solid ${color}`;
  (el as HTMLElement).style.outlineOffset = '3px';
  (el as HTMLElement).style.borderRadius = '6px';
  (el as HTMLElement).style.transition = 'outline 0.3s';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return el;
}

function clearHighlights() {
  document.querySelectorAll('[style*="outline"]').forEach((el) => {
    (el as HTMLElement).style.outline = '';
    (el as HTMLElement).style.outlineOffset = '';
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InteractiveDemoTour() {
  const [isActive, setIsActive] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Dragging state
  const [pos, setPos] = useState({ x: 272, y: 72 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 272, posY: 72 });

  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const section = SECTIONS[sectionIdx];
  const step = section.steps[stepIdx];
  const totalSteps = getTotalSteps();
  const absoluteIdx = getAbsoluteIndex(sectionIdx, stepIdx);
  const isLastStep = sectionIdx === SECTIONS.length - 1 && stepIdx === section.steps.length - 1;

  // Handle Dragging
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 360, dragRef.current.posX + dx)),
        y: Math.max(60, Math.min(window.innerHeight - 200, dragRef.current.posY + dy)),
      });
    };

    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // Sidebar highlight
  useEffect(() => {
    if (!isActive) return;
    document.querySelectorAll('[data-tour-target]').forEach((el) => {
      const t = el.getAttribute('data-tour-target');
      if (t === section.sidebarPath) {
        el.classList.add('!bg-blue-600', '!text-white', 'ring-2', 'ring-blue-400', 'ring-offset-1');
      } else {
        el.classList.remove('!bg-blue-600', '!text-white', 'ring-2', 'ring-blue-400', 'ring-offset-1');
      }
    });
  }, [isActive, sectionIdx, section]);

  // Element highlight for current step
  useEffect(() => {
    if (!isActive) return;
    clearHighlights();
    if (step.highlightText) {
      setTimeout(() => highlightByText(step.highlightText!, section.accent), 400);
    }
    return () => clearHighlights();
  }, [isActive, sectionIdx, stepIdx]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && isActive) {
      timerRef.current = setTimeout(goNext, 7000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, isActive, sectionIdx, stepIdx]);

  const navigateToSection = useCallback((sIdx: number) => {
    const s = SECTIONS[sIdx];
    if (s.path !== pathname) router.push(s.path);
  }, [pathname, router]);

  const goNext = useCallback(() => {
    clearHighlights();
    if (stepIdx < section.steps.length - 1) {
      setStepIdx(si => si + 1);
    } else if (sectionIdx < SECTIONS.length - 1) {
      const nextSIdx = sectionIdx + 1;
      setSectionIdx(nextSIdx);
      setStepIdx(0);
      navigateToSection(nextSIdx);
    } else {
      setIsPlaying(false);
    }
  }, [section.steps.length, sectionIdx, stepIdx, navigateToSection]);

  const goPrev = useCallback(() => {
    clearHighlights();
    if (stepIdx > 0) {
      setStepIdx(si => si - 1);
    } else if (sectionIdx > 0) {
      const prevSIdx = sectionIdx - 1;
      setSectionIdx(prevSIdx);
      setStepIdx(SECTIONS[prevSIdx].steps.length - 1);
      navigateToSection(prevSIdx);
    }
  }, [sectionIdx, stepIdx, navigateToSection]);

  const startTour = () => {
    setIsActive(true);
    setIsMinimized(false);
    setSectionIdx(0);
    setStepIdx(0);
    setIsPlaying(true);
    if (pathname !== SECTIONS[0].path) router.push(SECTIONS[0].path);
  };

  const endTour = () => {
    setIsActive(false);
    setIsPlaying(false);
    clearHighlights();
    if (timerRef.current) clearTimeout(timerRef.current);
    document.querySelectorAll('[data-tour-target]').forEach((el) => {
      el.classList.remove('!bg-blue-600', '!text-white', 'ring-2', 'ring-blue-400', 'ring-offset-1');
    });
  };

  const jumpToSection = (sIdx: number) => {
    clearHighlights();
    setSectionIdx(sIdx);
    setStepIdx(0);
    navigateToSection(sIdx);
  };

  return (
    <>
      {/* ── LAUNCH BANNER ── */}
      {!isActive && !dismissed && (
        <div
          className="fixed top-[62px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl border animate-in slide-in-from-top-3 duration-400"
          style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>
          <p className="text-sm font-semibold text-gray-700">
            Interactive Walkthrough
            <span className="text-gray-400 font-normal ml-1.5">· {totalSteps} guided steps across every CRM module</span>
          </p>
          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
            style={{ background: '#2563eb' }}
          >
            <Play size={11} className="fill-white" /> Start Tour
          </button>
          <button onClick={() => setDismissed(true)} className="text-gray-300 hover:text-gray-500 ml-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── MINIMIZED DOCKABLE BAR ── */}
      {isActive && isMinimized && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border bg-white animate-in slide-in-from-bottom-3 duration-300"
          style={{ border: `2px solid ${section.accent}`, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: section.accent }} />
            <p className="text-xs font-bold text-gray-800">
              <span style={{ color: section.accent }}>{section.sidebarLabel}</span> · Step {stepIdx + 1} of {section.steps.length}:
              <span className="font-normal text-gray-600 ml-1">{step.action || step.instruction.slice(0, 45) + '...'}</span>
            </p>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={goPrev}
              disabled={sectionIdx === 0 && stepIdx === 0}
              className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              title="Previous Step"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={goNext}
              className="p-1 rounded text-gray-500 hover:bg-gray-100"
              title="Next Step"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm ml-1"
              style={{ background: section.accent }}
            >
              <Maximize2 size={11} /> Expand Tour
            </button>
            <button onClick={endTour} className="p-1 rounded text-gray-400 hover:text-gray-600 ml-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVE EXPANDED TOUR CARD (DRAGGABLE & UNBLOCKING) ── */}
      {isActive && !isMinimized && (
        <div
          className="fixed z-50 w-[340px] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-3 duration-300"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            border: '1px solid #e5e7eb',
            boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.24)' : '0 8px 40px rgba(0,0,0,0.16)',
            transition: isDragging ? 'none' : 'box-shadow 0.2s',
          }}
        >
          {/* Drag Handle & Coloured Header */}
          <div
            onMouseDown={onMouseDown}
            className="px-4 py-2.5 flex items-center justify-between gap-2 select-none cursor-move"
            style={{ background: section.bg, borderBottom: `2px solid ${section.accent}22` }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripHorizontal size={14} className="text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: section.accent }}>
                  {section.sidebarLabel} · Step {stepIdx + 1} of {section.steps.length}
                </p>
                <p className="text-[13px] font-bold text-gray-900 leading-snug truncate">{section.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
                title="Minimize (Dock to Bottom)"
              >
                <Minimize2 size={13} />
              </button>
              <button
                onClick={() => setIsPlaying(p => !p)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={endTour}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
                title="Close Walkthrough"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Drag Hint Bar */}
          <div className="bg-gray-50 px-3 py-1 border-b border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><Move size={10} /> Drag header to reposition</span>
            <button onClick={() => setIsMinimized(true)} className="text-blue-600 hover:underline font-semibold">
              Minimize to unblock UI
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-[3px] bg-gray-100">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((absoluteIdx + 1) / totalSteps) * 100}%`,
                background: section.accent,
              }}
            />
          </div>

          <div className="p-4">
            {/* Instruction */}
            <p className="text-[13px] text-gray-700 leading-relaxed mb-3">
              {step.instruction}
            </p>

            {/* Action box */}
            {step.action && (
              <div
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl mb-3 border"
                style={{ background: `${section.accent}08`, borderColor: `${section.accent}25` }}
              >
                <MousePointerClick size={14} className="shrink-0 mt-0.5" style={{ color: section.accent }} />
                <p className="text-[12px] font-semibold leading-relaxed" style={{ color: section.accent }}>
                  {step.action}
                </p>
              </div>
            )}

            {/* Tip */}
            {step.tip && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 mb-3">
                <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">{step.tip}</p>
              </div>
            )}

            {/* Section jump dots */}
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              {SECTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => jumpToSection(i)}
                  title={s.title}
                  className="rounded-full transition-all"
                  style={{
                    width: i === sectionIdx ? '20px' : '7px',
                    height: '7px',
                    background: i === sectionIdx
                      ? section.accent
                      : i < sectionIdx
                        ? '#d1d5db'
                        : '#e5e7eb',
                  }}
                />
              ))}
            </div>

            {/* Final CTA */}
            {isLastStep ? (
              <div className="space-y-2 pt-1">
                <a
                  href="https://wa.me/917004283531?text=Hi!%20I%20completed%20the%20StreamKart%20CRM%20walkthrough.%20I%20want%20to%20discuss%20building%20a%20custom%20CRM%20for%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(90deg,#16a34a,#059669)' }}
                >
                  Contact us on WhatsApp <ArrowRight size={14} />
                </a>
                <button
                  onClick={endTour}
                  className="w-full text-center text-[12px] text-gray-400 hover:text-gray-600 py-1"
                >
                  Close Walkthrough
                </button>
              </div>
            ) : (
              /* Nav controls */
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={goPrev}
                    disabled={sectionIdx === 0 && stepIdx === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronLeft size={13} /> Back
                  </button>
                  <button
                    onClick={endTour}
                    className="px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2"
                  >
                    Skip
                  </button>
                </div>

                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-bold text-white shadow-sm"
                  style={{ background: section.accent }}
                >
                  {stepIdx < section.steps.length - 1 ? 'Next' : `Next: ${SECTIONS[sectionIdx + 1]?.sidebarLabel}`}
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
