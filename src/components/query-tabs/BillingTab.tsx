'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, IndianRupee, TrendingUp, CreditCard, Copy, ExternalLink, Send, RefreshCw, Download, Pencil, Trash2, Mail, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth-store';

interface ImageUploadFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  description?: string;
}

function ImageUploadField({ label, placeholder, value, onChange, description }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        onChange(res.data.url);
        toast.success(`${label} uploaded successfully!`);
      } else {
        toast.error('Upload response invalid');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 font-normal transition-colors lowercase tracking-normal"
          >
            Clear Image
          </button>
        )}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10 h-10 rounded-xl bg-slate-50 border-slate-200"
          />
          {value && (
            <div className="absolute right-2 top-2 w-6 h-6 rounded border overflow-hidden bg-muted flex items-center justify-center">
              <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl border-slate-200 font-bold"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
        </Button>
      </div>
      {description && <p className="text-[10px] text-slate-400 font-medium">{description}</p>}
    </div>
  );
}

export function BillingTab({ queryId }: { queryId: string }) {
  const queryClient = useQueryClient();

  const { data: queryObj, isLoading: queryLoading } = useQuery({
    queryKey: ['query', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}`);
      return res.data.data;
    },
  });

  const { data: proposals, isLoading: proposalsLoading, isError: proposalsError } = useQuery({
    queryKey: ['proposals', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/proposals`);
      return res.data.data || [];
    },
  });

  const { data, isLoading, isError: billingError } = useQuery({
    queryKey: ['billing-summary', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/billing-summary`);
      return res.data.data;
    },
  });

  // ALL hooks must be declared ABOVE any conditional return (React rules of hooks)
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const downloadBillingPdf = useMutation({
    mutationFn: async () => {
      setIsDownloading(true);
      const res = await api.get(`/queries/${queryId}/billing-statement/pdf`, { responseType: 'blob' });
      return res.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Billing-Statement-${queryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsDownloading(false);
      toast.success('Billing Statement Downloaded');
    },
    onError: (err: any) => {
      setIsDownloading(false);
      toast.error('Failed to download billing statement', { description: err.response?.data?.message || err.message });
    }
  });





  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/finance/invoices', { queryId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invoice generated successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices', queryId] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
    },
    onError: (err: any) => {
      toast.error('Failed to generate invoice', { description: err.response?.data?.message || err.message });
    }
  });
  
  const regenerateInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await api.put(`/finance/invoices/${invoiceId}/regenerate`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invoice updated with latest details');
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
    },
    onError: (err: any) => {
      toast.error('Failed to update invoice', { description: err.response?.data?.message || err.message });
    }
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [isSupplierPaymentOpen, setIsSupplierPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('Booking Payment');
  const [generatedLink, setGeneratedLink] = useState('');

  const requestPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/razorpay-link', {
        queryId,
        amount: Number(paymentAmount),
        description: paymentDesc
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Payment link generated!');
      setGeneratedLink(data.linkUrl);
    },
    onError: (err: any) => {
      toast.error('Failed to generate payment link', { description: err.response?.data?.message || err.message });
    }
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Link copied to clipboard');
  };

  const recordManualPaymentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Manual payment recorded successfully');
      setIsManualPaymentOpen(false);
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
      queryClient.invalidateQueries({ queryKey: ['payments', queryId] });
    },
    onError: (err: any) => {
      toast.error('Failed to record payment', { description: err.response?.data?.message || err.message });
    }
  });

  const recordSupplierPaymentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/finance/vendor-payments', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Supplier payment recorded successfully');
      setIsSupplierPaymentOpen(false);
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
      queryClient.invalidateQueries({ queryKey: ['payments', queryId] });
      queryClient.invalidateQueries({ queryKey: ['booking-services', queryId] });
    },
    onError: (err: any) => {
      toast.error('Failed to record supplier payment', { description: err.response?.data?.message || err.message });
    }
  });

  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMode, setEditMode] = useState('upi');
  const [editUtr, setEditUtr] = useState('');

  const updatePaymentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put(`/payments/${editingPayment.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment updated successfully');
      setEditingPayment(null);
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
      queryClient.invalidateQueries({ queryKey: ['payments', queryId] });
    },
    onError: (err: any) => {
      toast.error('Failed to update payment', { description: err.response?.data?.message || err.message });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await api.delete(`/payments/${paymentId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment record removed');
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
      queryClient.invalidateQueries({ queryKey: ['payments', queryId] });
    },
    onError: (err: any) => {
      toast.error('Failed to remove payment', { description: err.response?.data?.message || err.message });
    }
  });

  const [isSendBillingEmailOpen, setIsSendBillingEmailOpen] = useState(false);
  const [billingEmailRecipient, setBillingEmailRecipient] = useState('');

  const sendBillingEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post(`/queries/${queryId}/billing-statement/send-email`, { email });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Billing statement PDF emailed to customer successfully!');
      setIsSendBillingEmailOpen(false);
    },
    onError: (err: any) => {
      toast.error('Failed to send billing email', { description: err.response?.data?.message || err.message });
    }
  });

  if (isLoading || proposalsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
      </div>
    );
  }

  if (proposalsError || billingError) {
    return (
      <Card className="border-red-100 bg-red-50/30">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 font-bold mb-2">Sync Connection Interrupted</p>
          <p className="text-xs text-red-400">We couldn't retrieve the latest billing data. Please try again.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: [queryId] })}>
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasConfirmedProposal = Array.isArray(proposals) && proposals.some((p: any) => p.status === 'confirmed');

  if (!hasConfirmedProposal) {
    return (
      <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="p-12 text-center">
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Billing Section Locked</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
            Please finalize any proposal from the client side before generating bills or recording payments.
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

  if (!data) return <Card><CardContent className="p-8 text-center text-muted-foreground">Unable to load billing data.</CardContent></Card>;

  const { customer, supplier, payments, invoice } = data;

  const KpiCard = ({ label, value, color = 'text-foreground', icon: Icon = IndianRupee }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">{label}</p></div>
        <p className={`text-xl font-bold ${color}`}>₹{Number(value).toLocaleString('en-IN')}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">Customer Side</h3>
          <p className="text-xs text-slate-400 font-medium">Billing overview & customer payment actions</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200 shadow-xs">
          {/* 1. Download Statement */}
          <button 
            type="button"
            onClick={() => downloadBillingPdf.mutate()}
            disabled={isDownloading}
            title="Download Billing Statement PDF"
            className="relative group w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-xs"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap z-50 shadow-md">
              Download Statement
            </span>
          </button>

          {/* 2. Email Statement */}
          <button 
            type="button"
            onClick={() => {
              setBillingEmailRecipient(queryObj?.email || '');
              setIsSendBillingEmailOpen(true);
            }}
            title="Email Billing Statement"
            className="relative group w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-xs"
          >
            <Mail className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap z-50 shadow-md">
              Email Statement
            </span>
          </button>

          {/* 3. WhatsApp Statement */}
          <button 
            type="button"
            onClick={async () => {
              const name = queryObj?.name || 'Customer';
              const total = Number(customer?.totalAmount || 0).toLocaleString('en-IN');
              const received = Number(customer?.totalReceived || 0).toLocaleString('en-IN');
              const pending = Number(customer?.totalPending || 0).toLocaleString('en-IN');
              const text = `Hi ${name}! 🌟\n\nHere is your updated billing statement from *Imagica Holidays*:\n\n💰 *Total Package:* ₹${total}\n✅ *Amount Received:* ₹${received}\n📌 *Pending Balance:* ₹${pending}\n\nThank you for choosing Imagica Holidays! 🙏`;
              const phone = (queryObj?.phone || '').replace(/\D/g, '');
              if (!phone) return toast.error('Client phone number missing');
              try {
                await api.post(`/whatsapp-chat/conversations/${phone}/send`, { message: text });
                toast.success('Billing statement sent directly via WhatsApp API! 🚀');
              } catch (err: any) {
                toast.error('Failed to dispatch WhatsApp message');
              }
            }}
            title="Send Statement via WhatsApp"
            className="relative group w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap z-50 shadow-md">
              WhatsApp Statement
            </span>
          </button>

          <div className="w-px h-5 bg-slate-200 mx-0.5" />

          {/* 4. Request Payment */}
          <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
            setIsPaymentModalOpen(open);
            if (open) {
              setPaymentAmount(String(customer?.totalPending || 0));
              setGeneratedLink('');
            }
          }}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  title="Request Online Payment (Razorpay)"
                  className="relative group w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap z-50 shadow-md">
                    Request Payment
                  </span>
                </button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Payment Request</DialogTitle>
              </DialogHeader>
              {!generatedLink ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Request Amount (₹)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      value={paymentAmount} 
                      onChange={(e) => setPaymentAmount(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      placeholder="e.g. Advance Payment for Bali Trip" 
                      value={paymentDesc} 
                      onChange={(e) => setPaymentDesc(e.target.value)} 
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={requestPaymentMutation.isPending || !paymentAmount}
                    onClick={() => requestPaymentMutation.mutate()}
                  >
                    {requestPaymentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Generate Razorpay Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-muted rounded-lg border text-center break-all text-sm font-mono">
                    {generatedLink}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" /> Copy Link
                    </Button>
                    <Button 
                      render={
                        <a href={generatedLink} target="_blank" rel="noreferrer" className="gap-2 bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg px-2.5 h-8 text-sm font-medium">
                          <ExternalLink className="w-4 h-4" /> Open Link
                        </a>
                      }
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Note: Customer will also receive SMS/Email notifications from Razorpay automatically.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* 5. Record Manual Payment */}
          <Dialog open={isManualPaymentOpen} onOpenChange={setIsManualPaymentOpen}>
            <DialogTrigger 
              render={
                <button
                  type="button"
                  title="Record Manual Payment"
                  className="relative group w-9 h-9 rounded-full flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap z-50 shadow-md">
                    Record Manual Payment
                  </span>
                </button>
              } 
            />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Record Manual Payment</DialogTitle></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const amountRaw = formData.get('amount') as string;
                const mode = formData.get('mode') as string;
                const date = formData.get('date') as string;
                const reference = formData.get('reference') as string;
                const notes = formData.get('notes') as string;

                const amount = parseFloat(amountRaw);
                if (isNaN(amount) || amount <= 0) {
                  toast.error("Please enter a valid positive amount");
                  return;
                }

                if (!mode || !date) {
                  toast.error("Payment mode and date are required");
                  return;
                }

                recordManualPaymentMutation.mutate({
                  amount,
                  mode: mode || 'upi',
                  paymentDate: date,
                  referenceUtr: reference || '',
                  notes: notes || '',
                  queryId
                });
              }} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input name="amount" type="number" defaultValue={customer.totalPending} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <select name="mode" className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="upi">UPI/QR</option>
                      <option value="cash">Cash</option>
                      <option value="neft">NEFT/Bank</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reference/UTR (Optional)</Label>
                  <Input name="reference" placeholder="Transaction ID" />
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Input name="notes" placeholder="e.g. Received at office" />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={recordManualPaymentMutation.isPending}>
                  {recordManualPaymentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Payment Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Amount" value={customer.totalAmount} />
        <KpiCard label="Received" value={customer.totalReceived} color="text-green-600" />
        <KpiCard label="Pending" value={customer.totalPending} color={customer.totalPending > 0 ? 'text-red-600' : 'text-green-600'} />
        <KpiCard label="Gross Profit" value={customer.grossProfit} color={customer.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'} icon={TrendingUp} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">Supplier Side</h3>
            <p className="text-xs text-slate-400 font-medium">Hotel & transport vendor payouts</p>
          </div>
          <Dialog open={isSupplierPaymentOpen} onOpenChange={setIsSupplierPaymentOpen}>
            <DialogTrigger 
              render={
                <button
                  type="button"
                  title="Record Supplier Payment"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Record Supplier Payment
                </button>
              } 
            />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Record Supplier Payment</DialogTitle></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const amountRaw = formData.get('amount') as string;
                const mode = formData.get('mode') as string;
                const date = formData.get('date') as string;
                const reference = formData.get('reference') as string;
                const notes = formData.get('notes') as string;
                const vendorName = formData.get('vendorName') as string;

                const amount = parseFloat(amountRaw);
                if (isNaN(amount) || amount <= 0) {
                  toast.error("Please enter a valid positive amount");
                  return;
                }
                if (!mode || !date) {
                  toast.error("Payment mode and date are required");
                  return;
                }

                recordSupplierPaymentMutation.mutate({
                  amount,
                  mode: mode || 'upi',
                  paymentDate: date,
                  referenceId: reference || '',
                  vendorName: vendorName || 'General Supplier',
                  notes: notes || '',
                  queryId
                });
              }} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Vendor / Supplier Name</Label>
                  <Input name="vendorName" placeholder="e.g. ABC Transports" required />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input name="amount" type="number" defaultValue={supplier.supplierPending > 0 ? supplier.supplierPending : ''} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <select name="mode" className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="upi">UPI/QR</option>
                      <option value="cash">Cash</option>
                      <option value="neft">NEFT/Bank</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reference/UTR (Optional)</Label>
                  <Input name="reference" placeholder="Transaction ID" />
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Input name="notes" placeholder="e.g. Taxi advance" />
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={recordSupplierPaymentMutation.isPending}>
                  {recordSupplierPaymentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Supplier Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Supplier Cost" value={supplier.supplierAmount} />
          <KpiCard label="Paid to Suppliers" value={supplier.supplierReceived} color="text-green-600" />
          <KpiCard label="Supplier Pending" value={supplier.supplierPending} color={supplier.supplierPending > 0 ? 'text-amber-600' : 'text-green-600'} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Payment History</h3>
        {!payments?.length ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No payments recorded yet.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {payments.map((p: any) => {
              const isSupplier = !!p.vendorName;
              return (
              <Card key={p.id} className={isSupplier ? 'border-amber-200 bg-amber-50/30' : ''}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-4 h-4 ${isSupplier ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <div>
                      <p className="text-sm font-medium">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.mode.toUpperCase()} {p.referenceUtr ? `• ${p.referenceUtr}` : p.referenceId ? `• ${p.referenceId}` : ''}
                      </p>
                      {isSupplier ? <p className="text-[10px] font-semibold text-amber-700 mt-0.5">TO: {p.vendorName}</p> : null}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    {isSupplier ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">supplier payment</span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'verified' || p.status === 'banked' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>customer • {p.status}</span>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(p.paymentDate), 'PP')}</p>
                    {!isSupplier && (
                      <div className="flex items-center gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                          onClick={() => {
                            setEditingPayment(p);
                            setEditAmount(String(p.amount));
                            setEditMode(p.mode || 'upi');
                            setEditUtr(p.referenceUtr || p.referenceId || '');
                          }}
                        >
                          <Pencil className="w-3 h-3 mr-1 text-slate-500" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove this payment entry of ₹${Number(p.amount).toLocaleString('en-IN')}?`)) {
                              deletePaymentMutation.mutate(p.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1 text-red-500" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Invoice Status</h3>
        {invoice ? (
          <Card><CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{invoice.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">₹{Number(invoice.totalAmount).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>{invoice.status}</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 h-8 text-xs bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                disabled={downloadingInvoiceId === invoice.id}
                onClick={async () => {
                  try {
                    setDownloadingInvoiceId(invoice.id);
                    const res = await api.get(`/finance/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast.success('Invoice PDF downloaded successfully');
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || err.message || 'Could not generate PDF');
                  } finally {
                    setDownloadingInvoiceId(null);
                  }
                }}
              >
                {downloadingInvoiceId === invoice.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 h-8 text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                onClick={() => regenerateInvoiceMutation.mutate(invoice.id)}
                disabled={regenerateInvoiceMutation.isPending}
              >
                {regenerateInvoiceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3" />}
                Update
              </Button>
            </div>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-muted-foreground">No invoice generated yet.</p>
              <Button 
                onClick={() => generateInvoiceMutation.mutate()}
                disabled={generateInvoiceMutation.isPending}
              >
                {generateInvoiceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Payment Dialog Modal */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => { if (!open) setEditingPayment(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Recorded Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editAmount || Number(editAmount) <= 0) {
              toast.error('Please enter a valid amount');
              return;
            }
            updatePaymentMutation.mutate({
              amount: Number(editAmount),
              mode: editMode,
              referenceUtr: editUtr,
            });
          }} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Payment Amount (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 40000"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={editMode}
                onChange={(e) => setEditMode(e.target.value)}
              >
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="neft">NEFT / RTGS / IMPS</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Reference UTR / Txn ID (Optional)</Label>
              <Input
                type="text"
                placeholder="e.g. UTR12345678"
                value={editUtr}
                onChange={(e) => setEditUtr(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePaymentMutation.isPending}>
                {updatePaymentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Billing Statement Email Modal */}
      <Dialog open={isSendBillingEmailOpen} onOpenChange={setIsSendBillingEmailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Mail className="w-5 h-5 text-blue-600" /> Email Billing Statement PDF
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!billingEmailRecipient) {
              toast.error('Please enter a valid email address');
              return;
            }
            sendBillingEmailMutation.mutate(billingEmailRecipient);
          }} className="space-y-4 pt-2">
            <p className="text-xs text-slate-500">
              This will email the official <strong>Billing Statement PDF</strong> (identical to the downloaded statement) directly to your customer.
            </p>
            <div className="space-y-2">
              <Label>Customer Email Address</Label>
              <Input
                type="email"
                placeholder="e.g. customer@example.com"
                value={billingEmailRecipient}
                onChange={(e) => setBillingEmailRecipient(e.target.value)}
                required
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Total Package:</span><span className="font-bold text-slate-800">₹{Number(customer?.totalAmount || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Amount Received:</span><span className="font-bold text-emerald-600">₹{Number(customer?.totalReceived || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-1"><span>Balance Pending:</span><span className="font-bold text-rose-600">₹{Number(customer?.totalPending || 0).toLocaleString('en-IN')}</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSendBillingEmailOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendBillingEmailMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                {sendBillingEmailMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send PDF Statement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


