'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Mail, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Info,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Predefined Quick templates to inject beautiful HTML into editor
const TEMPLATES = [
  {
    name: '🌴 Holiday Packages Offer',
    subject: 'Exclusive Travel Deals For You - Limited Time Offer!',
    html: `<h2>Dreaming of your next getaway? ✈️</h2>
<p>Dear Valued Client,</p>
<p>We are excited to share some of our most exclusive travel packages designed to give you the perfect holiday experience at unbeatable rates.</p>
<h3>🔥 Trending Destinations:</h3>
<ul>
  <li><strong>Bali Tropical Paradise:</strong> 5 Nights / 6 Days starting at just ₹29,999/-</li>
  <li><strong>Goa Beach Retreat:</strong> 3 Nights / 4 Days starting at just ₹12,499/-</li>
  <li><strong>Magical Maldives Resort:</strong> 4 Nights starting at just ₹59,999/-</li>
</ul>
<p><strong>Package Inclusions:</strong> Premium Hotels, Buffet Breakfast, airport transfers, and guided local tours.</p>
<hr />
<p>Reply to this email or contact our travel experts directly to customize your itinerary today!</p>
<p>Best regards,<br /><strong>StreamKart TravelCRM Team</strong></p>`
  },
  {
    name: '📋 Booking Voucher Release',
    subject: 'Your Travel Booking Vouchers & Details inside',
    html: `<h2>Your Booking Vouchers are Ready! 🌴</h2>
<p>Hello,</p>
<p>Thank you for choosing us for your travel plans. We are pleased to confirm that your bookings are confirmed and all vouchers have been issued successfully.</p>
<p><strong>Next Steps:</strong></p>
<ol>
  <li>Open the attached voucher documents in your crm dashboard.</li>
  <li>Verify hotel check-in timings and tour pickup locations.</li>
  <li>Carry a valid photo ID card during your travels.</li>
</ol>
<p>We wish you an incredible, safe, and happy journey ahead!</p>
<p>Warm regards,<br /><strong>Support Team</strong></p>`
  },
  {
    name: '📣 Client Newsletter',
    subject: 'Important Travel Updates & Guidelines for Summer 2026',
    html: `<h2>Important Travel News & Updates 🌐</h2>
<p>Dear Travelers,</p>
<p>As we enter the peak summer holiday season of 2026, we want to share some vital travel advisory updates to ensure all your journeys remain smooth and hassle-free:</p>
<ul>
  <li><strong>Visa processing:</strong> Dynamic processing queues are open. Apply at least 15 days in advance.</li>
  <li><strong>Flight baggage rules:</strong> Double-check luggage limits before heading to the airport.</li>
  <li><strong>Custom CRM Support:</strong> Our support desk is now active 24/7 on WhatsApp!</li>
</ul>
<p>Read full guide in your portal. Have a great week!</p>
<p>Sincerely,<br /><strong>StreamKart Management</strong></p>`
  }
];

export default function EmailCampaignPage() {
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; details: any } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  const [emailsText, setEmailsText] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('StreamKart TravelCRM');
  const [content, setContent] = useState('');
  
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<{ recipientCount: number; invalidCount: number } | null>(null);

  // Email validation helper
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const parsedEmails = emailsText.split(/[\s,;\n\r]+/).map(e => e.trim()).filter(Boolean);
  const validEmails = Array.from(new Set(parsedEmails.filter(e => emailRegex.test(e))));
  const invalidEmailsCount = parsedEmails.length - validEmails.length;

  useEffect(() => {
    fetchSmtpStatus();
  }, []);

  const fetchSmtpStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.get('/email-campaigns/smtp-status');
      setSmtpStatus(res.data);
    } catch (err: any) {
      console.error('Failed to load SMTP status:', err);
      toast.error('Could not verify SMTP configuration status.');
    } finally {
      setLoadingStatus(false);
    }
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setContent(tpl.html);
    toast.success(`Applied "${tpl.name.substring(2)}" template`);
  };

  const handleSendCampaign = async () => {
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid recipient email address.');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please provide an email subject line.');
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please write some content/message for the campaign.');
      return;
    }

    setSending(true);
    setStats(null);

    try {
      const res = await api.post('/email-campaigns/send', {
        emails: emailsText,
        subject,
        content,
        fromName
      });

      if (res.data.success) {
        toast.success(`Campaign enqueued successfully to ${res.data.recipientCount} clients!`);
        setStats({
          recipientCount: res.data.recipientCount,
          invalidCount: res.data.invalidCount
        });
        // Clear forms on success
        setEmailsText('');
        setSubject('');
        setContent('');
      } else {
        toast.error(res.data.message || 'Failed to dispatch email campaign.');
      }
    } catch (err: any) {
      console.error('Send Campaign Error:', err);
      toast.error(err.response?.data?.message || 'SMTP Server failed to route the campaign. Verify SMTP details.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Mail className="w-8 h-8 text-primary" /> Email Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">
            Compose and broadcast bulk emails to your clients using your custom domain SMTP provider.
          </p>
        </div>
      </div>

      {/* SMTP Status Banner */}
      {!loadingStatus && smtpStatus && (
        <Card className={cn("border-l-4 shadow-sm", smtpStatus.configured ? "border-l-green-500 bg-green-50/30" : "border-l-amber-500 bg-amber-50/30")}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {smtpStatus.configured ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">SMTP Server is Connected & Active</p>
                    <p className="text-xs text-muted-foreground">
                      Sending emails via: <span className="font-mono text-primary font-bold">{smtpStatus.details?.host}</span> ({smtpStatus.details?.user})
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">SMTP configuration is missing!</p>
                    <p className="text-xs text-muted-foreground">
                      Add your domain email SMTP parameters (SMTP_HOST, SMTP_USER, SMTP_PASS) to the backend config to enable mailing.
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={fetchSmtpStatus} className="hover:bg-slate-100">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign Stats Card on Success */}
      {stats && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="py-4">
            <CardTitle className="text-base text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Campaign Broadcast Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Campaign Status</p>
              <Badge className="bg-green-500 hover:bg-green-600 mt-1">Enqueued</Badge>
            </div>
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Recipients Queued</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.recipientCount}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Invalid Skipped</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.invalidCount}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Background Queue</p>
              <p className="text-xs text-muted-foreground mt-2">Processing asynchronously via BullMQ</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: compose form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Compose Message</CardTitle>
              <CardDescription>Draft the campaign content below. HTML links and formatting are fully supported.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="from-name">Sender Name</Label>
                  <Input 
                    id="from-name" 
                    placeholder="e.g. StreamKart Travel" 
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input 
                    id="subject" 
                    placeholder="Enter email subject line" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Email Body Message</Label>
                <RichTextEditor 
                  value={content}
                  onChange={setContent}
                  placeholder="Start drafting your campaign message here..."
                />
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  onClick={handleSendCampaign} 
                  disabled={sending || validEmails.length === 0 || !subject.trim()}
                  className="w-full md:w-auto px-8 py-5 text-base flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Dispatched Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Launch Bulk Campaign 🚀
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: recipient list and templates */}
        <div className="space-y-6">
          {/* Recipient card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Recipients List</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Paste recipient emails below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Textarea 
                  placeholder="Paste emails separated by commas, spaces, or newlines (e.g. copied from Excel/Word column)&#10;client1@example.com&#10;client2@example.com"
                  rows={8}
                  className="font-mono text-sm leading-relaxed"
                  value={emailsText}
                  onChange={(e) => setEmailsText(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Supports direct clipboard paste from Excel, Word, or WhatsApp.
                </p>
              </div>

              {/* Real-time counters */}
              {parsedEmails.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Total detected inputs:</span>
                    <span className="font-semibold font-mono">{parsedEmails.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-medium">Valid recipients:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 font-mono">
                      {validEmails.length}
                    </Badge>
                  </div>
                  {invalidEmailsCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-600">Invalid / empty skipped:</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-mono">
                        {invalidEmailsCount}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick template selector */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Quick HTML Templates</span>
                <Layers className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Click to instantly load pre-styled templates into your editor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {TEMPLATES.map((tpl, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => applyTemplate(tpl)}
                  className="w-full justify-start text-left font-medium text-xs py-5 truncate hover:bg-slate-50 border-dashed"
                >
                  {tpl.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
