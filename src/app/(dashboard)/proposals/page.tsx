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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Proposals Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track generated quotes and PDF statuses across leads.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200">
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total</p>
                <h3 className="text-xl md:text-2xl font-black mt-0.5">{stats.total}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200">
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ready</p>
                <h3 className="text-xl md:text-2xl font-black mt-0.5">{stats.ready}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200">
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Sent</p>
                <h3 className="text-xl md:text-2xl font-black mt-0.5">{stats.sent}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200">
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Wait</p>
                <h3 className="text-xl md:text-2xl font-black mt-0.5">{stats.pending}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search proposals..." 
            className="pl-8 h-10 md:h-9"
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
                <Card key={p.id} className="p-4 border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">V{p.version}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{p.query?.queryCode}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{p.query?.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${
                      p.pdfStatus === 'ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      p.pdfStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {p.pdfStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-sm">
                        {p.sellingPrice && isFinite(Number(p.sellingPrice))
                          ? `₹${Number(p.sellingPrice).toLocaleString('en-IN')}`
                          : '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Destination</p>
                      <p className="font-bold text-slate-700 truncate">{p.query?.destination || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button 
                      className="flex-1 bg-primary text-white font-bold h-10 rounded-xl"
                      onClick={() => downloadPdf.mutate(p)}
                      disabled={downloadingId === p.id}
                    >
                      {downloadingId === p.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Download PDF
                    </Button>
                    <Link href={`/queries/${p.queryId}`}>
                      <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-400 hover:text-primary rounded-xl">
                        <Eye className="w-4 h-4" />
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
