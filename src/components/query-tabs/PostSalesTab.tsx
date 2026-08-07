'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Hotel, Car, Send, DollarSign, Plus, CheckCircle, Edit, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function PostSalesTab({ queryId }: { queryId: string }) {
  const queryClient = useQueryClient();
  const [paymentModal, setPaymentModal] = useState<{ id: string; name: string } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [editModal, setEditModal] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editConfirmation, setEditConfirmation] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEdit = (svc: any) => {
    setEditModal(svc);
    setEditName(svc.supplierName || '');
    setEditEmail(svc.supplierEmail || '');
    setEditPhone(svc.supplierPhone || '');
    setEditConfirmation(svc.confirmationNumber || '');
    setEditNotes(svc.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editModal) return;
    updateMutation.mutate({
      id: editModal.id,
      data: {
        supplierName: editName,
        supplierEmail: editEmail,
        supplierPhone: editPhone,
        confirmationNumber: editConfirmation,
        notes: editNotes,
      }
    });
    setEditModal(null);
  };

  const { data: services, isLoading } = useQuery({
    queryKey: ['booking-services', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/booking-services`);
      return res.data.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/queries/${queryId}/booking-services/generate`);
    },
    onSuccess: () => {
      toast.success('Booking services generated');
      queryClient.invalidateQueries({ queryKey: ['booking-services', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const sendMailMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/booking-services/${id}/send-mail`, {});
    },
    onSuccess: () => {
      toast.success('Booking mail sent to supplier');
      queryClient.invalidateQueries({ queryKey: ['booking-services', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: string }) => {
      await api.post(`/booking-services/${id}/payments`, { amount });
    },
    onSuccess: () => {
      toast.success('Payment recorded');
      setPaymentModal(null);
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['booking-services', queryId] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await api.patch(`/booking-services/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Updated');
      queryClient.invalidateQueries({ queryKey: ['booking-services', queryId] });
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const hotels = services?.filter((s: any) => s.serviceType === 'hotel') || [];
  const transport = services?.filter((s: any) => s.serviceType === 'transport') || [];

  if (!services?.length) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">No booking services found. Generate them from the confirmed proposal.</p>
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="gap-2">
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Booking Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ServiceCard = ({ svc }: { svc: any }) => (
    <Card key={svc.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {svc.serviceType === 'hotel' ? <Hotel className="w-4 h-4 text-blue-500" /> : <Car className="w-4 h-4 text-orange-500" />}
            {svc.serviceName}
          </CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            svc.mailStatus === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {svc.mailStatus === 'sent' ? '✉️ Mail Sent' : '📭 Not Sent'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {svc.serviceType === 'hotel' && svc.checkIn && (
          <p className="text-sm text-muted-foreground">
            {new Date(svc.checkIn).toLocaleDateString()} → {svc.checkOut ? new Date(svc.checkOut).toLocaleDateString() : 'TBD'}
          </p>
        )}
        {svc.serviceType === 'transport' && svc.serviceDate && (
          <p className="text-sm text-muted-foreground">Date: {new Date(svc.serviceDate).toLocaleDateString()}</p>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Rate × Units</p>
            <p className="font-semibold">₹{Number(svc.ratePerUnit).toLocaleString()} × {svc.units}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="font-semibold">₹{Number(svc.totalCost).toLocaleString()}</p>
          </div>
          <div className={`rounded-lg p-3 ${svc.paymentStatus === 'paid' ? 'bg-green-50' : svc.paymentStatus === 'partial' ? 'bg-amber-50' : 'bg-red-50'}`}>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="font-semibold">₹{Number(svc.supplierAmountPending).toLocaleString()}</p>
          </div>
        </div>

        {svc.confirmationNumber && (
          <p className="text-sm"><span className="text-muted-foreground">Confirmation #:</span> <span className="font-medium">{svc.confirmationNumber}</span></p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {svc.mailStatus !== 'sent' && svc.supplierEmail && (
            <Button size="sm" variant="outline" className="gap-1" onClick={() => sendMailMutation.mutate(svc.id)} disabled={sendMailMutation.isPending}>
              <Send className="w-3 h-3" /> Send Booking Mail
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setPaymentModal({ id: svc.id, name: svc.serviceName })}>
            <DollarSign className="w-3 h-3" /> Record Payment
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleOpenEdit(svc)}>
            <Edit className="w-3 h-3" /> Edit Details
          </Button>
        </div>

        {(svc.supplier || svc.supplierName || svc.supplierEmail || svc.supplierPhone) && (
          <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50 mt-1 space-y-1.5">
            <p className="font-semibold text-foreground uppercase tracking-wider text-[9px]">Supplier & Contact Info</p>
            <p>Name: <span className="font-medium text-foreground">{svc.supplier?.companyName || svc.supplierName || 'Not set'}</span></p>
            {(svc.supplierEmail || svc.supplier?.email) && (
              <p className="flex items-center gap-1.5">
                Email: <span className="font-medium text-foreground">{svc.supplierEmail || svc.supplier?.email}</span>
                <a 
                  href={`mailto:${svc.supplierEmail || svc.supplier?.email}?subject=Booking%20Confirmation%20-%20${encodeURIComponent(svc.serviceName)}`}
                  className="text-blue-600 hover:underline inline-flex items-center text-[10px] ml-1 font-medium"
                >
                  ✉️ Compose
                </a>
              </p>
            )}
            {(svc.supplierPhone || svc.supplier?.phone) && (
              <p className="flex items-center gap-1.5">
                Phone: <span className="font-medium text-foreground">{svc.supplierPhone || svc.supplier?.phone}</span>
                <button
                  onClick={() => {
                    const phone = (svc.supplierPhone || svc.supplier?.phone || '').replace(/\D/g, '');
                    const waUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=Hi%20there%2C%20regarding%20booking%20for%20${encodeURIComponent(svc.serviceName)}`;
                    window.open(waUrl, '_blank');
                  }}
                  className="text-emerald-600 hover:underline inline-flex items-center text-[10px] ml-1 font-semibold"
                >
                  💬 WhatsApp
                </button>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Booking Services</h2>
          <p className="text-xs text-muted-foreground">Manage operations and vouchers for hotel and transport bookings</p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1 border-primary/30 text-primary hover:bg-primary/5" 
          onClick={() => {
            if (confirm("Are you sure you want to sync booking services with the approved itinerary? This will overwrite the current list of services (existing payments will be preserved).")) {
              generateMutation.mutate();
            }
          }} 
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Sync with Itinerary
        </Button>
      </div>

      {hotels.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Hotel className="w-5 h-5 text-blue-500" /> Accommodation</h3>
          <div className="grid gap-4">{hotels.map((svc: any) => <ServiceCard key={svc.id} svc={svc} />)}</div>
        </div>
      )}

      {transport.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Car className="w-5 h-5 text-orange-500" /> Transportation</h3>
          <div className="grid gap-4">{transport.map((svc: any) => <ServiceCard key={svc.id} svc={svc} />)}</div>
        </div>
      )}

      <Dialog open={!!paymentModal} onOpenChange={() => setPaymentModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment — {paymentModal?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Amount (₹)</label>
            <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPaymentModal(null)}>Cancel</Button>
            <Button onClick={() => paymentModal && paymentMutation.mutate({ id: paymentModal.id, amount: paymentAmount })} disabled={!paymentAmount || paymentMutation.isPending}>
              {paymentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Edit Supplier Details — {editModal?.serviceName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Supplier / Hotel Name</label>
              <Input 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                placeholder="e.g. Sunmount Hotel" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
              <Input 
                type="email"
                value={editEmail} 
                onChange={e => setEditEmail(e.target.value)} 
                placeholder="e.g. booking@hotel.com" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Phone / WhatsApp Number</label>
              <Input 
                value={editPhone} 
                onChange={e => setEditPhone(e.target.value)} 
                placeholder="e.g. 9876543210" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Confirmation Number</label>
              <Input 
                value={editConfirmation} 
                onChange={e => setEditConfirmation(e.target.value)} 
                placeholder="e.g. CNF-88273" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Internal Notes</label>
              <Input 
                value={editNotes} 
                onChange={e => setEditNotes(e.target.value)} 
                placeholder="e.g. Deluxe Room, MAP Meal Plan" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
