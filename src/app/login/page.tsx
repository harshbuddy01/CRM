'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlaneTakeoff } from 'lucide-react';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorSessionId, setTwoFactorSessionId] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Demo Sandbox States
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [demoSessionId, setDemoSessionId] = useState('');
  const [isRequestingDemo, setIsRequestingDemo] = useState(false);
  const [isVerifyingDemo, setIsVerifyingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(1); // 1: Info signup, 2: OTP verify

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Clear session on load to prevent cached router state bypassing credentials
  useEffect(() => {
    logout();
  }, [logout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data;

      if (data.requires2FA) {
        setRequires2FA(true);
        setTwoFactorSessionId(data.twoFactorSessionId);
        toast.success('Verification code sent', { description: 'Please check your email.' });
      } else {
        // Fallback if 2FA was not triggered
        const { user, accessToken, refreshToken } = data;
        setAuth(user, accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; secure; samesite=strict`;
        toast.success('Login successful', { description: `Welcome back, ${user.name}` });
        router.push('/');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error('Login Failed', {
        description: error.response?.data?.message || 'Invalid credentials or server error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const res = await api.post('/auth/verify-2fa', {
        twoFactorSessionId,
        code,
      });
      const { user, accessToken, refreshToken } = res.data.data;

      setAuth(user, accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; secure; samesite=strict`;

      toast.success('Login successful', { description: `Welcome back, ${user.name}` });
      router.push('/');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error('Verification Failed', {
        description: error.response?.data?.message || 'Invalid verification code',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      toast.success('Verification code resent', { description: 'Check your email inbox.' });
    } catch {
      toast.error('Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setRequires2FA(false);
    setCode('');
    setTwoFactorSessionId('');
  };

  const handleDemoSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestingDemo(true);
    try {
      const res = await api.post('/demo/signup', {
        name: demoName,
        email: demoEmail,
        phone: demoPhone
      });
      if (res.data.success) {
        setDemoSessionId(res.data.sessionId);
        setDemoStep(2);
        toast.success('Demo OTP requested', { description: 'OTP sent! Use 123456 for instant bypass.' });
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error('Request Failed', {
        description: error.response?.data?.message || 'Failed to request demo access',
      });
    } finally {
      setIsRequestingDemo(false);
    }
  };

  const handleDemoVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingDemo(true);
    try {
      const res = await api.post('/demo/verify-otp', {
        sessionId: demoSessionId,
        otp: demoOtp
      });
      
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; secure; samesite=strict`;
      
      toast.success('Demo Sandbox Activated', { description: `Welcome, ${user.name}! Your 3-hour demo session has started.` });
      setShowDemoModal(false);
      router.push('/');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error('Validation Failed', {
        description: error.response?.data?.message || 'Invalid OTP code',
      });
    } finally {
      setIsVerifyingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
        <PlaneTakeoff className="h-6 w-6" />
        TravelCRM
      </div>

      <Card className="w-full max-w-md shadow-lg">
        {!requires2FA ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                 <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative flex py-2 items-center mt-4">
                <div className="flex-grow border-t border-muted"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">Or</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 border-dashed border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                onClick={() => {
                  setDemoStep(1);
                  setShowDemoModal(true);
                }}
              >
                Start 3-Hour Demo Sandbox
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Two-Step Verification</CardTitle>
              <CardDescription>
                We sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg tracking-[0.5em] font-semibold"
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isVerifying || isLoading}>
                  {isVerifying ? 'Verifying...' : 'Verify & Log In'}
                </Button>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading || isVerifying}
                    className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request Demo Sandbox Access</DialogTitle>
            <DialogDescription>
              {demoStep === 1 
                ? "Enter your details to create a 3-hour white-labeled CRM demo session."
                : "Enter the OTP code. For instant access, use 123456."}
            </DialogDescription>
          </DialogHeader>

          {demoStep === 1 ? (
            <form onSubmit={handleDemoSignup} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Your Name</Label>
                <Input
                  id="demo-name"
                  type="text"
                  placeholder="John Doe"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email Address</Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="john@example.com"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-phone">Mobile Number (with country code)</Label>
                <Input
                  id="demo-phone"
                  type="text"
                  placeholder="+917004283531"
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isRequestingDemo}>
                {isRequestingDemo ? 'Requesting Access...' : 'Get OTP Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleDemoVerify} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="demo-otp">6-Digit OTP Code</Label>
                <Input
                  id="demo-otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={demoOtp}
                  onChange={(e) => setDemoOtp(e.target.value)}
                  className="text-center text-lg tracking-[0.5em] font-semibold"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  💡 Enter <strong>123456</strong> if you haven't completed WhatsApp registration yet!
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDemoStep(1)} 
                  className="w-1/3"
                >
                  Back
                </Button>
                <Button type="submit" className="w-2/3" disabled={isVerifyingDemo}>
                  {isVerifyingDemo ? 'Verifying...' : 'Verify & Launch'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
