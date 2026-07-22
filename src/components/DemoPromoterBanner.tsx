'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Sparkles, X, ChevronRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DemoPromoterBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agency, setAgency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto show promoter banner after 12 seconds to capture intent
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Please enter your name and contact phone number');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCallbackOpen(false);
      toast.success('VIP Demo Setup Requested! 🚀', {
        description: 'Our lead implementation specialist will call you on ' + phone + ' in 15 minutes.',
      });

      // Dispatch event to show in WhatsApp simulator
      window.dispatchEvent(
        new CustomEvent('crm-whatsapp-trigger', {
          detail: {
            text: `🎉 *VIP Live Setup Requested!*\n\n*Name:* ${name}\n*Agency:* ${agency || 'Travel Agency'}\n*Phone:* ${phone}\n\nOur founder team has been notified and will call you shortly.`,
            buttons: ['Call Founder Direct', 'Request Custom Pricing']
          }
        })
      );
    }, 800);
  };

  return (
    <>
      {/* Floating Promotional Bar */}
      {isVisible && (
        <div className="fixed bottom-6 left-6 z-40 max-w-md bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 transition-all duration-500 animate-in slide-in-from-bottom-8">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            title="Dismiss promotion"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Exclusive Offer
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Guaranteed Setup
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 leading-snug">
                Want StreamKart CRM Customized For Your Travel Business?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Get full white-label setup, automated WhatsApp API, custom itinerary templates & 24/7 priority support.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <a
              href="https://wa.me/917004283531?text=Hi!%20I%20tested%20the%20StreamKart%20CRM%20Demo%20and%20want%20to%20book%20a%20live%20onboarding%20setup."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp Direct
            </a>

            <Button
              onClick={() => setIsCallbackOpen(true)}
              variant="outline"
              className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 font-bold text-xs rounded-xl h-9"
            >
              <Phone className="h-3.5 w-3.5 text-teal-400" />
              Book Live Call
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Modal for Callback Request */}
      <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
        <DialogContent className="sm:max-w-md border-slate-800 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-emerald-400" />
              Schedule 1-on-1 VIP Onboarding
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Leave your details below and our senior implementation team will contact you directly to demonstrate how StreamKart can scale your agency sales by 3x.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestCallback} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name *</label>
              <Input
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number (WhatsApp) *</label>
              <Input
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Agency / Company Name</label>
              <Input
                placeholder="e.g. Royal Travels Pvt Ltd"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> What you get in full setup:
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pl-1">
                <li>Dedicated Meta WhatsApp Business API Approval</li>
                <li>Unlimited PDF Itinerary & Quotation Builder</li>
                <li>B2B Partner Agent Portal with Commission Tracking</li>
                <li>Custom Branding & Domain Integration</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold h-11 text-sm shadow-lg rounded-xl"
            >
              {isSubmitting ? 'Submitting Request...' : 'Confirm 1-on-1 Onboarding Call 🚀'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
