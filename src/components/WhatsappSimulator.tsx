'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Wifi, Battery, CheckCheck, Loader2, X, Send, 
  Sparkles, ArrowRight, FileText, CheckCircle2, DollarSign, 
  MessageSquare, Zap, ExternalLink, ShieldCheck, MapPin, Calendar, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CardData {
  type: 'proposal' | 'lead' | 'invoice' | 'pricing' | 'b2b';
  title: string;
  subtitle?: string;
  details: { label: string; value: string }[];
  tag?: string;
  badgeColor?: string;
}

interface MockMessage {
  id: string;
  sender: 'system' | 'user';
  text?: string;
  card?: CardData;
  timestamp: Date;
  buttons?: { label: string; action: string }[];
}

const QUICK_CHIPS = [
  '🌴 Bali Proposal Demo',
  '🔔 Live Lead Alert',
  '💰 Pricing & Plans',
  '💳 GST Invoice & Link',
  '🤝 B2B Agent Portal',
  '📱 WhatsApp API Overview',
];

export default function WhatsappSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCallout, setShowCallout] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [inputVal, setInputVal] = useState('');
  
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: 'welcome-1',
      sender: 'system',
      text: '👋 *Welcome to StreamKart Automated WhatsApp AI Assistant!*\n\nThis simulator shows how your travel agency automates client enquiries, PDF proposals, and payment links via WhatsApp in real time.',
      timestamp: new Date(Date.now() - 120000),
      buttons: [
        { label: '🌴 Try Bali Proposal Demo', action: 'proposal_demo' },
        { label: '🔔 Test Live Lead Alert', action: 'lead_demo' },
        { label: '💰 View Pricing & Plans', action: 'pricing_demo' },
      ],
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Listen to custom window events triggered from CRM
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{
        text?: string;
        card?: CardData;
        buttons?: { label: string; action: string }[];
      }>;

      const newMsg: MockMessage = {
        id: Math.random().toString(),
        sender: 'system',
        text: customEvent.detail.text,
        card: customEvent.detail.card,
        timestamp: new Date(),
        buttons: customEvent.detail.buttons,
      };

      setMessages((prev) => [...prev, newMsg]);
      setHasNew(true);
      setTimeout(() => {
        setIsOpen(true);
        setShowCallout(false);
      }, 300);
    };

    window.addEventListener('crm-whatsapp-trigger', handleNotification);
    return () => window.removeEventListener('crm-whatsapp-trigger', handleNotification);
  }, []);

  const handleAction = (actionKey: string, labelText: string) => {
    // Record user click
    const userMsg: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: labelText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let responseMsg: MockMessage;

      switch (actionKey) {
        case 'proposal_demo':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '🌴 *5-Day Luxury Bali Itinerary Generated!*\n\nOur AI system has auto-built this customized PDF proposal for your client:',
            card: {
              type: 'proposal',
              title: '🌴 Bali Tropical Getaway (5D/4N)',
              subtitle: 'Client: Ankit & Riya Sharma',
              tag: 'READY TO SEND',
              badgeColor: 'bg-emerald-500',
              details: [
                { label: 'Hotel', value: 'The Seminyak Beach Resort (5★)' },
                { label: 'Flights', value: 'IndiGo Direct (DEL - DPS)' },
                { label: 'Activities', value: 'Nusa Penida & Sunset Cruise' },
                { label: 'Total Price', value: '₹98,500 (Incl. 5% GST)' },
              ],
            },
            timestamp: new Date(),
            buttons: [
              { label: '📄 Send PDF to Client WhatsApp', action: 'send_pdf_confirm' },
              { label: '💳 Send Razorpay Payment Link', action: 'invoice_demo' },
            ],
          };
          break;

        case 'lead_demo':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '🔔 *NEW ENQUIRY RECEIVED via Website*',
            card: {
              type: 'lead',
              title: 'New Lead: Rohan Malhotra',
              subtitle: 'Source: Google Ads Campaign',
              tag: 'AUTO-ASSIGNED',
              badgeColor: 'bg-indigo-500',
              details: [
                { label: 'Destination', value: 'Maldives Overwater Villa' },
                { label: 'Travel Dates', value: '15 Oct – 20 Oct 2026' },
                { label: 'Budget', value: '₹2.5 Lakhs' },
                { label: 'Assigned To', value: 'Rahul (Senior Sales)' },
              ],
            },
            timestamp: new Date(),
            buttons: [
              { label: '⚡ Trigger Auto WhatsApp Greeting', action: 'trigger_greeting' },
              { label: '🌴 Generate Itinerary', action: 'proposal_demo' },
            ],
          };
          break;

        case 'invoice_demo':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '💳 *GST Invoice #INV-2026-409 Created*',
            card: {
              type: 'invoice',
              title: 'Tax Invoice #INV-2026-409',
              subtitle: 'StreamKart Travel Services',
              tag: 'PAYMENT PENDING',
              badgeColor: 'bg-amber-500',
              details: [
                { label: 'Package', value: 'Bali 5D/4N Package' },
                { label: 'Base Amount', value: '₹93,809' },
                { label: 'GST (5%)', value: '₹4,691' },
                { label: 'Total Due', value: '₹98,500' },
              ],
            },
            timestamp: new Date(),
            buttons: [
              { label: '✅ Mark Payment Received', action: 'payment_received' },
              { label: '💰 Pricing & Subscription', action: 'pricing_demo' },
            ],
          };
          break;

        case 'pricing_demo':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '💰 *StreamKart TravelCRM Subscription Plans*',
            card: {
              type: 'pricing',
              title: 'Transparent Pricing Plans',
              subtitle: 'No hidden setup fees',
              tag: 'POPULAR: PRO',
              badgeColor: 'bg-purple-600',
              details: [
                { label: 'Starter Plan', value: '₹1,499/mo (Up to 5 Users)' },
                { label: 'Pro Plan', value: '₹2,999/mo (WhatsApp API + B2B)' },
                { label: 'Enterprise', value: 'Custom (Unlimited Users)' },
                { label: 'Support', value: '24/7 Dedicated Account Mgr' },
              ],
            },
            timestamp: new Date(),
            buttons: [
              { label: '🤝 B2B Agent Demo', action: 'b2b_demo' },
              { label: '📞 Contact Support', action: 'contact_support' },
            ],
          };
          break;

        case 'b2b_demo':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '🤝 *B2B Partner Portal Active*',
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
            timestamp: new Date(),
            buttons: [
              { label: '🌴 Bali Proposal Demo', action: 'proposal_demo' },
              { label: '💰 View Pricing Plans', action: 'pricing_demo' },
            ],
          };
          break;

        case 'send_pdf_confirm':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '✅ *PDF Proposal Sent Successfully!*\n\nThe proposal link has been delivered to client\'s WhatsApp.\n\n📱 *Client View Preview:* "Hi Ankit! Here is your custom Bali trip proposal: https://streamkart.shop/proposal/view?id=8812"\n\nClient has opened the PDF link 2 minutes ago! 🚀',
            timestamp: new Date(),
            buttons: [
              { label: '💳 Generate Invoice', action: 'invoice_demo' },
              { label: '🔔 Test Live Lead Alert', action: 'lead_demo' },
            ],
          };
          break;

        case 'trigger_greeting':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '⚡ *Auto WhatsApp Greeting Fired!*\n\n"Hi Rohan! Thank you for enquiring about Maldives with StreamKart Travels. Our Maldives specialist Rahul has been assigned to your query and will share custom options shortly."\n\n✅ *Status: Delivered & Read (Blue Ticks)*',
            timestamp: new Date(),
            buttons: [
              { label: '🌴 Generate Itinerary', action: 'proposal_demo' },
              { label: '🤝 B2B Agent Demo', action: 'b2b_demo' },
            ],
          };
          break;

        case 'payment_received':
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: '🎉 *Payment Received Alert!*\n\n₹98,500 collected via Razorpay UPI!\n\n✅ Invoice status updated to *PAID*\n✅ Tour Voucher auto-generated for driver & hotel\n✅ Confirmation receipt sent to client via WhatsApp',
            timestamp: new Date(),
            buttons: [
              { label: '🌴 Test Another Proposal', action: 'proposal_demo' },
              { label: '💰 Pricing & Setup', action: 'pricing_demo' },
            ],
          };
          break;

        default:
          responseMsg = {
            id: Math.random().toString(),
            sender: 'system',
            text: `Thanks for testing "${labelText}"!\n\nStreamKart TravelCRM automates your entire agency workflow from lead capture to tour dispatch. Contact us at *support@streamkart.shop* for a full live walkthrough!`,
            timestamp: new Date(),
            buttons: [
              { label: '🌴 Bali Proposal Demo', action: 'proposal_demo' },
              { label: '💰 View Pricing & Plans', action: 'pricing_demo' },
            ],
          };
      }

      setMessages((prev) => [...prev, responseMsg]);
    }, 700);
  };

  const handleSendInput = () => {
    if (!inputVal.trim()) return;
    const text = inputVal.trim();
    setInputVal('');

    const lower = text.toLowerCase();
    let actionKey = 'generic';

    if (lower.includes('bali') || lower.includes('proposal') || lower.includes('itinerary') || lower.includes('trip')) actionKey = 'proposal_demo';
    else if (lower.includes('lead') || lower.includes('enquiry') || lower.includes('query')) actionKey = 'lead_demo';
    else if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) actionKey = 'pricing_demo';
    else if (lower.includes('invoice') || lower.includes('payment') || lower.includes('billing')) actionKey = 'invoice_demo';
    else if (lower.includes('b2b') || lower.includes('agent') || lower.includes('partner')) actionKey = 'b2b_demo';

    handleAction(actionKey, text);
  };

  return (
    <>
      {/* Eye-Catching Callout Badge with Arrow pointing to WhatsApp button */}
      {!isOpen && showCallout && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 animate-bounce">
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/30 flex items-center gap-2 max-w-[280px]">
            <Sparkles className="h-4 w-4 text-amber-300 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
            <div>
              <p className="leading-tight text-[11px]">
                <span className="text-amber-300">Live AI Assistant:</span> Test interactive WhatsApp workflow!
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowCallout(false); }}
              className="text-white/70 hover:text-white p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Speech Bubble Arrow pointing down-right */}
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-teal-600"></div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowCallout(false);
          setHasNew(false);
        }}
        className="fixed bottom-6 right-6 z-50 p-3.5 md:p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center gap-2 border-2 border-white/30 group"
        title="Interactive WhatsApp Demo"
      >
        <Smartphone className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline font-bold text-sm tracking-wide">WhatsApp Demo</span>
        {hasNew && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center font-bold">1</span>
          </span>
        )}
      </button>

      {/* Simulator Panel / CSS iPhone Mockup */}
      <div
        className={cn(
          "fixed bottom-24 right-4 md:right-6 z-50 w-[350px] md:w-[370px] h-[640px] bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-[44px] shadow-2xl transition-all duration-500 transform p-2.5 select-none",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* iPhone Notch */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
        </div>

        {/* Phone Screen */}
        <div className="relative w-full h-full bg-[#efeae2] rounded-[34px] overflow-hidden flex flex-col border border-black/20">

          {/* Top Status Bar */}
          <div className="h-9 bg-[#075e54] text-white flex items-center justify-between px-6 pt-2 text-[11px] font-semibold">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3" />
              <span className="text-[9px]">5G</span>
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white p-2.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-800 border border-white/30 flex items-center justify-center font-extrabold text-xs tracking-wider">
                SK
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-xs">StreamKart TravelCRM AI</h3>
                <span className="text-[10px] text-emerald-100/90 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Demo Simulator
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={scrollRef}
            className="flex-grow p-3 overflow-y-auto space-y-2.5"
            style={{
              backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
              backgroundSize: 'contain',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[90%] rounded-xl p-2.5 shadow-xs text-[11px] leading-relaxed",
                  msg.sender === 'system'
                    ? "bg-white text-slate-800 self-start rounded-tl-none border border-slate-200/80"
                    : "bg-[#dcf8c6] text-slate-900 self-end rounded-tr-none"
                )}
              >
                {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                {/* Structured Rich Card */}
                {msg.card && (
                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{msg.card.title}</h4>
                        {msg.card.subtitle && (
                          <span className="text-[9px] text-slate-500 block">{msg.card.subtitle}</span>
                        )}
                      </div>
                      {msg.card.tag && (
                        <span className={cn("text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider", msg.card.badgeColor || 'bg-emerald-500')}>
                          {msg.card.tag}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      {msg.card.details.map((d, idx) => (
                        <div key={idx} className="bg-white p-1.5 rounded border border-slate-100">
                          <span className="text-[8px] text-slate-400 uppercase font-semibold block">{d.label}</span>
                          <span className="font-bold text-slate-800 block truncate">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    {msg.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(btn.action, btn.label)}
                        className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-center border border-emerald-200/80 active:scale-95 transition-all text-[10px] flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Zap className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[8px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender === 'system' && <CheckCheck className="h-3 w-3 text-sky-500" />}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="bg-white text-slate-500 self-start rounded-lg rounded-tl-none p-2 shadow-sm border border-slate-100 text-[10px] flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                <span>StreamKart AI is simulating response...</span>
              </div>
            )}
          </div>

          {/* Quick Chips */}
          <div className="bg-[#e5ddd5] px-2 py-1.5 border-t border-slate-300/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => {
                  let act = 'generic';
                  if (chip.includes('Bali')) act = 'proposal_demo';
                  else if (chip.includes('Lead')) act = 'lead_demo';
                  else if (chip.includes('Pricing')) act = 'pricing_demo';
                  else if (chip.includes('Invoice')) act = 'invoice_demo';
                  else if (chip.includes('B2B')) act = 'b2b_demo';
                  handleAction(act, chip);
                }}
                className="whitespace-nowrap px-2 py-0.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-full text-[9px] font-bold border border-slate-300/80 shadow-2xs transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-slate-200">
            <input
              type="text"
              placeholder="Ask anything or click a quick action..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendInput()}
              className="flex-grow bg-white border border-slate-300 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              onClick={handleSendInput}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
