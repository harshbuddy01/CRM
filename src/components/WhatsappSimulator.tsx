'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Smartphone, Wifi, Battery, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MockMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  timestamp: Date;
  buttons?: string[];
  actionKey?: string;
}

const QUICK_CHIPS = [
  '📋 Features',
  '💰 Pricing',
  '🌴 Plan a Trip',
  '🤝 B2B Portal',
  '📱 WhatsApp API',
  '💳 Payment & Invoice',
  '👥 Team & Roles',
  '🆘 Support',
];

export default function WhatsappSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: 'welcome-1',
      sender: 'system',
      text: '👋 *Welcome to StreamKart Automated WhatsApp Demo!*\n\nThis simulator demonstrates how your travel agency can automate client notifications, proposals, and lead follow-ups via WhatsApp.',
      timestamp: new Date(Date.now() - 60000),
      buttons: ['📋 View Features', '💰 Pricing Plans', '🌴 Sample Proposal'],
    },
    {
      id: 'welcome-2',
      sender: 'system',
      text: '💡 *Try it out:* Select a quick topic below or type any question to test our AI-assisted auto-responder!',
      timestamp: new Date(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Listen to custom window events triggered from other parts of the CRM
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{
        text: string;
        buttons?: string[];
        actionKey?: string;
      }>;

      const newMsg: MockMessage = {
        id: Math.random().toString(),
        sender: 'system',
        text: customEvent.detail.text,
        timestamp: new Date(),
        buttons: customEvent.detail.buttons,
        actionKey: customEvent.detail.actionKey,
      };

      setMessages((prev) => [...prev, newMsg]);
      setHasNew(true);
      setTimeout(() => setIsOpen(true), 300);
    };

    window.addEventListener('crm-whatsapp-trigger', handleNotification);
    return () => window.removeEventListener('crm-whatsapp-trigger', handleNotification);
  }, []);

  const generateReply = (userText: string): { replyText: string; replyButtons?: string[] } => {
    const lower = userText.toLowerCase();

    if (/hi|hello|hey|good\s*(morning|afternoon|evening)/i.test(lower)) {
      return {
        replyText: '👋 Hello! Welcome to *StreamKart TravelCRM*.\n\nHow can we help automate your travel agency operations today?',
        replyButtons: ['📋 View Features', '💰 View Pricing', '📞 Contact Team'],
      };
    }

    if (/price|cost|rate|plan|subscription|pricing|payment/i.test(lower)) {
      return {
        replyText: '💰 *StreamKart TravelCRM Pricing*\n\n• *Starter:* ₹1,499/mo (Up to 5 Users)\n• *Professional:* ₹2,999/mo (WhatsApp API + B2B Portal)\n• *Enterprise:* Custom Pricing (Unlimited Users & Custom Domain)\n\nEmail *support@streamkart.shop* for custom setup!',
        replyButtons: ['📋 Feature Comparison', '🚀 Request Setup'],
      };
    }

    if (/feature|capability|tool|integration|what\s*can/i.test(lower)) {
      return {
        replyText: '🚀 *StreamKart CRM Key Features*\n\n1. 📋 *Lead Pipeline* — Auto round-robin assignment\n2. ✈️ *Itinerary Builder* — 1-click PDF generation\n3. 📱 *WhatsApp Automation* — Automated client updates\n4. 🤝 *B2B Agent Portal* — Custom markups & commissions\n5. 💰 *Invoicing & Finance* — GST billing & Razorpay\n6. 📊 *Analytics* — Real-time performance dashboards',
        replyButtons: ['🌴 Sample Proposal', '🤝 B2B Portal', '💰 Pricing Plans'],
      };
    }

    if (/itinerary|trip|proposal|bali|goa|maldives|dubai|thailand|europe|manali|kashmir/i.test(lower)) {
      return {
        replyText: '🌴 *AI Itinerary & Proposal Builder*\n\nStreamKart converts client preferences into luxury day-wise PDF proposals with flights, hotels, and cabs auto-calculated.\n\n✨ *Demo feature:* Go to any lead in the CRM and click "Create Proposal" to test the drag-and-drop builder!',
        replyButtons: ['📋 View Features', '💰 View Pricing'],
      };
    }

    if (/agent|b2b|commission|partner|wholesale|markup/i.test(lower)) {
      return {
        replyText: '🤝 *B2B Travel Agent Portal*\n\nGive your sub-agents their own login panel! They can set custom markups, view live commissions, and generate co-branded proposals with their own company logo.',
        replyButtons: ['📋 Features Overview', '📞 Schedule Demo'],
      };
    }

    if (/whatsapp|api|broadcast|automation|template/i.test(lower)) {
      return {
        replyText: '📱 *Official WhatsApp Business API*\n\nSend automated booking confirmations, payment receipts, vouchers, and promotional broadcasts directly to your client\'s WhatsApp with high open rates (98%+).',
        replyButtons: ['💰 View Pricing', '🚀 Request Setup'],
      };
    }

    if (/booking|reservation|hotel|flight|visa|voucher/i.test(lower)) {
      return {
        replyText: '🚌 *Tour Dispatch & Vouchers*\n\nGenerate hotel vouchers, transport manifests, and driver assignment sheets in 1-click. Email or WhatsApp them directly to your suppliers!',
        replyButtons: ['📋 Features Overview', '🌴 Sample Proposal'],
      };
    }

    if (/invoice|billing|ledger|receipt|gst|outstanding/i.test(lower)) {
      return {
        replyText: '💳 *Invoicing & GST Billing*\n\nGenerate GST-compliant invoices with custom branding, track part-payments, and send online payment links (Razorpay/UPI) automatically.',
        replyButtons: ['💰 Pricing Plans', '📞 Contact Support'],
      };
    }

    if (/team|staff|employee|role|permission/i.test(lower)) {
      return {
        replyText: '👥 *Team Management & Security*\n\nAssign granular roles (Admin, Sales, Operations, Viewer) with branch-level access control. Keep your customer data safe and track team productivity.',
        replyButtons: ['📋 View Features', '💰 View Pricing'],
      };
    }

    if (/thank|thanks|great|awesome|good/i.test(lower)) {
      return {
        replyText: '😊 You\'re very welcome! Feel free to ask any other questions about StreamKart TravelCRM.',
        replyButtons: ['📋 View Features', '💰 View Pricing'],
      };
    }

    if (/bye|goodbye/i.test(lower)) {
      return {
        replyText: '👋 Goodbye! Have a great day exploring StreamKart TravelCRM demo.',
      };
    }

    // Generic fallback
    return {
      replyText: `Thanks for asking about "${userText}"!\n\nThis is a live demonstration of StreamKart's automated CRM responder. For complete details, feel free to reach out to our team at *support@streamkart.shop*.`,
      replyButtons: ['📋 View Features', '💰 View Pricing', '🤝 B2B Portal'],
    };
  };

  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate typing delay for AI response
    setTimeout(() => {
      const { replyText, replyButtons } = generateReply(textToSend);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          text: replyText,
          timestamp: new Date(),
          buttons: replyButtons,
        },
      ]);
    }, 800);
  };

  const handleChipClick = (chipText: string) => {
    const cleanText = chipText.replace(/^[^\w]+/, '').trim();
    handleSendText(cleanText);
  };

  const handleActionButton = (btnText: string) => {
    const userReply: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: `Selected: "${btnText}"`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userReply]);
    setIsTyping(true);

    setTimeout(() => {
      const clean = btnText.replace(/^[^\w]+/, '').trim();
      const { replyText, replyButtons } = generateReply(clean);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          text: replyText,
          timestamp: new Date(),
          buttons: replyButtons,
        },
      ]);
    }, 700);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNew(false);
        }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center gap-2 border-2 border-white/20"
        title="WhatsApp Simulator"
      >
        <Smartphone className="h-6 w-6" />
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
          "fixed bottom-24 right-6 z-50 w-[360px] h-[640px] bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-[44px] shadow-2xl transition-all duration-500 transform p-3 select-none",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* iPhone Speaker Notch */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
        </div>

        {/* Inner Phone Screen */}
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
              <div className="w-9 h-9 rounded-full bg-emerald-800 border border-white/20 flex items-center justify-center font-extrabold text-xs tracking-wider">
                SK
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-xs">StreamKart CRM Demo</h3>
                <span className="text-[10px] text-emerald-100/90 block truncate max-w-[170px]">
                  support@streamkart.shop
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

          {/* Chat Messages Body */}
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
                  "flex flex-col max-w-[88%] rounded-lg p-2.5 shadow-sm text-[11px] leading-relaxed",
                  msg.sender === 'system'
                    ? "bg-white text-slate-800 self-start rounded-tl-none border border-slate-100"
                    : "bg-[#dcf8c6] text-slate-900 self-end rounded-tr-none"
                )}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Simulated Interactive Buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    {msg.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionButton(btn)}
                        className="w-full py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-center border border-emerald-200/60 active:scale-95 transition-all text-[10px]"
                      >
                        {btn}
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
                <span>StreamKart CRM is typing...</span>
              </div>
            )}
          </div>

          {/* Quick Topics Chips */}
          <div className="bg-[#e5ddd5] px-2 py-1.5 border-t border-slate-300/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(chip)}
                className="whitespace-nowrap px-2.5 py-0.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-full text-[10px] font-semibold border border-slate-300/80 shadow-2xs transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-slate-200">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText(inputVal)}
              className="flex-grow bg-white border border-slate-300 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              onClick={() => handleSendText(inputVal)}
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
