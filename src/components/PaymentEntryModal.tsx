'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, IndianRupee, Lock } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

interface PaymentEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryId?: string;
  tourId?: string;
  defaultAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  balanceDue?: number;
}

export function PaymentEntryModal({ isOpen, onClose, queryId, tourId, defaultAmount, totalAmount, paidAmount, balanceDue }: PaymentEntryModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    amount: defaultAmount?.toString() || '',
    mode: 'upi',
    referenceUtr: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        queryId,
        tourId
      };
      await api.post('/payments', payload);
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
      if (tourId) queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      // Reset form
      setFormData({
        amount: defaultAmount?.toString() || '',
        mode: 'upi',
        referenceUtr: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      onClose();
    },
    onError: (err: any) => {
      toast.error('Failed to record payment', { description: err.response?.data?.message });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) {
      toast.error('Invalid Amount');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
          <DialogDescription>
            Enter offline payment details (UPI, NEFT, Cash) securely into the ledger.
          </DialogDescription>
        </DialogHeader>
        
        {totalAmount !== undefined && (
          <div className="bg-muted p-3 rounded-md flex justify-between text-sm mb-2 border">
            <div><p className="text-muted-foreground text-xs">Total</p><p className="font-semibold">₹{totalAmount.toLocaleString('en-IN')}</p></div>
            <div><p className="text-muted-foreground text-xs">Paid</p><p className="font-semibold text-emerald-600">₹{paidAmount?.toLocaleString('en-IN')}</p></div>
            <div className="text-right"><p className="text-muted-foreground text-xs">Balance</p><p className="font-bold text-red-600">₹{balanceDue?.toLocaleString('en-IN')}</p></div>
          </div>
        )}

        <PermissionGate perm="payment.create">
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  required
                  className="pl-8"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              >
                <option value="upi">UPI</option>
                <option value="neft">NEFT/RTGS</option>
                <option value="card">Card (POS)</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          {['upi', 'neft', 'cheque', 'card'].includes(formData.mode) && (
            <div className="space-y-2">
              <Label>Reference Number (UTR / Cheque No / Txn ID)</Label>
              <Input
                required
                placeholder="Ex: 230910123456"
                value={formData.referenceUtr}
                onChange={(e) => setFormData({ ...formData, referenceUtr: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Internal Notes (Optional)</Label>
            <Textarea
              className="resize-none"
              placeholder="Ex: Collected by Rajesh"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </div>
          </form>
        </PermissionGate>
      </DialogContent>
    </Dialog>
  );
}
