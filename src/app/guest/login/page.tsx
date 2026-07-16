'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function GuestLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'username' | 'pin'>('username');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'pin') inputRefs.current[0]?.focus();
  }, [step]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleUsernameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setStep('pin');
  };

  const handleLogin = async () => {
    const fullPin = pin.join('');
    if (fullPin.length < 6) { toast.error('Enter your 6-digit PIN'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/public/guest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), pin: fullPin }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Invalid credentials');
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Store tourCode in sessionStorage, redirect to portal
      sessionStorage.setItem('guest_tourCode', data.data.tourCode);
      sessionStorage.setItem('guest_name', data.data.guestName);
      router.push(`/guest/${data.data.tourCode}`);
    } catch {
      toast.error('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 font-sans">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Trip Portal</h1>
          <p className="text-sm text-blue-200/70 mt-1">Imagica Holidays • Secure Access</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Username ── */}
            {step === 'username' && (
              <motion.form
                key="username"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleUsernameNext}
                className="space-y-6"
              >
                <div>
                  <p className="text-white/80 text-sm font-semibold mb-4">Enter your Login ID</p>
                  <input
                    type="text"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ananya@TUR-2026-001"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                  <p className="text-white/40 text-xs mt-2">Your Login ID was shared with you via WhatsApp after booking confirmation.</p>
                </div>
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* ── Step 2: PIN ── */}
            {step === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <button onClick={() => setStep('username')} className="text-blue-300 text-xs font-semibold mb-4 hover:text-blue-200 transition-colors flex items-center gap-1">
                    ← Change Login ID
                  </button>
                  <p className="text-white/80 text-sm font-semibold mb-1">Enter your 6-digit PIN</p>
                  <p className="text-white/40 text-xs">Logging in as <span className="text-blue-300 font-bold">{username}</span></p>
                </div>

                {/* PIN Input Boxes */}
                <div className="flex justify-between gap-2">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        digit
                          ? 'bg-blue-600/30 border-blue-400 text-white'
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading || pin.join('').length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>View My Trip <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Need help? Call us at <a href="tel:+919876543210" className="underline text-white/50">+91 98765 43210</a>
        </p>
      </motion.div>
    </div>
  );
}
