'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, FileText, Download, ArrowLeft, 
  Printer, CheckCircle2, AlertCircle,
  Calendar, User, CreditCard, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
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
      <Label className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 font-bold transition-colors lowercase tracking-normal"
          >
            Clear
          </button>
        )}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs"
          />
          {value && (
            <div className="absolute right-2 top-2.5 w-4 h-4 rounded border overflow-hidden bg-muted flex items-center justify-center">
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
          className="h-9 rounded-xl border-slate-200 text-xs font-bold"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Upload'}
        </Button>
      </div>
      {description && <p className="text-[9px] text-slate-400 font-medium leading-none mt-1">{description}</p>}
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [iframeKey, setIframeKey] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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
      setIframeKey(prev => prev + 1);
      toast.success('Invoice status updated');
    }
  });

  const updateImagesMut = useMutation({
    mutationFn: (data: {
      invoiceHeaderBannerUrl?: string;
      invoiceMiddleBannerUrl?: string;
      invoiceQrCodeUrl?: string;
      invoiceLogoUrl?: string;
    }) => api.put(`/finance/invoices/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      setIframeKey(prev => prev + 1);
      toast.success('Invoice assets updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update invoice images');
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
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-10 px-4 md:px-0">
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
            disabled={isDownloadingPdf}
            onClick={async () => {
              try {
                setIsDownloadingPdf(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/finance/invoices/${id}/pdf`, {
                  headers: { 'Authorization': `Bearer ${useAuthStore.getState().accessToken || localStorage.getItem('token')}` }
                });
                if (!response.ok) {
                  let errMsg = 'Failed to download PDF';
                  try {
                    const errText = await response.text();
                    const errJson = JSON.parse(errText);
                    if (errJson && errJson.message) errMsg = errJson.message;
                  } catch (_) {}
                  throw new Error(errMsg);
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Invoice PDF downloaded successfully');
              } catch (err: any) {
                toast.error(err.message || 'Could not generate PDF. Please try again.');
              } finally {
                setIsDownloadingPdf(false);
              }
            }}
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Download Bill
              </>
            )}
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
            key={iframeKey}
            src={`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/finance/invoices/${id}/html?token=${useAuthStore.getState().accessToken || localStorage.getItem('token') || ''}&v=${iframeKey}`}
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

          {/* Invoice Custom Images Card */}
          <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b bg-slate-50">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> Custom Invoice Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <ImageUploadField
                label="Invoice Top Header Image"
                placeholder="https://example.com/banner-header.jpg"
                value={invoice.invoiceHeaderBannerUrl || ''}
                onChange={(val) => updateImagesMut.mutate({ invoiceHeaderBannerUrl: val })}
                description="Overrides the header landscape banner."
              />
              <ImageUploadField
                label="Company Logo Image"
                placeholder="https://example.com/logo.png"
                value={invoice.invoiceLogoUrl || ''}
                onChange={(val) => updateImagesMut.mutate({ invoiceLogoUrl: val })}
                description="Overrides the top logo image."
              />
              <ImageUploadField
                label="Middle Polaroid Banner"
                placeholder="https://example.com/banner-middle.jpg"
                value={invoice.invoiceMiddleBannerUrl || ''}
                onChange={(val) => updateImagesMut.mutate({ invoiceMiddleBannerUrl: val })}
                description="Overrides the middle polaroid collage banner."
              />
              <ImageUploadField
                label="Google Review QR Code"
                placeholder="https://example.com/qr.png"
                value={invoice.invoiceQrCodeUrl || ''}
                onChange={(val) => updateImagesMut.mutate({ invoiceQrCodeUrl: val })}
                description="Overrides the review QR code image."
              />
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
