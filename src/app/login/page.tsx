'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  PlaneTakeoff, GraduationCap, Users, Store, Building2, ArrowRight, Check, 
  X, ChevronRight, Shield, Clock, Zap, Star
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const INDUSTRIES = [
  { value: 'Travel Agency', label: '✈️ Travel Agency' },
  { value: 'Education Institute', label: '🎓 Education Institute / EdTech' },
  { value: 'B2B Distributor / Dealer', label: '🏬 B2B Distributor / Dealer Network' },
  { value: 'Real Estate', label: '🏠 Real Estate / Property' },
  { value: 'Healthcare / Clinic', label: '🏥 Healthcare / Clinic Chain' },
  { value: 'Retail / E-commerce', label: '🛍️ Retail / E-commerce Brand' },
  { value: 'Logistics / Transport', label: '🚚 Logistics / Transport Company' },
  { value: 'Events & Hospitality', label: '🎪 Events & Hospitality' },
  { value: 'Financial Services', label: '💰 Financial Services / NBFC' },
  { value: 'Other', label: '🏢 Other Business' },
];

const CRM_INDUSTRIES = [
  { icon: PlaneTakeoff, label: 'Travel Agencies', desc: 'Lead pipeline, proposals, GST invoicing, WhatsApp automation' },
  { icon: GraduationCap, label: 'Education & EdTech', desc: 'Admission CRM, fee collection, counsellor performance tracking' },
  { icon: Users, label: 'B2B Distributors', desc: 'Dealer portals, custom price lists, order management, commissions' },
  { icon: Store, label: 'Retail & E-commerce', desc: 'Customer tracking, repeat orders, loyalty programs, analytics' },
  { icon: Building2, label: 'Real Estate', desc: 'Site visits, follow-ups, broker payouts, project-wise dashboards' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorSessionId, setTwoFactorSessionId] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Trial form states
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialStep, setTrialStep] = useState(1);
  const [trialName, setTrialName] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [trialPhone, setTrialPhone] = useState('');
  const [trialBusiness, setTrialBusiness] = useState('');
  const [trialOtp, setTrialOtp] = useState('');
  const [trialSessionId, setTrialSessionId] = useState('');
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [isVerifyingTrial, setIsVerifyingTrial] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => { logout(); }, [logout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data;
      if (data.requires2FA) {
        setRequires2FA(true);
        setTwoFactorSessionId(data.twoFactorSessionId);
        toast.success('Verification code sent to your email.');
      } else {
        const { user, accessToken, refreshToken } = data;
        setAuth(user, accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; secure; samesite=strict`;
        toast.success(`Welcome back, ${user.name}`);
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.post('/auth/verify-2fa', { twoFactorSessionId, code });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; secure; samesite=strict`;
      toast.success(`Welcome back, ${user.name}`);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialBusiness) { toast.error('Please select your business type'); return; }
    setIsSubmittingTrial(true);
    try {
      const res = await api.post('/demo/signup', {
        name: trialName,
        email: trialEmail,
        phone: trialPhone,
        businessType: trialBusiness,
      });
      if (res.data.success) {
        setTrialSessionId(res.data.sessionId);
        setTrialStep(2);
        toast.success('OTP sent! Check your phone or use 123456');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start trial');
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  const handleTrialVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingTrial(true);
    try {
      const res = await api.post('/demo/verify-otp', { sessionId: trialSessionId, otp: trialOtp });
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; secure; samesite=strict`;
      toast.success(`Welcome, ${user.name}! Your 3-hour trial is now active.`);
      setShowTrialModal(false);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsVerifyingTrial(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0f1e' }}>
      
      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5" style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <PlaneTakeoff className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">StreamKart <span className="text-violet-400">CRM</span></span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://wa.me/917004283531" target="_blank" className="hidden md:flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <span>+91 70042 83531</span>
          </a>
          <a href="mailto:support@streamkart.shop" className="hidden md:flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            support@streamkart.shop
          </a>
          <button
            onClick={() => { setTrialStep(1); setShowTrialModal(true); }}
            className="px-4 py-2 text-sm font-bold text-black rounded-xl"
            style={{ background: 'linear-gradient(90deg,#34d399,#059669)' }}
          >
            Free 3-Hour Trial
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-16">

        {/* ── LEFT: MARKETING COLUMN ── */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
          
          {/* Hero */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-emerald-500/30 text-emerald-400" style={{ background: 'rgba(52,211,153,0.1)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Custom CRM for Every Business
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              We Build the <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Perfect CRM</span><br />for Your Business
            </h1>
            
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Whether you run a travel agency, education institute, B2B dealer network, or any sales-driven business — we design and deliver a custom-built CRM that fits your exact workflow. Not a template. Not a subscription. <strong className="text-white/90">Yours.</strong>
            </p>

            {/* Industry cards */}
            <div className="space-y-2.5 mb-8">
              {CRM_INDUSTRIES.map((ind) => (
                <div
                  key={ind.label}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/8 hover:border-white/20 transition-all cursor-default"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <ind.icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{ind.label}</p>
                    <p className="text-xs text-white/50">{ind.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/20 ml-auto" />
                </div>
              ))}
            </div>

            {/* Key benefits */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['100% Custom Built', 'Own Domain & Logo', 'WhatsApp API Integrated', 'GST Invoicing', '1-on-1 Onboarding', 'Indian Support Team'].map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-300 border border-emerald-500/20" style={{ background: 'rgba(52,211,153,0.08)' }}>
                  <Check className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/917004283531?text=Hi!%20I%20want%20to%20discuss%20building%20a%20custom%20CRM%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(90deg,#25d366,#128c7e)' }}
              >
                WhatsApp Us Now <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => { setTrialStep(1); setShowTrialModal(true); }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white/15 text-white hover:bg-white/5 transition-all"
              >
                <Clock className="h-4 w-4 text-violet-400" /> Try Live Demo — 3 Hours Free
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: LOGIN COLUMN ── */}
        <div className="flex items-center justify-center px-6 py-12 lg:w-[420px] lg:border-l border-white/8">
          <div className="w-full max-w-sm">
            
            {!requires2FA ? (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-extrabold text-white mb-1">Sign In</h2>
                  <p className="text-white/40 text-sm">Access your CRM dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 border border-white/10 outline-none focus:border-violet-500/60 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Password</label>
                      <a href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">Forgot?</a>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 border border-white/10 outline-none focus:border-violet-500/60 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In →'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-white/25 uppercase">or</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <button
                  onClick={() => { setTrialStep(1); setShowTrialModal(true); }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                  style={{ background: 'rgba(52,211,153,0.05)' }}
                >
                  🚀 Start Free 3-Hour Trial
                </button>

                <p className="text-center text-xs text-white/25 mt-6">
                  No credit card · Full feature access · Auto-expires in 3 hours
                </p>

                <div className="mt-8 pt-6 border-t border-white/8 flex flex-col gap-1.5 text-center">
                  <p className="text-xs text-white/30">Want a custom CRM? Reach us at:</p>
                  <a href="https://wa.me/917004283531" target="_blank" className="text-xs text-emerald-400 hover:underline">WhatsApp: +91 70042 83531</a>
                  <a href="mailto:support@streamkart.shop" className="text-xs text-white/40 hover:text-white/60">support@streamkart.shop</a>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-extrabold text-white mb-1">Verify Identity</h2>
                  <p className="text-white/40 text-sm">Enter the 6-digit code sent to <strong className="text-white/70">{email}</strong></p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-[0.5em] font-bold text-white border border-white/10 outline-none focus:border-violet-500/60"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    required autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                  <button type="button" onClick={() => { setRequires2FA(false); setCode(''); }} className="w-full text-center text-sm text-white/30 hover:text-white/60 py-1">
                    ← Back to Login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── FREE TRIAL MODAL ── */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="border-0 p-0 max-w-md overflow-hidden" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Modal header gradient */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)' }} />

          <div className="p-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-5">
              <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold', trialStep === 1 ? 'bg-violet-600 text-white' : 'bg-emerald-600 text-white')}>
                {trialStep === 1 ? '1' : <Check className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 h-0.5 rounded-full" style={{ background: trialStep === 2 ? '#059669' : 'rgba(255,255,255,0.1)' }} />
              <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold', trialStep === 2 ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/40')}>
                2
              </div>
              <button onClick={() => setShowTrialModal(false)} className="ml-auto text-white/30 hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {trialStep === 1 ? (
              <>
                <h2 className="text-xl font-extrabold text-white mb-1">Start Your Free 3-Hour Trial</h2>
                <p className="text-sm text-white/50 mb-5">Full CRM access. No credit card. Auto-expires in 3 hours.</p>

                <form onSubmit={handleTrialSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      value={trialName}
                      onChange={e => setTrialName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/10 outline-none focus:border-violet-500/60"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Business Email</label>
                    <input
                      type="email"
                      placeholder="rahul@myagency.com"
                      value={trialEmail}
                      onChange={e => setTrialEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/10 outline-none focus:border-violet-500/60"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={trialPhone}
                      onChange={e => setTrialPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/10 outline-none focus:border-violet-500/60"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Your Business Type</label>
                    <select
                      value={trialBusiness}
                      onChange={e => setTrialBusiness(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white border border-white/10 outline-none focus:border-violet-500/60"
                      style={{ background: '#1e293b' }}
                    >
                      <option value="" disabled>Select your industry...</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTrial}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2 transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    {isSubmittingTrial ? 'Activating Trial...' : 'Get Free Trial Access →'}
                  </button>
                </form>

                <p className="text-center text-[11px] text-white/25 mt-4">
                  By submitting, you agree to be contacted by our team about CRM solutions.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-white mb-1">Enter Verification Code</h2>
                <p className="text-sm text-white/50 mb-5">Sent to your phone. For instant access, enter <strong className="text-violet-300">123456</strong></p>

                <form onSubmit={handleTrialVerify} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={trialOtp}
                    onChange={e => setTrialOtp(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl text-center text-3xl tracking-[0.6em] font-black text-white border border-white/10 outline-none focus:border-violet-500/60"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    required autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingTrial}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    {isVerifyingTrial ? 'Launching CRM...' : '🚀 Launch My CRM Trial'}
                  </button>
                  <button type="button" onClick={() => setTrialStep(1)} className="w-full text-center text-sm text-white/30 hover:text-white/50 py-1">
                    ← Back
                  </button>
                </form>

                <div className="mt-5 p-3 rounded-xl border border-emerald-500/20 flex items-start gap-2" style={{ background: 'rgba(52,211,153,0.05)' }}>
                  <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300/80">Your trial gives you full admin access to the live CRM. Data auto-deletes after 3 hours. Our team will call you if you don't reach out to us first.</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
