'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlaneTakeoff, ArrowLeft, CheckCircle, Phone } from 'lucide-react';
import Link from 'next/link';

type ForgotResult =
  | null
  | { type: 'sent' }
  | { type: 'contact_admin'; reason: 'inactive' | 'no_provider' | 'email_failed' };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ForgotResult>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      const data = res.data.data;

      if (data.emailSent) {
        setResult({ type: 'sent' });
      } else if (data.accountInactive) {
        setResult({ type: 'contact_admin', reason: 'inactive' });
      } else if (data.noEmailProvider) {
        setResult({ type: 'contact_admin', reason: 'no_provider' });
      } else if (data.emailFailed) {
        setResult({ type: 'contact_admin', reason: 'email_failed' });
      } else if (data.noAccount) {
        // Don't reveal if email exists — show same as "sent"
        setResult({ type: 'sent' });
      } else {
        setResult({ type: 'sent' });
      }
    } catch {
      setResult({ type: 'contact_admin', reason: 'email_failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
        <PlaneTakeoff className="h-6 w-6" />
        TravelCRM
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {!result && 'Reset Password'}
            {result?.type === 'sent' && 'Reset Link Sent'}
            {result?.type === 'contact_admin' && 'Contact Your Administrator'}
          </CardTitle>
          <CardDescription>
            {!result && 'Enter your email address and we\'ll send you a reset link'}
            {result?.type === 'sent' && 'Check your email for the reset link'}
            {result?.type === 'contact_admin' && 'We were unable to process your request automatically'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ── Screen: Reset Link Sent ── */}
          {result?.type === 'sent' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-foreground font-medium">
                Reset link sent. Check your inbox and spam folder.
              </p>
              <p className="text-xs text-muted-foreground">
                Link expires in 15 minutes.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* ── Screen: Contact Administrator ── */}
          {result?.type === 'contact_admin' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <div className="text-center">
                {result.reason === 'inactive' && (
                  <p className="text-sm text-foreground">
                    Your account has been deactivated. Contact your administrator to reactivate it.
                  </p>
                )}
                {result.reason === 'no_provider' && (
                  <p className="text-sm text-foreground">
                    Email service is not set up. Contact your administrator directly.
                  </p>
                )}
                {result.reason === 'email_failed' && (
                  <p className="text-sm text-foreground">
                    We could not send the email. Contact your administrator directly.
                  </p>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">What to do</p>
                <p className="text-xs text-amber-700">
                  Contact your administrator and ask them to reset your password from the Team Management page.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Link href="/login" className="flex-1">
                  <Button variant="default" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* ── Screen: Email Form (idle) ── */}
          {!result && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
