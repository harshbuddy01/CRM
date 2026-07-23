'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowRight, X, Check, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const INDUSTRIES = [
  'Travel Agency',
  'Education / EdTech',
  'B2B Distributors',
  'Real Estate',
  'Healthcare',
  'Retail / E-commerce',
  'Logistics',
  'Events & Hospitality',
  'Financial Services',
  'Other',
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
        toast.success('Code sent to your email');
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
    if (!tBiz) { toast.error('Select your business type'); return; }
    setTLoading(true);
    try {
      const { data } = await api.post('/demo/signup', { name: tName, email: tEmail, phone: tPhone, businessType: tBiz });
      if (data.success) { setTSessionId(data.sessionId); setTrialStep(2); }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Try again');
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
      toast.success('Trial activated! 3 hours of full access.');
      setShowTrial(false);
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid code');
    } finally { setTLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        body { margin: 0; }
        .page { min-height: 100vh; background: #06080f; display: flex; }
        .glow { position: fixed; top: -200px; left: -200px; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); pointer-events: none; }
        .glow2 { position: fixed; bottom: -200px; right: 200px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%); pointer-events: none; }
        
        /* LEFT */
        .left { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 72px; }
        .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); color: #818cf8; font-size: 12px; font-weight: 600; margin-bottom: 32px; width: fit-content; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #818cf8; }
        .headline { font-size: 52px; font-weight: 900; color: #fff; line-height: 1.08; letter-spacing: -1.5px; margin: 0 0 20px 0; }
        .headline span { background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtext { font-size: 16px; color: rgba(255,255,255,0.45); line-height: 1.6; max-width: 440px; margin: 0 0 40px 0; }
        .subtext strong { color: rgba(255,255,255,0.75); font-weight: 600; }
        
        /* Industry pills */
        .industries { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 44px; }
        .ind-pill { padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500; }
        .ind-pill-more { padding: 7px 14px; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.12); color: rgba(255,255,255,0.3); font-size: 13px; }
        
        /* CTA */
        .ctas { display: flex; gap: 12px; }
        .btn-wa { display: flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 12px; background: linear-gradient(135deg, #25d366, #0e9e50); color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
        .btn-trial { display: flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-trial:hover { background: rgba(255,255,255,0.04); color: #fff; }
        
        /* DIVIDER */
        .divider { width: 1px; background: rgba(255,255,255,0.06); margin: 60px 0; }
        
        /* RIGHT */
        .right { width: 440px; display: flex; flex-direction: column; justify-content: center; padding: 60px 52px; }
        .form-title { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.5px; }
        .form-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin: 0 0 32px 0; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
        .field-wrap { position: relative; }
        .field input, .field select { width: 100%; padding: 12px 16px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 14px; outline: none; transition: border-color 0.15s; appearance: none; -webkit-appearance: none; }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus, .field select:focus { border-color: rgba(99,102,241,0.5); }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; }
        .forgot { font-size: 12px; color: rgba(99,102,241,0.8); text-decoration: none; }
        .forgot:hover { color: #818cf8; }
        .field-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .submit-btn { width: 100%; padding: 13px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 4px; transition: opacity 0.15s; }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.5; }
        .or-line { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .or-line span { font-size: 11px; color: rgba(255,255,255,0.2); text-transform: uppercase; }
        .or-line::before, .or-line::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .trial-btn { width: 100%; padding: 13px; border-radius: 10px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); color: #818cf8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .trial-btn:hover { background: rgba(99,102,241,0.15); }
        .contact-footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
        .contact-footer p { font-size: 12px; color: rgba(255,255,255,0.2); margin: 0 0 8px; }
        .contact-footer a { display: block; font-size: 13px; color: rgba(255,255,255,0.4); text-decoration: none; margin-bottom: 4px; }
        .contact-footer a:hover { color: rgba(255,255,255,0.7); }
        
        /* MODAL */
        .modal-inner { background: #0c1020; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 420px; position: relative; }
        .modal-bar { height: 3px; border-radius: 100px; margin-bottom: 28px; background: linear-gradient(90deg, #6366f1, #c084fc); }
        .modal-title { font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: -0.3px; }
        .modal-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 24px; }
        .modal-close { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.4); border-radius: 8px; padding: 6px; cursor: pointer; }
        .modal-close:hover { color: #fff; }
        .otp-input { text-align: center; font-size: 28px; font-weight: 900; letter-spacing: 0.4em; padding: 16px !important; }
        .tip-box { background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.15); border-radius: 10px; padding: 12px 14px; font-size: 12px; color: rgba(52,211,153,0.8); margin-top: 12px; line-height: 1.5; }
        .back-link { background: none; border: none; color: rgba(255,255,255,0.3); font-size: 13px; cursor: pointer; padding: 8px 0; display: block; text-align: center; width: 100%; margin-top: 8px; }
        .back-link:hover { color: rgba(255,255,255,0.6); }
        
        @media (max-width: 900px) {
          .page { flex-direction: column; }
          .left { padding: 48px 24px 32px; }
          .headline { font-size: 36px; }
          .divider { display: none; }
          .right { width: 100%; padding: 32px 24px 48px; }
        }
      `}</style>

      <div className="page">
        <div className="glow" />
        <div className="glow2" />

        {/* ── LEFT ── */}
        <div className="left">
          <div className="badge"><span className="badge-dot" />Custom CRM Software</div>

          <h1 className="headline">
            Built for how<br /><span>your business</span><br />actually works.
          </h1>

          <p className="subtext">
            We design and build fully custom CRM software for <strong>travel agencies, schools, B2B distributors, retailers, and more</strong> — tailored to your exact sales process, not a generic template.
          </p>

          <div className="industries">
            {['Travel Agencies', 'Education & EdTech', 'B2B Distributors', 'Real Estate'].map(ind => (
              <span key={ind} className="ind-pill">{ind}</span>
            ))}
            <span className="ind-pill-more">+ any business →</span>
          </div>

          <div className="ctas">
            <a
              href="https://wa.me/917004283531?text=Hi!%20I%20want%20to%20build%20a%20custom%20CRM%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa"
            >
              WhatsApp Us <ArrowRight size={15} />
            </a>
            <button onClick={() => { setTrialStep(1); setShowTrial(true); }} className="btn-trial">
              Try 3-Hour Demo
            </button>
          </div>
        </div>

        <div className="divider" />

        {/* ── RIGHT ── */}
        <div className="right">
          {!requires2FA ? (
            <>
              <p className="form-title">Sign in</p>
              <p className="form-sub">Access your CRM dashboard</p>

              <form onSubmit={doLogin}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <div className="field-row">
                    <label style={{ margin: 0 }}>Password</label>
                    <a href="/forgot-password" className="forgot">Forgot?</a>
                  </div>
                  <div className="field-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
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
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="or-line"><span>or</span></div>

              <button className="trial-btn" onClick={() => { setTrialStep(1); setShowTrial(true); }}>
                Start Free 3-Hour Trial
              </button>

              <div className="contact-footer">
                <p>Want a custom CRM for your business?</p>
                <a href="https://wa.me/917004283531" target="_blank">WhatsApp: +91 70042 83531</a>
                <a href="mailto:support@streamkart.shop">support@streamkart.shop</a>
              </div>
            </>
          ) : (
            <>
              <p className="form-title">Check your email</p>
              <p className="form-sub" style={{ marginBottom: '28px' }}>We sent a 6-digit code to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong></p>
              <form onSubmit={doVerify}>
                <div className="field">
                  <label>Verification Code</label>
                  <input className="otp-input" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus />
                </div>
                <button type="submit" className="submit-btn" disabled={isVerifying}>{isVerifying ? 'Verifying…' : 'Verify & Sign In'}</button>
                <button type="button" className="back-link" onClick={() => { setRequires2FA(false); setCode(''); }}>← Back to login</button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── TRIAL MODAL ── */}
      <Dialog open={showTrial} onOpenChange={setShowTrial}>
        <DialogContent style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, maxWidth: '460px' }}>
          <div className="modal-inner">
            <div className="modal-bar" />
            <button className="modal-close" onClick={() => setShowTrial(false)}><X size={16} /></button>

            {trialStep === 1 ? (
              <>
                <p className="modal-title">Start your free trial</p>
                <p className="modal-sub">Full CRM access for 3 hours. No card needed.</p>
                <form onSubmit={doTrialSignup}>
                  <div className="field">
                    <label>Your Name</label>
                    <input type="text" placeholder="Rahul Sharma" value={tName} onChange={e => setTName(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Business Email</label>
                    <input type="email" placeholder="rahul@mybusiness.com" value={tEmail} onChange={e => setTEmail(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>WhatsApp Number</label>
                    <input type="tel" placeholder="+91 98765 43210" value={tPhone} onChange={e => setTPhone(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Your Business Type</label>
                    <select value={tBiz} onChange={e => setTBiz(e.target.value)} required style={{ color: tBiz ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                      <option value="" disabled>Select industry…</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: '8px' }} disabled={tLoading}>
                    {tLoading ? 'Starting…' : 'Get Trial Access →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="modal-title">Enter the OTP</p>
                <p className="modal-sub">Sent to your phone. Use <strong style={{ color: '#818cf8' }}>123456</strong> for instant access.</p>
                <form onSubmit={doTrialVerify}>
                  <div className="field">
                    <input className="otp-input" type="text" inputMode="numeric" maxLength={6} placeholder="——————" value={tOtp} onChange={e => setTOtp(e.target.value)} required autoFocus />
                  </div>
                  <button type="submit" className="submit-btn" disabled={tLoading}>
                    {tLoading ? 'Launching…' : 'Launch CRM Trial →'}
                  </button>
                  <button type="button" className="back-link" onClick={() => setTrialStep(1)}>← Go back</button>
                </form>
                <div className="tip-box">
                  Our team will see your signup and reach out within a few hours to discuss how we can build a custom CRM for your business.
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
