'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Loader2, 
  Search, 
  CheckCircle2, 
  Send, 
  Clock, 
  Eye, 
  ArrowRight,
  TrendingUp,
  IndianRupee,
  MapPin,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProposalsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadPdf = useMutation({
    mutationFn: async (proposal: any) => {
      setDownloadingId(proposal.id);
      const res = await api.get(`/proposals/${proposal.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Proposal-v${proposal.version}-${proposal.query?.queryCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => setDownloadingId(null),
    onError: () => {
      setDownloadingId(null);
      toast.error('Failed to download PDF');
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['proposals-all'],
    queryFn: async () => {
      const res = await api.get('/proposals');
      return res.data.data;
    }
  });

  const filteredProposals = data?.filter((p: any) => 
    p.query?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.query?.queryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.query?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const stats = {
    total: data?.length || 0,
    ready: data?.filter((p: any) => p.pdfStatus === 'ready').length || 0,
    sent: data?.filter((p: any) => p.sentAt || p.lastSentAt).length || 0,
    pending: data?.filter((p: any) => p.pdfStatus === 'pending').length || 0
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">Proposals Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-xs md:text-sm font-medium">Track generated quotes and PDF statuses across leads.</p>
        </div>
      </div>

      {/* Summary Row */}
      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'blue', text: 'text-blue-600/70', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Ready', value: stats.ready, icon: CheckCircle2, color: 'emerald', text: 'text-emerald-600/70', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'purple', text: 'text-purple-600/70', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
          { label: 'Wait', value: stats.pending, icon: Clock, color: 'amber', text: 'text-amber-600/70', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
        ].map((item) => (
          <Card key={item.label} className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-[10px] md:text-xs font-black uppercase tracking-widest", item.text)}>{item.label}</p>
                  <h3 className="text-lg md:text-2xl font-black mt-1 text-slate-900">{item.value}</h3>
                </div>
                <div className={cn("p-2 rounded-xl shadow-sm", item.bg, item.iconColor)}>
                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search proposals..." 
            className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {!filteredProposals || filteredProposals.length === 0 ? (
          <CardContent className="py-16 text-center border rounded-xl bg-white shadow-sm">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-900">No proposals found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-6 text-sm">
              Start building professional travel packages from the leads pipeline.
            </p>
            <Link href="/queries">
              <Button className="rounded-xl px-8 font-bold">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Go to Leads
              </Button>
            </Link>
          </CardContent>
        ) : (
          <>
            {/* Desktop View */}
            <Card className="hidden md:block border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold">Lead ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Destination</TableHead>
                    <TableHead className="text-center font-bold">Ver</TableHead>
                    <TableHead className="font-bold">Price</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Created</TableHead>
                    <TableHead className="text-right font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((p: any) => (
                    <TableRow key={p.id} className="group hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-[10px] text-slate-500">{p.query?.queryCode}</TableCell>
                      <TableCell className="font-bold text-slate-800">{p.query?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {p.query?.destination || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-primary">v{p.version}</TableCell>
                      <TableCell className="font-black text-slate-900">
                        {p.sellingPrice && isFinite(Number(p.sellingPrice)) 
                          ? `₹${Number(p.sellingPrice).toLocaleString('en-IN')}` 
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border shadow-sm ${
                          p.pdfStatus === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          p.pdfStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {p.pdfStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] text-slate-500 font-medium">
                        {p.createdAt && !isNaN(new Date(p.createdAt).getTime())
                          ? format(new Date(p.createdAt), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 md:h-9 hover:bg-slate-100 rounded-lg font-bold text-xs"
                            onClick={() => downloadPdf.mutate(p)}
                            disabled={downloadingId === p.id}
                          >
                            {downloadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                            PDF
                          </Button>
                          <Link href={`/queries/${p.queryId}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 pb-8">
              {filteredProposals.map((p: any) => (
                <Card key={p.id} className="p-5 border-slate-200 shadow-md rounded-2xl active:scale-[0.98] transition-all overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/20 shadow-xs uppercase tracking-tighter">Ver {p.version}</span>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{p.query?.queryCode}</span>
                      </div>
                      <h3 className="font-black text-lg text-slate-900 leading-tight">{p.query?.name}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border shadow-sm ${
                      p.pdfStatus === 'ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      p.pdfStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {p.pdfStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Selling Price</p>
                      <p className="font-black text-slate-900 text-sm">
                        {p.sellingPrice && isFinite(Number(p.sellingPrice))
                          ? `₹${Number(p.sellingPrice).toLocaleString('en-IN')}`
                          : '—'}
                      </p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Destination</p>
                      <p className="font-black text-slate-700 truncate">{p.query?.destination || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      className="flex-1 bg-primary text-white font-black h-11 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95"
                      onClick={() => downloadPdf.mutate(p)}
                      disabled={downloadingId === p.id}
                    >
                      {downloadingId === p.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      GET PDF
                    </Button>
                    <Link href={`/queries/${p.queryId}`}>
                      <Button variant="outline" size="icon" className="h-11 w-11 border-slate-200 text-slate-400 hover:text-primary rounded-xl shadow-sm">
                        <Eye className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
