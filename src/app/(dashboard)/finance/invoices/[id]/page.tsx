'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, FileText, Download, ArrowLeft, 
  Printer, Send, CheckCircle2, AlertCircle,
  Calendar, User, CreditCard, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-100',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100'
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await api.get(`/finance/invoices/${id}`);
      return res.data.data;
    }
  });

  const updateStatusMut = useMutation({
    mutationFn: (status: string) => api.put(`/finance/invoices/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      toast.success('Invoice status updated');
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading invoice details...</p>
    </div>
  );

  if (isError || !invoice) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">Invoice Not Found</h2>
        <p className="text-muted-foreground text-sm">The invoice you are looking for does not exist or you don't have access.</p>
      </div>
      <Button variant="outline" onClick={() => router.back()} className="rounded-xl">Go Back</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-10 px-4 md:px-0">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit -ml-2 rounded-lg text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
        <div className="flex items-center gap-2">
          {invoice.status === 'sent' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-9 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              onClick={() => updateStatusMut.mutate('paid')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Paid
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg h-9 border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={async () => {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/finance/invoices/${id}/pdf`, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error('Failed to download PDF');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
              } catch (err) {
                toast.error('Could not generate PDF. Please try again.');
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" /> Download Bill
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg h-9" 
            onClick={() => {
              const iframe = document.querySelector('iframe');
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.print();
              } else {
                window.print();
              }
            }}
          >
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Invoice Card (Premium PDF Preview) */}
        <div className="md:col-span-2 shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden rounded-2xl bg-white p-0 h-[1050px] relative">
          <iframe 
            src={`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/finance/invoices/${id}/html?token=${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`}
            className="w-full h-full border-none"
            title="Invoice Preview"
          />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b bg-slate-50">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {(() => {
                const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                const balanceDue = Math.max(0, Number(invoice.totalAmount) - totalPaid);
                return (
                  <>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Total Received</p>
                      <p className="text-xl font-black text-emerald-600 leading-none">₹{totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Remaining Balance</p>
                      <p className={cn("text-xl font-black leading-none", balanceDue > 0 ? "text-red-500" : "text-emerald-500")}>
                        ₹{balanceDue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {invoice.payments?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase">Payment History</p>
                         {invoice.payments.slice(0, 3).map((p: any) => (
                           <div key={p.id} className="flex justify-between items-center text-[11px]">
                             <span className="text-slate-500">{format(new Date(p.paymentDate), 'dd MMM')} <span className="uppercase opacity-50 px-1">•</span> {p.mode}</span>
                             <span className="font-bold text-slate-900">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                           </div>
                         ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b bg-slate-50">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" /> Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                <span>Last Updated: {format(new Date(invoice.updatedAt), 'dd MMM, HH:mm')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-3.5 h-3.5 text-slate-300" />
                <span>Source Code: {invoice.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
