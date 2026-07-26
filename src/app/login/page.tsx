'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tfaSession, setTfaSession] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    logout();
  }, [logout]);

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
    } finally {
      setIsLoading(false);
    }
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
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; }
        body { background: #f8fafc; }

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          width: 100%;
          max-width: 440px;
          padding: 40px;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin-top: 16px;
        }

        .subtitle {
          font-size: 14px;
          color: #64748b;
          margin-top: 8px;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          margin-bottom: 6px;
        }

        .field-row-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .field-row-head label {
          margin-bottom: 0;
        }

        .forgot {
          font-size: 12px;
          color: #0284c7;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot:hover {
          text-decoration: underline;
        }

        .input-wrap {
          position: relative;
        }

        .field input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .field input::placeholder {
          color: #94a3b8;
        }

        .field input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
        }

        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
        }

        .eye-btn:hover {
          color: #334155;
        }

        .submit-btn {
          width: 100%;
          padding: 11px 0;
          background: #0284c7;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background: #0369a1;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .otp-input {
          text-align: center !important;
          font-size: 24px !important;
          font-weight: 700 !important;
          letter-spacing: 0.3em !important;
          padding: 12px !important;
        }

        .back-link {
          background: none;
          border: none;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 16px;
          display: block;
          width: 100%;
          text-align: center;
        }

        .back-link:hover {
          color: #334155;
          text-decoration: underline;
        }
      `}</style>

      <div className="container">
        <div className="login-box">
          <div className="header">
            {/* Simple Plane/Travel Icon */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto' }}
            >
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.9.1-2.4.9l-1.1 1.9c-.4.7-.2 1.7.5 2.1l6.1 4-2.2 2.2-4.1-.7c-.8-.1-1.6.3-1.9 1l-.7 1.4c-.4.8 0 1.7.7 2.1l4 2.3 2.3 4c.4.7 1.3 1.1 2.1.7l1.4-.7c.7-.3 1.1-1.1 1-1.9l-.7-4.1 2.2-2.2 4 6.1c.4.7 1.4.9 2.1.5l1.9-1.1c.8-.5 1.1-1.5.9-2.4z" />
            </svg>
            <h2 className="title">TravelCRM</h2>
            <p className="subtitle">Sign in to access your dashboard</p>
          </div>

          {!requires2FA ? (
            <form onSubmit={doLogin}>
              <div className="field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="name@imagicaholidays.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div className="field-row-head">
                  <label>Password</label>
                  <a href="/forgot-password" className="forgot">
                    Forgot password?
                  </a>
                </div>
                <div className="input-wrap">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPwd((p) => !p)}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={doVerify}>
              <p className="subtitle" style={{ textAlign: 'center', marginBottom: '24px' }}>
                We sent a 6-digit verification code to <strong>{email}</strong>
              </p>
              <div className="field">
                <label style={{ textAlign: 'center' }}>Verification Code</label>
                <input
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setRequires2FA(false);
                  setCode('');
                }}
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
