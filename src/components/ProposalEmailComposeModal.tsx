'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';

interface ProposalEmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  customerName: string;
  customerEmail: string;
}

export function ProposalEmailComposeModal({ isOpen, onClose, proposalId, customerName, customerEmail }: ProposalEmailComposeModalProps) {
  const [subject, setSubject] = useState(`Your Travel Proposal - ${customerName}`);
  const [body, setBody] = useState(`<p>Hi ${customerName},</p><p>Please find your travel proposal attached.</p><p><br></p><p>Best Regards,<br><strong>Team Sikkim Holidays</strong></p>`);
  const [cc, setCc] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['org-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (settings?.emailSignature && isOpen) {
      setBody(`<p>Hi ${customerName},</p><p>Please find your travel proposal attached.</p><p><br></p>${settings.emailSignature}`);
    } else if (isOpen) {
      // Revert to initial static if no signature configured yet
      setBody(`<p>Hi ${customerName},</p><p>Please find your travel proposal attached.</p><p><br></p><p>Best Regards,<br><strong>Team Sikkim Holidays</strong><br>📍 Sikkim Holidays ( A Unit of ETNHO TRAILS HOLIDAY Pvt Ltd.)<br>📞 For Booking: +91 8981510077<br>💳 For Service/Finance: +91 9007762137<br>✉️ Email: sikkimholidays.booking@gmail.com | support@sikkimholidays.in<br>🌐 Website: <a href="https://sikkimholidays.in">sikkimholidays.in</a></p>`);
    }
  }, [settings, isOpen, customerName]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('subject', subject);
      fd.append('body', body);
      if (cc) fd.append('cc', cc);
      if (file) fd.append('attachment', file);
      
      const res = await api.post(`/proposals/${proposalId}/send-email`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Email dispatched successfully');
      setFile(null);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-blue-600" />
            Send Proposal to {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={`${customerName} <${customerEmail || 'No Email Provided'}>`} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>CC</Label>
              <Input placeholder="finance@example.com" value={cc} onChange={e => setCc(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subject <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="Subject" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
            />
          </div>

          <div className="space-y-2 pb-6">
            <Label>Mail Body <span className="text-red-500">*</span></Label>
            <RichTextEditor 
              value={body}
              onChange={setBody}
              placeholder="Write your email here..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>Attachment</Label>
            <div className="flex items-center gap-4">
               <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
               {file && <span className="text-sm text-green-600 font-medium whitespace-nowrap">Selected</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Note: The system-generated PDF proposal is attached automatically. Add any extra files here.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            onClick={() => sendMutation.mutate()} 
            disabled={sendMutation.isPending || !subject || !body || !customerEmail}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {sendMutation.isPending ? 'Sending...' : 'Send Mail'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
