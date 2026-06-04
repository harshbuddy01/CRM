'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, FileText, Download, Send, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function VoucherTab({ queryId }: { queryId: string }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomSupplier, setIsCustomSupplier] = useState(false);
  const [form, setForm] = useState({
    voucherType: 'customer', hotelName: '', supplierName: '', destination: '',
    leadPaxName: '', paxDetails: '', checkIn: '', checkOut: '', roomType: '',
    mealPlan: '', confirmationNumber: '', greetingMessage: '',
    checkInTime: '', checkOutTime: '',
  });

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['vouchers', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/vouchers`);
      return res.data.data;
    },
  });

  // Query suppliers list for dropdown selector
  const { data: suppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: ['masters', 'supplier'],
    queryFn: async () => {
      const res = await api.get('/masters-v2/suppliers');
      return res.data.data || [];
    },
  });
  const suppliersList = Array.isArray(suppliers) ? suppliers : (suppliers?.items || []);

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/queries/${queryId}/vouchers`, form);
    },
    onSuccess: () => {
      toast.success('Voucher created');
      setIsOpen(false);
      // Reset form
      setForm({
        voucherType: 'customer', hotelName: '', supplierName: '', destination: '',
        leadPaxName: '', paxDetails: '', checkIn: '', checkOut: '', roomType: '',
        mealPlan: '', confirmationNumber: '', greetingMessage: '',
        checkInTime: '', checkOutTime: '',
      });
      setIsCustomSupplier(false);
      queryClient.invalidateQueries({ queryKey: ['vouchers', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const generatePdfMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/vouchers/${id}/generate-pdf`),
    onSuccess: () => {
      toast.success('PDF generated');
      queryClient.invalidateQueries({ queryKey: ['vouchers', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/vouchers/${id}/send`);
    },
    onSuccess: () => {
      toast.success('Voucher sent via Email');
      queryClient.invalidateQueries({ queryKey: ['vouchers', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send Email'),
  });

  const getShareLinksMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'wa' | 'sms' }) => {
      const res = await api.post(`/vouchers/${id}/share-links`);
      return { links: res.data, type };
    },
    onSuccess: (data) => {
      const { links, type } = data;
      if (type === 'wa') {
        window.open(links.waLink, '_blank');
      } else {
        window.location.href = links.smsLink;
      }
      toast.success(`Share link triggered`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to get share links'),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Vouchers</h3>
        <Button onClick={() => setIsOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Voucher</Button>
      </div>

      {!vouchers?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No vouchers generated yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {vouchers.map((v: any) => (
            <Card key={v.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{v.voucherNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.voucherType === 'customer' ? 'Customer Voucher' : 'Supplier Voucher'}
                      {v.hotelName && ` • ${v.hotelName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${v.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {v.status}
                  </span>
                  {(
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <a href={`https://api.imagicaholidays.com/api/v1/public/vouchers/${v.id}/download-pdf`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="gap-1"><Download className="w-3 h-3" /> Download</Button>
                      </a>
                      {!v.pdfUrl && (
                        <Button size="sm" variant="outline" onClick={() => generatePdfMutation.mutate(v.id)} disabled={generatePdfMutation.isPending}>
                          Generate PDF
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-1 text-blue-600 hover:text-blue-700" onClick={() => sendEmailMutation.mutate(v.id)} disabled={sendEmailMutation.isPending}>
                        <Mail className="w-3 h-3" /> Email
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" onClick={() => getShareLinksMutation.mutate({ id: v.id, type: 'wa' })} disabled={getShareLinksMutation.isPending}>
                        WhatsApp
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-orange-600 hover:text-orange-700" onClick={() => getShareLinksMutation.mutate({ id: v.id, type: 'sms' })} disabled={getShareLinksMutation.isPending}>
                        SMS
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Voucher</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <Select value={form.voucherType} onValueChange={(v) => { if (v) setForm(f => ({ ...f, voucherType: v })); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer Voucher</SelectItem>
                <SelectItem value="supplier">Supplier Voucher</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Guest Name" value={form.leadPaxName} onChange={e => setForm(f => ({ ...f, leadPaxName: e.target.value }))} />
            <Input placeholder="Pax Details (e.g. 2 Adults, 1 Child)" value={form.paxDetails} onChange={e => setForm(f => ({ ...f, paxDetails: e.target.value }))} />
            <Input placeholder="Hotel Name" value={form.hotelName} onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} />
            <Input placeholder="Destination" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" placeholder="Check-in" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
              <Input type="date" placeholder="Check-out" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Check-in Time (Optional)</label>
                <Input placeholder="e.g. 14:00" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Check-out Time (Optional)</label>
                <Input placeholder="e.g. 11:00" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} />
              </div>
            </div>
            <Input placeholder="Room Type" value={form.roomType} onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))} />
            <Input placeholder="Meal Plan" value={form.mealPlan} onChange={e => setForm(f => ({ ...f, mealPlan: e.target.value }))} />
            <Input placeholder="Confirmation Number" value={form.confirmationNumber} onChange={e => setForm(f => ({ ...f, confirmationNumber: e.target.value }))} />
            {form.voucherType === 'supplier' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Supplier Selector</label>
                {loadingSuppliers ? (
                  <div className="flex items-center text-xs text-muted-foreground gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading suppliers...</div>
                ) : (
                  <Select 
                    value={isCustomSupplier ? 'custom' : form.supplierName} 
                    onValueChange={(val) => {
                      if (val === 'custom') {
                        setIsCustomSupplier(true);
                        setForm(f => ({ ...f, supplierName: '' }));
                      } else {
                        setIsCustomSupplier(false);
                        setForm(f => ({ ...f, supplierName: val || '' }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">-- Custom Supplier --</SelectItem>
                      {suppliersList.map((s: any) => (
                        <SelectItem key={s.id} value={s.companyName || ''}>{s.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {isCustomSupplier && (
                  <Input 
                    placeholder="Enter Custom Supplier Name" 
                    value={form.supplierName} 
                    onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} 
                  />
                )}
              </div>
            )}
            <Textarea placeholder="Greeting/Notes" value={form.greetingMessage} onChange={e => setForm(f => ({ ...f, greetingMessage: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
