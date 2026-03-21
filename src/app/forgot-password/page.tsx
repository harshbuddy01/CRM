'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlaneTakeoff, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'not-found' | 'inactive' | 'no-provider'>('idle');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      const data = res.data;
      if (data.notFound) setStatus('not-found');
      else if (data.accountInactive) setStatus('inactive');
      else if (data.noEmailProvider) {
        setStatus('no-provider');
        setResetUrl(data.resetUrl);
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('success');
    } finally {
      setIsLoading(false);
    }
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
            {status === 'idle' && 'Reset Password'}
            {status === 'success' && 'Reset Link Sent'}
            {status === 'not-found' && 'Account Not Found'}
            {status === 'inactive' && 'Account Inactive'}
            {status === 'no-provider' && 'Development Link'}
          </CardTitle>
          <CardDescription>
            {status === 'idle' && 'Enter your email address and we\'ll send you a reset link'}
            {status === 'success' && 'Check your email for the reset link'}
            {status === 'not-found' && 'No matching account found'}
            {status === 'inactive' && 'Your account is suspended'}
            {status === 'no-provider' && 'Email provider not configured'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to <strong>{email}</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                The link will expire in 15 minutes. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'not-found' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find an account associated with <strong>{email}</strong>.
              </p>
              <Button variant="default" className="w-full mt-4" onClick={() => setStatus('idle')}>
                Try Another Email
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'inactive' && (
            <div className="space-y-4 text-center">
              <p className="text-sm font-medium text-destructive">
                Your account has been deactivated.
              </p>
              <p className="text-xs text-muted-foreground">
                You cannot reset your password. Please contact your system administrator to restore access.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'no-provider' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                <p className="font-semibold mb-2">Development Mode</p>
                <p>No email provider is configured. Click the link below to reset your password directly:</p>
              </div>
              <a href={resetUrl}>
                <Button className="w-full mt-2">Reset Password Now</Button>
              </a>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'idle' && (
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
