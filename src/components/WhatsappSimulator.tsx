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
    const userMsg: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputVal,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Simple auto-reply simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          text: "Thanks for your message! This is a demo simulator showing how WhatsApp automation works.",
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const handleActionButton = (btnText: string, actionKey?: string) => {
    // Simulate user clicking a WhatsApp interactive button
    const userReply: MockMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: `Selected: "${btnText}"`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userReply]);

    // Dispatch another event to notify the CRM that the action happened
    if (actionKey) {
      window.dispatchEvent(
        new CustomEvent('crm-whatsapp-action', {
          detail: { buttonText: btnText, actionKey }
        })
      );
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          text: `✅ Action received! The CRM dashboard has been updated to reflect your response.`,
          timestamp: new Date(),
        },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNew(false);
        }}
        className="fixed bottom-6 left-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center gap-2 border-2 border-white/20"
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
          "fixed bottom-24 left-6 z-50 w-[350px] h-[650px] bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-[48px] shadow-2xl transition-all duration-500 transform p-3",
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
