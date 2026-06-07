'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';

export function InvoiceTab({ queryId }: { queryId: string }) {
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['query-invoices', queryId],
    queryFn: async () => {
      const res = await api.get(`/finance/invoices?queryId=${queryId}`);
      return res.data?.data?.items || [];
    },
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/proposals`);
      return res.data.data;
    },
  });

  const hasConfirmedProposal = proposals?.some((p: any) => p.status === 'confirmed');

  if (invoicesLoading || proposalsLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  if (!hasConfirmedProposal) {
    return (
      <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="p-12 text-center">
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Invoicing Locked</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
            Please finalize any proposal from the client side before generating invoices.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Awaiting Confirmation
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Invoices</h3>
      </div>

      {!invoices?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No invoices found for this query. Generate one from the Billing tab.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => (
            <Card key={inv.id} className="hover:border-primary transition-colors cursor-pointer group" onClick={() => window.open(`/finance/invoices/${inv.id}`, '_blank')}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-slate-900">{inv.invoiceNumber}</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Issued: {format(new Date(inv.createdAt), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-black text-slate-900">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/finance/invoices/${inv.id}/pdf`, {
                            headers: { 'Authorization': `Bearer ${useAuthStore.getState().accessToken || localStorage.getItem('token')}` }
                          });
                          if (!response.ok) throw new Error('Failed');
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Invoice-${inv.invoiceNumber}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          toast.success('Invoice PDF Downloaded');
                        } catch (err) {
                          toast.error('Could not download PDF');
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => window.open(`/finance/invoices/${inv.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
