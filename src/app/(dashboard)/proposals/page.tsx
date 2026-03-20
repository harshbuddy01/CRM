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
  MapPin
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
      const url = window.URL.createObjectURL(new Blob([res.data]));
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
      // Need toast import if not there, let me check
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
          <h1 className="text-3xl font-bold tracking-tight">Proposals Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track all generated quotes and PDF statuses across your leads.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Proposals</p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">PDF Ready</p>
                <h3 className="text-2xl font-bold mt-1">{stats.ready}</h3>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Dispatched</p>
                <h3 className="text-2xl font-bold mt-1">{stats.sent}</h3>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600">
                <Send className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">PDF Pending</p>
                <h3 className="text-2xl font-bold mt-1">{stats.pending}</h3>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by customer, destination, or Lead ID..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        {!filteredProposals || filteredProposals.length === 0 ? (
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No proposals found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
              Start building professional travel packages from the leads pipeline.
            </p>
            <Link href="/queries">
              <Button>
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Go to Leads
              </Button>
            </Link>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Lead ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-center">Ver</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>PDF Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((p: any) => (
                <TableRow key={p.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.query?.queryCode}</TableCell>
                  <TableCell className="font-medium">{p.query?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {p.query?.destination || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-primary">v{p.version}</TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <IndianRupee className="w-3 h-3 mr-0.5" />
                      {Number(p.sellingPrice).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                      p.pdfStatus === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                      p.pdfStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.pdfStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(p.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => downloadPdf.mutate(p)}
                        disabled={downloadingId === p.id}
                      >
                        {downloadingId === p.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
                        PDF
                      </Button>
                      <Link href={`/queries/${p.queryId}`}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                          <Eye className="w-4 h-4 mr-2" /> View Lead
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
