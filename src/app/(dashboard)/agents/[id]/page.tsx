'use client';

import { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  CreditCard, 
  Target,
  History,
  ExternalLink,
  MapPin,
  Trophy,
  Palette,
  Image as ImageIcon,
  DollarSign,
  Landmark,
  Percent,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';

export default function AgentDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [markupType, setMarkupType] = useState('percentage');
  const [markupValue, setMarkupValue] = useState(10);
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const { data: agent, isLoading, isError } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await api.get(`/agents/${id}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (agent) {
      setBrandColor(agent.brandColor || '#3b82f6');
      setMarkupType(agent.markupType || 'percentage');
      setMarkupValue(agent.markupValue || 10);
    }
  }, [agent]);

  const handleSaveCustom = async () => {
    setIsSavingCustom(true);
    try {
      await api.put(`/agents/${id}`, {
        brandColor,
        markupType,
        markupValue: Number(markupValue),
      });
      toast.success('Agent brand customizations saved!');
      
      // Trigger WhatsApp notification simulator
      window.dispatchEvent(new CustomEvent('crm-whatsapp-trigger', {
        detail: {
          text: `🔔 Partner Update: Agent "${agent.companyName}" has updated their co-branding parameters.\n\nBrand Color: ${brandColor}\nMarkup: ${markupValue}%\n\nNew shared itineraries will automatically reflect these styles.`,
          buttons: ['View Sample Itinerary'],
          actionKey: 'agent-brand-update'
        }
      }));
      
    } catch {
      toast.error('Failed to save customizations');
    } finally {
      setIsSavingCustom(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>;

  if (isError || !agent) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">B2B Agent Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => router.push('/agents')}>Back to Directory</Button>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/agents')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{agent.companyName}</h1>
            <Badge variant={agent.isActive ? 'secondary' : 'destructive'} className="h-5">
              {agent.isActive ? 'Active Partner' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Onboarded on {format(new Date(agent.createdAt), 'MMMM d, yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Point of Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-xl border border-dashed border-muted-foreground/30 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                   <Building2 className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-bold">{agent.contactPerson || 'Unnamed Contact'}</p>
                   <p className="text-xs text-muted-foreground">Main Coordinator</p>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">{agent.mobile}</span>
                </div>
                {agent.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">{agent.email}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium text-xs">{agent.city || '—'}, {agent.address || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><Target className="w-4 h-4 mr-2" /> GST Number</span>
                <span className="font-mono font-bold uppercase">{agent.gstNumber || 'Not Provided'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><CreditCard className="w-4 h-4 mr-2" /> PAN/ID</span>
                <span className="font-mono font-bold uppercase">{agent.panNumber || '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Banking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><Landmark className="w-4 h-4 mr-2" /> Bank</span>
                <span className="font-medium">{agent.bankName || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><CreditCard className="w-4 h-4 mr-2" /> A/C Number</span>
                <span className="font-mono">{agent.bankAccount || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><MapPin className="w-4 h-4 mr-2" /> IFSC Code</span>
                <span className="font-mono">{agent.bankIfsc || '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Co-branding & Markup Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brand Color Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Palette className="w-3.5 h-3.5 mr-2" /> Brand Hex Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 border border-slate-200 rounded-xl overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-mono font-bold uppercase focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Markup Type Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Percent className="w-3.5 h-3.5 mr-2" /> Markup Type
                </label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMarkupType('percentage')}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm disabled:opacity-50"
                    style={{
                      backgroundColor: markupType === 'percentage' ? '#ffffff' : 'transparent',
                      color: markupType === 'percentage' ? '#0f172a' : '#64748b'
                    }}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkupType('flat')}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm disabled:opacity-50"
                    style={{
                      backgroundColor: markupType === 'flat' ? '#ffffff' : 'transparent',
                      color: markupType === 'flat' ? '#0f172a' : '#64748b'
                    }}
                  >
                    Flat Rate (₹)
                  </button>
                </div>
              </div>

              {/* Markup Value Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-2" /> Default Markup</span>
                  <span className="font-bold text-primary">{markupType === 'percentage' ? `${markupValue}%` : `₹${Number(markupValue).toLocaleString('en-IN')}`}</span>
                </label>
                {markupType === 'percentage' ? (
                  <input
                    type="range"
                    min="0"
                    max="55"
                    value={markupValue}
                    onChange={(e) => setMarkupValue(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                ) : (
                  <input
                    type="number"
                    value={markupValue}
                    onChange={(e) => setMarkupValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="Enter flat markup..."
                  />
                )}
              </div>

              <Button
                onClick={handleSaveCustom}
                disabled={isSavingCustom}
                className="w-full mt-4 rounded-xl font-bold bg-primary hover:brightness-105"
              >
                {isSavingCustom ? 'Saving Customizations...' : 'Save Agent Brand Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* Live Preview Panel */}
          <Card className="overflow-hidden border border-slate-200 shadow-md">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-3 px-4">
              <div>
                <CardTitle className="text-xs font-bold text-slate-800">Co-branded Proposal Preview</CardTitle>
                <CardDescription className="text-[9px]">What the end-customer sees</CardDescription>
              </div>
              <Badge variant="outline" className="text-[9px] bg-white text-slate-500 uppercase tracking-widest font-bold">Client View</Badge>
            </CardHeader>
            <CardContent className="p-4 bg-slate-100/50 flex justify-center items-center">
              {/* Mock Itinerary Brochure Card */}
              <div className="w-full max-w-[280px] bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/60 transition-all duration-300">
                {/* Hero Header colored by brandColor */}
                <div 
                  className="p-4 text-white relative transition-colors duration-300 flex flex-col justify-end h-28" 
                  style={{ backgroundColor: brandColor }}
                >
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 text-[8px] font-bold">
                    7 Days
                  </div>
                  {/* Co-branded Agent Logo Placeholder */}
                  <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center font-bold text-[9px] text-slate-700 mb-2 border border-white/50">
                    {agent.logoUrl ? "🖼️" : agent.companyName.substring(0,2).toUpperCase()}
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider line-clamp-1">Luxury Bali Escape</h4>
                  <p className="text-[8px] text-white/80">Tailored by {agent.companyName}</p>
                </div>
                
                {/* Itinerary info & markup-adjusted price */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Total Price</span>
                    <p className="text-sm font-black text-slate-900 transition-all">
                      ₹{Math.round(40000 * (1 + (markupType === 'percentage' ? markupValue / 100 : markupValue / 40000))).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[8px] text-slate-400 block">(Includes agent markup)</span>
                  </div>

                  <div className="space-y-2 border-t pt-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
                      <span className="text-[9px] font-bold text-slate-700">Day 1: Ubud Jungle Resort</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
                      <span className="text-[9px] font-bold text-slate-700">Day 2: Volcano Trekking</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card>
                <CardContent className="pt-6">
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Leads Sent</p>
                        <h3 className="text-2xl font-bold mt-1">{agent.queries?.length || 0}</h3>
                      </div>
                      <Target className="w-10 h-10 text-indigo-500 opacity-20" />
                   </div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="pt-6">
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Ratio</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {agent.queries?.length > 0 ? ((agent.queries.filter((q:any) => q.status === 'confirmed').length / agent.queries.length) * 100).toFixed(0) : 0}%
                        </h3>
                      </div>
                      <Trophy className="w-10 h-10 text-amber-500 opacity-20" />
                   </div>
                </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Partnership History</CardTitle>
              <CardDescription>A log of leads and queries generated by this partner.</CardDescription>
            </CardHeader>
            <CardContent>
              {agent.queries?.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No queries linked to this agent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agent.queries?.map((q: any) => (
                    <div 
                      key={q.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => router.push(`/queries/${q.id}`)}
                    >
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{q.queryCode}</span>
                         <span className="text-sm font-medium">{q.name}</span>
                         <span className="text-xs text-muted-foreground">• {q.destination || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border">
                          {q.status.replace('_', ' ')}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  )).slice(0, 10)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission Ledger</CardTitle>
              <CardDescription>Recent commissions and adjustments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted/30 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Available Limit</p>
                  <p className="text-xl font-bold text-emerald-600">₹{(agent.creditLimit || 0) - (agent.creditUsed || 0)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Credit Limit</p>
                  <p className="text-xl font-bold">₹{agent.creditLimit || 0}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Credit Used</p>
                  <p className="text-xl font-bold text-rose-600">₹{agent.creditUsed || 0}</p>
                </div>
              </div>

              {(!agent.commissions || agent.commissions.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p>No commissions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agent.commissions.map((comm: any) => (
                    <div key={comm.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all">
                      <div className="flex flex-col">
                         <span className="text-sm font-medium">{comm.description || 'Commission Entry'}</span>
                         <span className="text-xs text-muted-foreground">{format(new Date(comm.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${comm.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {comm.amount >= 0 ? '+' : ''}₹{Math.abs(comm.amount)}
                        </span>
                        <Badge variant={comm.status === 'paid' ? 'secondary' : 'outline'}>{comm.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
