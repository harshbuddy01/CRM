'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import {
  Megaphone,
  Users,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  FileText,
  Upload,
  Trash2,
  AlertTriangle,
  Gift,
  Flame,
  ArrowRight,
  ShieldCheck,
  Info,
  DollarSign,
  Layers,
  ChevronRight,
  ExternalLink,
  Tag,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface RecipientItem {
  queryId: string;
  queryCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  destination: string | null;
  status: string;
  leadSource: string;
  travelDate: string | null;
  createdAt: string;
  hasPhone: boolean;
  hasEmail: boolean;
}

interface CampaignHistoryItem {
  id: string;
  name: string;
  segment: string;
  channel: string;
  templateName: string | null;
  emailSubject: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: string;
  launchedAt: string | null;
  createdAt: string;
  creator?: { id: string; name: string } | null;
}

const TEMPLATE_PRESETS = [
  {
    id: 'festive_exclusive_offer',
    name: '🪔 Diwali / Festive Grand Offer',
    description: 'Festive promotion offering holiday packages discount + attached catalog',
    category: 'MARKETING',
    defaultOffer: 'Special Festive Discount: Up to ₹15,000 OFF on all domestic & international tours!',
    promoCode: 'DIWALI2026',
    emailSubject: '🪔 Celebrate Diwali with Imagica Holidays — Exclusive Vacation Deals Inside!',
    emailContent: `<h2>Happy Diwali & Festive Greetings! ✨</h2>
<p>Dear Valued Traveler,</p>
<p>As the festival of lights approaches, we are delighted to bring you exclusive festive holiday packages with early-bird privileges and unmissable savings.</p>
<h3>🌟 Special Festive Highlights:</h3>
<ul>
  <li><strong>Kashmir Autumn Paradise:</strong> Houseboat stay, Shikara ride & Snow valleys</li>
  <li><strong>Dubai Shopping Extravaganza:</strong> 5-Star luxury, Desert Safari & Burj Khalifa</li>
  <li><strong>Tropical Bali Retreat:</strong> Private pool villas & cultural island tour</li>
</ul>
<p>📄 Please check the attached festive catalog for full itineraries and inclusions.</p>
<p><strong>Exclusive Festive Coupon:</strong> Use code <strong>DIWALI2026</strong> for instant discounts up to ₹15,000/-</p>
<hr />
<p style="margin: 18px 0;">
  <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+plan+a+trip+with+Imagica+Holidays.&type=phone_number&app_absent=0" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
    💬 Chat with Travel Concierge (+91 89107 59374)
  </a>
</p>
<p>Warm regards,<br /><strong>Imagica Holidays Concierge Team</strong><br />📞 +91 89107 59374 | 🌐 imagicaholidays.com</p>`
  },
  {
    id: 'winback_discount_deal',
    name: '✈️ Lost Lead Win-Back Voucher',
    description: 'Target leads who inquired earlier with a special re-booking discount',
    category: 'MARKETING',
    defaultOffer: 'Special Re-activation Offer: Additional 10% OFF + Complimentary Sightseeing Tour!',
    promoCode: 'COMEBACK10',
    emailSubject: 'We Miss You! Here is an Exclusive Travel Gift from Imagica Holidays ✈️',
    emailContent: `<h2>Planning your next dream vacation? 🌴</h2>
<p>Dear {{name}},</p>
<p>We noticed you reached out to us earlier regarding your holiday plans. We would love the opportunity to plan your perfect journey with our signature personalized care.</p>
<p>To welcome you back, we have unlocked a special <strong>10% instant rebate + complimentary local sightseeing tour</strong> on any booking confirmed this month!</p>
<p>📄 Check out our curated catalog attached to see what makes an Imagica Holidays experience unforgettable.</p>
<p>Promo code: <strong>COMEBACK10</strong></p>
<p style="margin: 18px 0;">
  <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+plan+a+trip+with+Imagica+Holidays.&type=phone_number&app_absent=0" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
    💬 Chat with Travel Concierge (+91 89107 59374)
  </a>
</p>
<p>Best regards,<br /><strong>The Imagica Holidays Team</strong></p>`
  },
  {
    id: 'completed_loyalty_referral',
    name: '🏆 Past Traveler Loyalty & Referral Reward',
    description: 'Exclusive perks for past customers who completed tours with us',
    category: 'MARKETING',
    defaultOffer: 'VIP Loyalty Benefit: ₹5,000 Travel Credit for You + ₹2,500 Referral Bonus for Friends!',
    promoCode: 'VIPLOYALTY',
    emailSubject: 'Exclusive VIP Reward for our Valued Traveler 🌟',
    emailContent: `<h2>Thank you for traveling with Imagica Holidays! 🌟</h2>
<p>Dear {{name}},</p>
<p>It was our absolute privilege to host your journey. As one of our cherished travelers, you have earned exclusive VIP tier privileges for your next adventure!</p>
<h3>Your VIP Privileges:</h3>
<ul>
  <li><strong>₹5,000 Instant Travel Credit:</strong> Applicable on any upcoming domestic or international package.</li>
  <li><strong>Refer & Earn:</strong> Refer friends or family and they receive ₹2,500 OFF, while you receive an additional bonus voucher!</li>
  <li><strong>Complimentary Room Upgrade:</strong> Subject to availability at our partner luxury hotels.</li>
</ul>
<p>Use code: <strong>VIPLOYALTY</strong> whenever you plan your next getaway.</p>
<p style="margin: 18px 0;">
  <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+plan+a+trip+with+Imagica+Holidays.&type=phone_number&app_absent=0" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
    💬 Chat with Travel Concierge (+91 89107 59374)
  </a>
</p>
<p>Warmest regards,<br /><strong>Imagica Holidays Executive Concierge</strong></p>`
  }
];

export default function MarketingBroadcastPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [segment, setSegment] = useState<'lost' | 'completed'>('lost');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('both');

  // Audience Data
  const [audience, setAudience] = useState<RecipientItem[]>([]);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Campaign Form
  const [campaignName, setCampaignName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(TEMPLATE_PRESETS[0]);
  const [offerText, setOfferText] = useState(TEMPLATE_PRESETS[0].defaultOffer);
  const [promoCode, setPromoCode] = useState(TEMPLATE_PRESETS[0].promoCode);
  const [emailSubject, setEmailSubject] = useState(TEMPLATE_PRESETS[0].emailSubject);
  const [emailContent, setEmailContent] = useState(TEMPLATE_PRESETS[0].emailContent);
  const [skipRecentDays, setSkipRecentDays] = useState(true);

  // Dedicated Concierge WhatsApp Routing (Team Member Number)
  const [conciergePhone, setConciergePhone] = useState('918910759374');
  const [conciergeMessage, setConciergeMessage] = useState("Hi! I'd like to plan a trip with Imagica Holidays.");

  // Computed Concierge WhatsApp Link
  const conciergeWhatsAppUrl = useMemo(() => {
    const cleanPhone = conciergePhone.replace(/\D/g, '') || '918910759374';
    const encodedText = encodeURIComponent(conciergeMessage);
    return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
  }, [conciergePhone, conciergeMessage]);

  // File Upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; filename: string; size?: number } | null>(null);

  // Launching state
  const [launching, setLaunching] = useState(false);

  // Campaign History
  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stats
  const [stats, setStats] = useState<{ totalCampaigns: number; totalSent: number; totalFailed: number } | null>(null);

  // Load Audience whenever segment changes
  useEffect(() => {
    fetchAudience();
    fetchStats();
  }, [segment]);

  const fetchAudience = async () => {
    setLoadingAudience(true);
    try {
      const res = await api.get(`/broadcasts/audience?segment=${segment}`);
      if (res.data.success) {
        setAudience(res.data.data || []);
        // Reset selections to empty by default
        setSelectedIds(new Set());
      }
    } catch (err: any) {
      toast.error('Failed to load audience list: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAudience(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/broadcasts/campaigns');
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to load campaign history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/broadcasts/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      // quiet fail
    }
  };

  // Switch template preset
  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setSelectedPreset(preset);
    setOfferText(preset.defaultOffer);
    setPromoCode(preset.promoCode);
    setEmailSubject(preset.emailSubject);
    setEmailContent(preset.emailContent);
    if (!campaignName) {
      setCampaignName(`${preset.name.replace(/[^\w\s-]/g, '').trim()} - ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`);
    }
    toast.success(`Applied template: ${preset.name}`);
  };

  // Filtered audience
  const filteredAudience = useMemo(() => {
    if (!searchQuery.trim()) return audience;
    const q = searchQuery.toLowerCase();
    return audience.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.destination && item.destination.toLowerCase().includes(q)) ||
        item.queryCode.toLowerCase().includes(q)
    );
  }, [audience, searchQuery]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAudience.map(item => item.queryId));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleOne = (queryId: string) => {
    const next = new Set(selectedIds);
    if (next.has(queryId)) {
      next.delete(queryId);
    } else {
      next.add(queryId);
    }
    setSelectedIds(next);
  };

  const handleSelectWhatsAppOnly = () => {
    const ids = new Set(filteredAudience.filter(item => item.hasPhone).map(item => item.queryId));
    setSelectedIds(ids);
    toast.info(`Selected ${ids.size} contacts with phone numbers.`);
  };

  const handleSelectEmailOnly = () => {
    const ids = new Set(filteredAudience.filter(item => item.hasEmail).map(item => item.queryId));
    setSelectedIds(ids);
    toast.info(`Selected ${ids.size} contacts with email addresses.`);
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/broadcasts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.data?.url) {
        setAttachment({
          url: res.data.data.url,
          filename: res.data.data.filename || file.name,
          size: file.size,
        });
        toast.success(`Attached "${file.name}" successfully!`);
      }
    } catch (err: any) {
      toast.error('File upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingFile(false);
    }
  };

  // Launch campaign
  const handleLaunch = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least 1 recipient.');
      return;
    }

    const defaultName = campaignName.trim() || `${segment === 'lost' ? 'Lost Inquiries Win-Back' : 'Past Travelers Reward'} - ${new Date().toLocaleDateString('en-IN')}`;

    // Get selected recipient details
    const selectedRecipients = audience
      .filter(item => selectedIds.has(item.queryId))
      .map(item => ({
        queryId: item.queryId,
        name: item.name,
        phone: item.phone,
        email: item.email,
        destination: item.destination,
      }));

    setLaunching(true);
    try {
      // Step 1: Create Campaign
      const createRes = await api.post('/broadcasts/campaigns', {
        name: defaultName,
        segment,
        channel,
        templateName: selectedPreset.id,
        emailSubject,
        emailContent,
        attachmentUrl: attachment?.url || null,
        attachmentName: attachment?.filename || null,
        conciergePhone,
        conciergeUrl: conciergeWhatsAppUrl,
        recipients: selectedRecipients,
      });

      if (!createRes.data.success) {
        throw new Error(createRes.data.message || 'Failed to create campaign');
      }

      const campaignId = createRes.data.data.id;

      // Step 2: Launch Campaign
      const launchRes = await api.post(`/broadcasts/campaigns/${campaignId}/launch`);
      if (launchRes.data.success) {
        toast.success(`🎉 Campaign "${defaultName}" launched successfully! Queued for dispatch.`);
        // Switch to history tab
        setActiveTab('history');
        fetchHistory();
        fetchStats();
      }
    } catch (err: any) {
      toast.error('Launch failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLaunching(false);
    }
  };

  // Calculations for selection
  const selectedItems = useMemo(() => {
    return audience.filter(item => selectedIds.has(item.queryId));
  }, [audience, selectedIds]);

  const reachablePhoneCount = selectedItems.filter(i => i.hasPhone).length;
  const reachableEmailCount = selectedItems.filter(i => i.hasEmail).length;
  const estimatedCost = Math.round(reachablePhoneCount * 0.82);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Marketing Broadcast Hub</h1>
              <p className="text-sm text-muted-foreground">
                Re-engage lost inquiries & reward past travelers with festive offers via WhatsApp & Email
              </p>
            </div>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-muted/50 border rounded-lg px-3 py-1.5 text-xs">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Total Campaigns</span>
            <span className="font-bold text-foreground text-sm">{stats?.totalCampaigns ?? 0}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] uppercase font-semibold">Messages Sent</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{stats?.totalSent ?? 0}</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-amber-700 dark:text-amber-300 block text-[10px] uppercase font-semibold">Active Mode</span>
            <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">Dual WhatsApp + Email</span>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={v => {
        setActiveTab(v as any);
        if (v === 'history') fetchHistory();
      }}>
        <TabsList className="grid grid-cols-2 max-w-sm mb-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>New Broadcast</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Campaign History</span>
          </TabsTrigger>
        </TabsList>

        {/* ── CREATE CAMPAIGN CONTENT ── */}
        <TabsContent value="create" className="space-y-6">
          {/* STEP 1: AUDIENCE SELECTOR & SEGMENT */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                    <CardTitle className="text-base font-semibold">Select Target Audience Segment</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Choose who you want to reach. Records are automatically deduplicated by phone & email.
                  </CardDescription>
                </div>

                {/* Segment Pill Switcher */}
                <div className="flex items-center p-1 bg-muted rounded-lg border">
                  <button
                    type="button"
                    onClick={() => setSegment('lost')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      segment === 'lost' 
                        ? "bg-background text-foreground shadow-sm font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    <span>Lost Inquiries ({segment === 'lost' ? audience.length : '...'})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSegment('completed')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      segment === 'completed' 
                        ? "bg-background text-foreground shadow-sm font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Gift className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Completed Tours ({segment === 'completed' ? audience.length : '...'})</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Audience Table Filters & Quick Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, destination..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Quick Select:</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSelectAll(true)}
                    className="h-8 text-xs"
                  >
                    Select All ({filteredAudience.length})
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectWhatsAppOnly}
                    className="h-8 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    With WhatsApp
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectEmailOnly}
                    className="h-8 text-xs text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    With Email
                  </Button>
                  {selectedIds.size > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedIds(new Set())}
                      className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </div>

              {/* Interactive Recipient Grid */}
              <div className="border rounded-lg overflow-hidden max-h-[340px] overflow-y-auto">
                {loadingAudience ? (
                  <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                    <p className="text-xs">Loading deduplicated audience...</p>
                  </div>
                ) : filteredAudience.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    No contacts found in this segment matching your search.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-muted/70 sticky top-0 z-10 border-b text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={filteredAudience.length > 0 && selectedIds.size === filteredAudience.length}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
                          />
                        </th>
                        <th className="p-3">Customer / Query</th>
                        <th className="p-3">Contact Details</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Eligible Channels</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAudience.map(item => {
                        const isSelected = selectedIds.has(item.queryId);
                        return (
                          <tr
                            key={item.queryId}
                            onClick={() => handleToggleOne(item.queryId)}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-muted/40",
                              isSelected ? "bg-primary/5 font-medium" : ""
                            )}
                          >
                            <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleOne(item.queryId)}
                                className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-foreground">{item.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{item.queryCode}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3 w-3 text-emerald-600" />
                                <span>{item.phone || '—'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                <Mail className="h-3 w-3 text-blue-600" />
                                <span className="truncate max-w-[160px]">{item.email || '—'}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-foreground">{item.destination || 'General Inquiry'}</span>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] uppercase font-semibold capitalize",
                                  item.status === 'lost' ? "border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" :
                                  item.status === 'completed' ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                                  "border-amber-300 bg-amber-50 text-amber-700"
                                )}
                              >
                                {item.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {item.hasPhone && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    WA
                                  </span>
                                )}
                                {item.hasEmail && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    Email
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Selection Summary Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground pt-1 gap-2">
                <div>
                  Showing {filteredAudience.length} of {audience.length} deduplicated contacts.
                </div>
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-primary font-bold">
                    ✓ {selectedIds.size} Selected
                  </span>
                  <span>
                    (WhatsApp: {reachablePhoneCount} | Email: {reachableEmailCount})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 2: CAMPAIGN DETAILS & CHANNELS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Controls */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                    <CardTitle className="text-base font-semibold">Campaign Message & Channels</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Configure your message content, discount offer, and delivery channels.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Campaign Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Campaign Name</Label>
                    <Input
                      placeholder="e.g. Diwali Win-Back Campaign 2026"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Channel Selection Toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Dispatch Channel</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                        onClick={() => setChannel('both')}
                        className={cn(
                          "cursor-pointer border rounded-lg p-3 text-center transition-all",
                          channel === 'both' 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-semibold text-xs flex items-center justify-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          <span>Both Channels</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Smart dual delivery (WA + Email)</p>
                      </div>

                      <div
                        onClick={() => setChannel('whatsapp')}
                        className={cn(
                          "cursor-pointer border rounded-lg p-3 text-center transition-all",
                          channel === 'whatsapp' 
                            ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500" 
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-semibold text-xs flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span>WhatsApp Only</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">~95% open rate via Meta API</p>
                      </div>

                      <div
                        onClick={() => setChannel('email')}
                        className={cn(
                          "cursor-pointer border rounded-lg p-3 text-center transition-all",
                          channel === 'email' 
                            ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500" 
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-semibold text-xs flex items-center justify-center gap-1.5 text-blue-700 dark:text-blue-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email Only</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Free Brevo delivery + flyer</p>
                      </div>
                    </div>
                  </div>

                  {/* Preset Template Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Offer Template Preset</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {TEMPLATE_PRESETS.map(preset => {
                        const isChosen = selectedPreset.id === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={cn(
                              "text-left p-2.5 rounded-lg border transition-all text-xs",
                              isChosen ? "border-primary bg-primary/5 font-semibold ring-1 ring-primary" : "hover:border-muted-foreground/40"
                            )}
                          >
                            <div className="truncate font-medium">{preset.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate mt-0.5">{preset.promoCode}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Template Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Discount / Offer Highlight</Label>
                      <Input
                        value={offerText}
                        onChange={e => setOfferText(e.target.value)}
                        placeholder="e.g. Up to ₹15,000 OFF on Holiday Packages"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Coupon / Promo Code</Label>
                      <Input
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder="e.g. DIWALI2026"
                        className="h-9 text-xs font-mono font-bold uppercase"
                      />
                    </div>
                  </div>

                  {/* Dedicated Concierge WhatsApp Routing (Team Member Number) */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <span>Travel Concierge Routing (Destination Team Number)</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                        Incoming Lead Destination
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      When customers click <strong>&quot;Chat with Travel Concierge&quot;</strong>, their chat will open directly with this team member&apos;s phone number.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-emerald-950 dark:text-emerald-200">Team Member WhatsApp Number</Label>
                        <Input
                          value={conciergePhone}
                          onChange={e => setConciergePhone(e.target.value)}
                          placeholder="918910759374"
                          className="h-8 text-xs font-mono bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-emerald-950 dark:text-emerald-200">Pre-filled Customer Message</Label>
                        <Input
                          value={conciergeMessage}
                          onChange={e => setConciergeMessage(e.target.value)}
                          placeholder="Hi! I'd like to plan a trip with Imagica Holidays."
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Specific Inputs */}
                  {(channel === 'email' || channel === 'both') && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Mail className="h-4 w-4" />
                        <span>Email Channel Content</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Email Subject Line</Label>
                        <Input
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Email Message Body (HTML supported)</Label>
                        <Textarea
                          rows={6}
                          value={emailContent}
                          onChange={e => setEmailContent(e.target.value)}
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Attachment Section (PDF / Flyer) */}
                  <div className="border-t pt-4 space-y-2">
                    <Label className="text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Attach Offer Flyer or Tour Catalog (PDF / Image)</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">Max 25MB</span>
                    </Label>

                    {attachment ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 text-rose-500 shrink-0" />
                          <div className="truncate text-xs">
                            <span className="font-semibold text-foreground">{attachment.filename}</span>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline ml-2 text-[10px] inline-flex items-center gap-0.5"
                            >
                              <span>Preview</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachment(null)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/30 transition-colors">
                        <input
                          type="file"
                          id="flyer-upload"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingFile}
                        />
                        <label
                          htmlFor="flyer-upload"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1"
                        >
                          {uploadingFile ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          )}
                          <span className="text-xs font-semibold text-foreground">
                            {uploadingFile ? 'Uploading to cloud...' : 'Click to upload Diwali Flyer / Catalog'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Delivered directly as a downloadable PDF in WhatsApp & attached in Email
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Live Preview & Launch Card */}
            <div className="space-y-6">
              {/* WhatsApp Live Preview Bubble */}
              <Card className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-600 text-white p-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs font-bold">WhatsApp Live Message Preview</span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 bg-[#E5DDD5] dark:bg-zinc-900 min-h-[300px] flex flex-col justify-between">
                  <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow text-xs space-y-2 max-w-[95%] border">
                    {/* Header Document Preview */}
                    {attachment && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded p-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div className="truncate text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                          {attachment.filename}
                        </div>
                      </div>
                    )}

                    <div className="text-zinc-800 dark:text-zinc-100 text-xs leading-relaxed">
                      Hello <strong>{'{{Customer Name}}'}</strong>, ✨
                      <br /><br />
                      Celebrate this season with <strong>Imagica Holidays</strong>!
                      <br /><br />
                      🎁 {offerText}
                      <br /><br />
                      Use Promo Code: <strong className="text-emerald-600">{promoCode}</strong>
                      <br /><br />
                      {attachment && '📄 Please find our special travel catalog attached above.'}
                    </div>

                    <div className="pt-2 border-t space-y-1.5">
                      <a
                        href={conciergeWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-2 px-3 rounded text-[11px] font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer no-underline"
                        title={`Click to test opening WhatsApp chat to +${conciergePhone}`}
                      >
                        <span>💬 Chat with Travel Concierge</span>
                        <ExternalLink className="h-3 w-3 opacity-90 group-hover:opacity-100" />
                      </a>
                      <div className="text-[10px] text-center text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-center gap-1">
                        <span>👉 Opens chat with:</span>
                        <code className="bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-200">
                          +{conciergePhone}
                        </code>
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-center py-1 rounded text-[10px]">
                        🛑 Stop Promotions
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-zinc-500 mt-2">
                    Delivered via official Meta Cloud API
                  </div>
                </CardContent>
              </Card>

              {/* Launch & Safety Confirmation Card */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Launch & Safeguards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost & Recipient Stats */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Recipients:</span>
                      <span className="font-bold">{selectedIds.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WhatsApp Eligible:</span>
                      <span className="font-semibold text-emerald-600">{reachablePhoneCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Eligible:</span>
                      <span className="font-semibold text-blue-600">{reachableEmailCount}</span>
                    </div>
                    <div className="border-t pt-1.5 flex justify-between font-bold">
                      <span>Est. Meta WhatsApp Cost:</span>
                      <span className="text-emerald-600">~₹{estimatedCost}</span>
                    </div>
                  </div>

                  {/* Safety Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="skip-recent"
                      checked={skipRecentDays}
                      onChange={e => setSkipRecentDays(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                    />
                    <label htmlFor="skip-recent" className="text-xs text-muted-foreground cursor-pointer">
                      <strong>Cooling-off Protection:</strong> Exclude anyone messaged in last 14 days to prevent spam reports.
                    </label>
                  </div>

                  {/* Launch Button */}
                  <Button
                    type="button"
                    onClick={handleLaunch}
                    disabled={launching || selectedIds.size === 0}
                    className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-md"
                  >
                    {launching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Launching Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Launch Broadcast ({selectedIds.size})</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── CAMPAIGN HISTORY CONTENT ── */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Broadcast Campaign History</CardTitle>
                <CardDescription className="text-xs">
                  Review all previously dispatched promotional broadcasts and delivery statuses.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="h-8 text-xs"
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", loadingHistory && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                  <p className="text-xs">Loading campaign history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No broadcast campaigns launched yet. Create your first campaign above!
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground uppercase">
                      <tr>
                        <th className="p-3">Campaign Name</th>
                        <th className="p-3">Target Segment</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3 text-center">Recipients</th>
                        <th className="p-3 text-center">Sent / Failed</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Launched Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {history.map(item => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="p-3 font-semibold text-foreground">
                            {item.name}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {item.segment}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] uppercase font-semibold text-muted-foreground">
                              {item.channel}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">
                            {item.totalRecipients}
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-emerald-600 font-semibold">{item.sentCount}</span>
                            {' / '}
                            <span className="text-rose-500 font-semibold">{item.failedCount}</span>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-semibold capitalize",
                                item.status === 'completed' ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                                item.status === 'sending' ? "border-blue-300 bg-blue-50 text-blue-700 animate-pulse" :
                                item.status === 'failed' ? "border-rose-300 bg-rose-50 text-rose-700" :
                                "border-muted"
                              )}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right text-muted-foreground font-mono text-[11px]">
                            {item.launchedAt ? new Date(item.launchedAt).toLocaleString('en-IN') : new Date(item.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
