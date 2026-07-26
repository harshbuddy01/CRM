'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, X, Phone, Mail, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const INDUSTRIES = [
  'Travel Agency',
  'Education / EdTech',
  'B2B Distributors & Dealers',
  'Real Estate',
  'Healthcare / Clinic',
  'Retail / E-commerce',
  'Logistics & Transport',
  'Events & Hospitality',
  'Financial Services',
  'Other Business',
];

const CLIENTS = [
  { name: 'Leads & Pipeline', desc: 'Capture and manage every enquiry automatically' },
  { name: 'Proposals & Itineraries', desc: 'Generate branded PDF quotes in seconds' },
  { name: 'WhatsApp Automation', desc: 'Send updates, invoices, and reminders instantly' },
  { name: 'GST Invoicing', desc: 'Tax-compliant billing with online payment collection' },
  { name: 'Reports & Analytics', desc: 'Track team performance and revenue by channel' },
  { name: 'Custom White-Label', desc: 'Your logo, domain, and brand — not ours' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tfaSession, setTfaSession] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [showTrial, setShowTrial] = useState(false);
  const [trialStep, setTrialStep] = useState(1);
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tBiz, setTBiz] = useState('');
  const [tOtp, setTOtp] = useState('');
  const [tSessionId, setTSessionId] = useState('');
  const [tLoading, setTLoading] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  useEffect(() => { logout(); }, [logout]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { data } } = await api.post('/auth/login', { email, password });
      if (data.requires2FA) {
        setRequires2FA(true);
        setTfaSession(data.twoFactorSessionId);
        toast.success('Verification code sent to your email');
      } else {
        setAuth(data.user, data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
        router.push('/');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Incorrect email or password');
    } finally { setIsLoading(false); }
  };

  const doVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const { data: { data } } = await api.post('/auth/verify-2fa', { twoFactorSessionId: tfaSession, code });
      setAuth(data.user, data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid code');
    } finally { setIsVerifying(false); }
  };

  const doTrialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tBiz) { toast.error('Please select your business type'); return; }
    setTLoading(true);
    try {
      const { data } = await api.post('/demo/signup', { name: tName, email: tEmail, phone: tPhone, businessType: tBiz });
      if (data.success) { setTSessionId(data.sessionId); setTrialStep(2); }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Something went wrong. Try again.');
    } finally { setTLoading(false); }
  };

  const doTrialVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setTLoading(true);
    try {
      const { data } = await api.post('/demo/verify-otp', { sessionId: tSessionId, otp: tOtp });
      setAuth(data.user, data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
      toast.success('Trial activated. 3 hours of full access.');
      setShowTrial(false);
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { setTLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; }
        body { background: #f0f2f5; }

        /* ─── TOP BAR ─── */
        .topbar {
          background: #fff;
          border-bottom: 1px solid #e2e5eb;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          position: sticky; top: 0; z-index: 100;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon { width: 32px; height: 32px; background: #1d4ed8; border-radius: 7px; display: flex; align-items: center; justify-content: center; }
        .logo-icon svg { color: #fff; width: 16px; height: 16px; }
        .logo-name { font-size: 16px; font-weight: 700; color: #111827; letter-spacing: -0.3px; }
        .logo-name span { color: #1d4ed8; }
        .topbar-contact { display: flex; align-items: center; gap: 24px; }
        .topbar-link { display: flex; align-items: center; gap-6px; font-size: 13px; color: #6b7280; text-decoration: none; }
        .topbar-link:hover { color: #111827; }
        .topbar-link svg { width: 14px; height: 14px; margin-right: 6px; }
        .trial-nav-btn {
          padding: 8px 18px; background: #1d4ed8; color: #fff;
          border-radius: 6px; font-size: 13px; font-weight: 600;
          border: none; cursor: pointer; text-decoration: none;
          display: inline-block;
        }
        .trial-nav-btn:hover { background: #1e40af; }

        /* ─── PAGE LAYOUT ─── */
        .page { display: flex; min-height: calc(100vh - 60px); }

        /* ─── LEFT PANEL ─── */
        .left { flex: 1; padding: 64px 56px; display: flex; flex-direction: column; justify-content: center; }
        .eyebrow { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #1d4ed8; margin-bottom: 16px; }
        .headline { font-size: 42px; font-weight: 800; color: #0f172a; line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
        .tagline { font-size: 16px; color: #6b7280; line-height: 1.65; max-width: 500px; margin-bottom: 40px; }
        .tagline strong { color: #374151; font-weight: 600; }

        /* Feature grid */
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e5e7eb; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 40px; }
        .feature-item { background: #fff; padding: 16px 20px; }
        .feature-item:hover { background: #f8faff; }
        .feature-name { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 3px; display: flex; align-items: center; gap: 6px; }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #1d4ed8; flex-shrink: 0; }
        .feature-desc { font-size: 12px; color: #9ca3af; line-height: 1.4; }

        /* Industry tags */
        .ind-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 12px; }
        .ind-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
        .ind-tag { padding: 5px 12px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; font-size: 12px; font-weight: 500; color: #374151; }

        /* CTAs */
        .cta-row { display: flex; gap: 12px; align-items: center; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; background: #059669; color: #fff;
          border-radius: 6px; font-size: 14px; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
        }
        .btn-primary:hover { background: #047857; }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; background: #fff; color: #374151;
          border-radius: 6px; font-size: 14px; font-weight: 600;
          border: 1px solid #d1d5db; cursor: pointer; text-decoration: none;
        }
        .btn-secondary:hover { background: #f9fafb; border-color: #9ca3af; }

        /* ─── DIVIDER ─── */
        .v-divider { width: 1px; background: #e2e5eb; margin: 40px 0; }

        /* ─── RIGHT PANEL ─── */
        .right { width: 420px; background: #fff; border-left: 1px solid #e2e5eb; display: flex; flex-direction: column; justify-content: center; padding: 48px 40px; }
        .form-label-top { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.3px; }
        .form-sublabel { font-size: 13px; color: #9ca3af; margin-bottom: 28px; }

        /* Form fields */
        .field { margin-bottom: 16px; }
        .field > label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .field-row-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .field-row-head label { font-size: 12px; font-weight: 600; color: #374151; }
        .forgot { font-size: 12px; color: #1d4ed8; text-decoration: none; }
        .forgot:hover { text-decoration: underline; }
        .input-wrap { position: relative; }
        .field input, .field select {
          width: 100%; padding: 10px 14px;
          border: 1px solid #d1d5db; border-radius: 6px;
          font-size: 14px; color: #111827; background: #fff;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          -webkit-appearance: none;
        }
        .field input::placeholder { color: #d1d5db; }
        .field input:focus, .field select:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.08); }
        .eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; display: flex; }
        .eye-btn:hover { color: #374151; }

        /* Buttons */
        .sign-in-btn {
          width: 100%; padding: 11px 0; background: #1d4ed8; color: #fff;
          border: none; border-radius: 6px; font-size: 14px; font-weight: 600;
          cursor: pointer; margin-top: 4px; transition: background 0.15s;
        }
        .sign-in-btn:hover { background: #1e40af; }
        .sign-in-btn:disabled { opacity: 0.6; }
        .or-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0; }
        .or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
        .or-divider span { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
        .trial-btn-form {
          width: 100%; padding: 11px 0; background: #fff; color: #1d4ed8;
          border: 1px solid #bfdbfe; border-radius: 6px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .trial-btn-form:hover { background: #eff6ff; border-color: #93c5fd; }
        .contact-info { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6; }
        .contact-info p { font-size: 11px; color: #9ca3af; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .contact-info a { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #374151; text-decoration: none; margin-bottom: 5px; }
        .contact-info a:hover { color: #1d4ed8; }
        .contact-info a svg { width: 14px; height: 14px; color: #6b7280; }

        /* OTP */
        .otp-input { text-align: center !important; font-size: 26px !important; font-weight: 700 !important; letter-spacing: 0.35em !important; padding: 14px !important; }

        /* ─── MODAL ─── */
        .modal-box { background: #fff; border-radius: 10px; border: 1px solid #e2e5eb; box-shadow: 0 20px 60px rgba(0,0,0,0.12); padding: 36px; position: relative; width: 100%; max-width: 460px; }
        .modal-header-strip { height: 4px; background: #1d4ed8; border-radius: 4px; margin-bottom: 24px; }
        .modal-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.3px; }
        .modal-sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
        .modal-close-btn { position: absolute; top: 16px; right: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; cursor: pointer; color: #6b7280; display: flex; }
        .modal-close-btn:hover { background: #f3f4f6; color: #374151; }
        .modal-submit { width: 100%; padding: 11px; background: #1d4ed8; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 4px; }
        .modal-submit:hover { background: #1e40af; }
        .modal-submit:disabled { opacity: 0.6; }
        .modal-back { background: none; border: none; color: #6b7280; font-size: 13px; cursor: pointer; margin-top: 10px; display: block; width: 100%; text-align: center; }
        .modal-back:hover { color: #374151; }
        .otp-hint { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #15803d; margin-top: 12px; line-height: 1.5; }
        .step-dots { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; }
        .step-dot { width: 24px; height: 4px; border-radius: 2px; }
        .step-dot.active { background: #1d4ed8; }
        .step-dot.done { background: #059669; }
        .step-dot.inactive { background: #e5e7eb; }

        @media (max-width: 900px) {
          .page { flex-direction: column; }
          .left { padding: 40px 24px; }
          .headline { font-size: 30px; }
          .feature-grid { grid-template-columns: 1fr; }
          .v-divider { display: none; }
          .right { width: 100%; border-left: none; border-top: 1px solid #e2e5eb; padding: 40px 24px; }
          .topbar { padding: 0 20px; }
          .topbar-contact { gap: 12px; }
        }
      `}</style>

      {/* ─── TOP BAR ─── */}
      <header className="topbar">
        <a href="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="logo-name">StreamKart <span>CRM</span></span>
        </a>
        <div className="topbar-contact">
          <a href="https://wa.me/917004283531" target="_blank" className="topbar-link" style={{ display: 'flex', alignItems: 'center', color: '#6b7280', textDecoration: 'none', fontSize: '13px' }}>
            <Phone size={14} style={{ marginRight: '6px' }} /> +91 70042 83531
          </a>
          <a href="mailto:support@streamkart.shop" className="topbar-link" style={{ display: 'flex', alignItems: 'center', color: '#6b7280', textDecoration: 'none', fontSize: '13px' }}>
            <Mail size={14} style={{ marginRight: '6px' }} /> support@streamkart.shop
          </a>
          <button className="trial-nav-btn" onClick={() => { setTrialStep(1); setShowTrial(true); }}>
            Free Trial
          </button>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <div className="page">

        {/* LEFT */}
        <div className="left">
          <p className="eyebrow">StreamKart CRM Platform</p>
          <h1 className="headline">Custom CRM built<br />for your business.</h1>
          <p className="tagline">
            We design and deliver <strong>fully custom CRM software</strong> for travel agencies, education institutes, B2B distributors, real estate firms, and more. Your sales process. Your workflow. Your brand.
          </p>

          <div className="feature-grid">
            {CLIENTS.map(c => (
              <div className="feature-item" key={c.name}>
                <div className="feature-name">
                  <span className="feature-dot" />
                  {c.name}
                </div>
                <div className="feature-desc">{c.desc}</div>
              </div>
            ))}
          </div>

          <p className="ind-label">Works for any industry</p>
          <div className="ind-tags">
            {['Travel Agency', 'Education & EdTech', 'B2B Distributors', 'Real Estate', 'Healthcare', 'Retail', '+ More'].map(i => (
              <span className="ind-tag" key={i}>{i}</span>
            ))}
          </div>

          <div className="cta-row">
            <a
              href="https://wa.me/917004283531?text=Hi!%20I%20want%20to%20build%20a%20custom%20CRM%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Talk to Us on WhatsApp <ChevronRight size={16} />
            </a>
            <button className="btn-secondary" onClick={() => { setTrialStep(1); setShowTrial(true); }}>
              Try Live Demo — 3 Hours Free
            </button>
          </div>
        </div>

        <div className="v-divider" />

        {/* RIGHT */}
        <div className="right">
          {!requires2FA ? (
            <>
              <p className="form-label-top">Sign in to your account</p>
              <p className="form-sublabel">Enter your credentials to access the dashboard.</p>

              <form onSubmit={doLogin}>
                <div className="field">
                  <label>Email address</label>
                  <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <div className="field-row-head">
                    <label>Password</label>
                    <a href="/forgot-password" className="forgot">Forgot password?</a>
                  </div>
                  <div className="input-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ paddingRight: '40px' }}
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="sign-in-btn" disabled={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="or-divider"><span>or</span></div>

              <button className="trial-btn-form" onClick={() => { setTrialStep(1); setShowTrial(true); }}>
                Start Free 3-Hour Trial
              </button>

              <div className="contact-info">
                <p>Need help or want a custom CRM?</p>
                <a href="https://wa.me/917004283531" target="_blank">
                  <Phone size={14} /> +91 70042 83531
                </a>
                <a href="mailto:support@streamkart.shop">
                  <Mail size={14} /> support@streamkart.shop
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="form-label-top">Verify your identity</p>
              <p className="form-sublabel" style={{ marginBottom: '24px' }}>
                A 6-digit code was sent to <strong style={{ color: '#111827' }}>{email}</strong>
              </p>
              <form onSubmit={doVerify}>
                <div className="field">
                  <label>Verification Code</label>
                  <input className="otp-input" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus />
                </div>
                <button type="submit" className="sign-in-btn" disabled={isVerifying}>{isVerifying ? 'Verifying…' : 'Verify & Sign In'}</button>
                <button type="button" className="modal-back" onClick={() => { setRequires2FA(false); setCode(''); }}>← Back to login</button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ─── TRIAL MODAL ─── */}
      <Dialog open={showTrial} onOpenChange={setShowTrial}>
        <DialogContent style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0', maxWidth: '500px' }}>
          <div className="modal-box">
            <div className="modal-header-strip" />
            <button className="modal-close-btn" onClick={() => setShowTrial(false)}><X size={15} /></button>

            <div className="step-dots">
              <div className={`step-dot ${trialStep === 1 ? 'active' : trialStep > 1 ? 'done' : 'inactive'}`} />
              <div className={`step-dot ${trialStep === 2 ? 'active' : 'inactive'}`} />
            </div>

            {trialStep === 1 ? (
              <>
                <p className="modal-title">Start your free 3-hour trial</p>
                <p className="modal-sub">Full CRM access. No credit card. Our team will follow up with you personally.</p>
                <form onSubmit={doTrialSignup}>
                  <div className="field">
                    <label>Your Name</label>
                    <input type="text" placeholder="Rahul Sharma" value={tName} onChange={e => setTName(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Work Email</label>
                    <input type="email" placeholder="rahul@mycompany.com" value={tEmail} onChange={e => setTEmail(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>WhatsApp Number</label>
                    <input type="tel" placeholder="+91 98765 43210" value={tPhone} onChange={e => setTPhone(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Business Type</label>
                    <select value={tBiz} onChange={e => setTBiz(e.target.value)} required style={{ color: tBiz ? '#111827' : '#9ca3af' }}>
                      <option value="" disabled>Select your industry…</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="modal-submit" disabled={tLoading}>
                    {tLoading ? 'Setting up access…' : 'Get Trial Access →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="modal-title">Enter verification code</p>
                <p className="modal-sub">Sent to your WhatsApp number. Please enter it below to verify.</p>
                <form onSubmit={doTrialVerify}>
                  <div className="field">
                    <label>6-Digit Code</label>
                    <input className="otp-input" type="text" inputMode="numeric" maxLength={6} placeholder="— — — — — —" value={tOtp} onChange={e => setTOtp(e.target.value)} required autoFocus />
                  </div>
                  <button type="submit" className="modal-submit" disabled={tLoading}>
                    {tLoading ? 'Activating…' : 'Activate Trial →'}
                  </button>
                  <button type="button" className="modal-back" onClick={() => setTrialStep(1)}>← Go back</button>
                </form>
                <div className="otp-hint">
                  ✓ Our team will receive your details and reach out within a few hours — even if you don't contact us first.
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
