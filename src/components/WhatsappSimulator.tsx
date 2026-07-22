'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Smartphone, Wifi, Battery, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MockMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  timestamp: Date;
  buttons?: string[];
  actionKey?: string;
}

export default function WhatsappSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: 'init',
      sender: 'system',
      text: 'Welcome to StreamKart Live Notification Simulator! 📱 Actions you take in this CRM will trigger mock WhatsApp alerts here.',
      timestamp: new Date(),
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [hasNew, setHasNew] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

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
        actionKey: customEvent.detail.actionKey
      };

      setMessages((prev) => [...prev, newMsg]);
      setHasNew(true);
      
      // Auto-open simulator on new message so the user notices it
      setTimeout(() => setIsOpen(true), 300);
    };

    window.addEventListener('crm-whatsapp-trigger', handleNotification);
    return () => window.removeEventListener('crm-whatsapp-trigger', handleNotification);
  }, []);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userText = inputVal.trim();
    const userMsg: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Intelligent AI response logic for demo users
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let replyText = "Thanks for your message! This is a live demonstration of StreamKart's automated WhatsApp CRM integration.";
      let replyButtons: string[] = ['Book Live Demo 🚀', 'View Itinerary Sample', 'Contact Founder'];

      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('plan')) {
        replyText = "💰 *StreamKart TravelCRM Demo Pricing*\n\n• *Starter Plan:* ₹1,499/mo (Up to 5 Users)\n• *Enterprise Edition:* Custom Pricing (Unlimited Users + Custom Domain)\n\nWould you like our team to send you a formal quotation via WhatsApp?";
        replyButtons = ['Get Quotation', 'Call Founder Direct'];
      } else if (lower.includes('itinerary') || lower.includes('proposal') || lower.includes('bali') || lower.includes('goa')) {
        replyText = "🌴 *AI Itinerary Generator Status*\n\nStreamKart automatically converts client preferences into 3-day luxury PDF proposals complete with day-wise hotels, activities, and pricing!";
        replyButtons = ['Generate 3-Day Bali Trip', 'Share via WhatsApp'];
      } else if (lower.includes('b2b') || lower.includes('agent') || lower.includes('commission')) {
        replyText = "🤝 *B2B Agent Portal Active*\n\nYour B2B agents can log in, set custom markups, view live commissions, and print co-branded client proposals with their own logo!";
        replyButtons = ['Open B2B Agent Studio', 'Talk to Sales'];
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('demo')) {
        replyText = "👋 Hello! Welcome to *StreamKart TravelCRM*.\n\nHow can we help automate your travel agency operations today?";
        replyButtons = ['Book Live Setup 🚀', 'Call Sales Team', 'Request Pricing'];
      }

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

  const handleActionButton = (btnText: string, actionKey?: string) => {
    const userReply: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: `Selected: "${btnText}"`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userReply]);

    if (actionKey) {
      window.dispatchEvent(
        new CustomEvent('crm-whatsapp-action', {
          detail: { buttonText: btnText, actionKey }
        })
      );
    }

    setTimeout(() => {
      let sysReply = `✅ *Action Confirmed:* "${btnText}"\n\nOur system has recorded your preference. To get instant setup, contact our founder team at +91 70042 83531.`;
      if (btnText.includes('Founder') || btnText.includes('Call') || btnText.includes('Setup') || btnText.includes('Book')) {
        window.open('https://wa.me/917004283531?text=Hi!%20I%20am%20testing%20the%20StreamKart%20CRM%20Demo%20and%20want%20to%20book%20a%20live%20setup.', '_blank');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          text: sysReply,
          timestamp: new Date(),
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNew(false);
        }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center gap-2 border-2 border-white/20"
        title="WhatsApp Simulator"
      >
        <Smartphone className="h-6 w-6" />
        <span className="hidden md:inline font-bold text-sm tracking-wide">WhatsApp Simulator</span>
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
          "fixed bottom-24 right-6 z-50 w-[350px] h-[650px] bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-[48px] shadow-2xl transition-all duration-500 transform p-3",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* iPhone Outer Speaker / Camera Notch */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
        </div>

        {/* Inner Phone Screen */}
        <div className="relative w-full h-full bg-[#efeae2] rounded-[38px] overflow-hidden flex flex-col border border-black/20">
          
          {/* Top Status Bar */}
          <div className="h-10 bg-[#075e54] text-white flex items-center justify-between px-6 pt-3 text-xs font-semibold select-none">
            <span>04:09</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3" />
              <span className="text-[10px]">5G</span>
              <Battery className="h-4 w-4" />
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/60 border border-white/20 flex items-center justify-center font-bold text-sm">
                SK
              </div>
              <div>
                <h3 className="font-bold text-sm">StreamKart Automated</h3>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            ref={scrollRef}
            className="flex-grow p-4 overflow-y-auto space-y-3"
            style={{
              backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
              backgroundSize: 'contain'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-2.5 shadow-sm text-xs",
                  msg.sender === 'system'
                    ? "bg-white text-slate-800 self-start rounded-tl-none"
                    : "bg-[#dcf8c6] text-slate-800 self-end rounded-tr-none"
                )}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                
                {/* Simulated Interactive WhatsApp Buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="mt-3.5 pt-2 border-t border-slate-100 flex flex-col gap-2">
                    {msg.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionButton(btn, msg.actionKey)}
                        className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-emerald-600 font-bold rounded text-center border border-slate-200 active:scale-95 transition-all text-[11px]"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-[8px] text-slate-400 text-right mt-1 block flex items-center justify-end gap-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender === 'system' && <CheckCheck className="h-3 w-3 text-sky-500" />}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-slate-200">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-white border border-slate-300 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 h-auto w-auto aspect-square flex items-center justify-center"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
