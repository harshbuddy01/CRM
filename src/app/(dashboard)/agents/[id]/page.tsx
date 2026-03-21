'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
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
  Trophy
} from 'lucide-react';
import { format } from 'date-fns';

export default function AgentDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: agent, isLoading, isError } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await api.get(`/agents/${id}`);
      return res.data.data;
    },
  });

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
                <span className="font-mono font-bold uppercase">—</span>
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
        </div>
      </div>
    </div>
  );
}
