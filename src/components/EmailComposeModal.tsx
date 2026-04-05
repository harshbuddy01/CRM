'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';
import { Mail, Send, X, Paperclip } from 'lucide-react';

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryId: string;
  customerName: string;
  customerEmail: string;
  queryCode: string;
}

export function EmailComposeModal({ isOpen, onClose, queryId, customerName, customerEmail, queryCode }: EmailComposeModalProps) {
  const [templateId, setTemplateId] = useState<string>('none');
  const [subject, setSubject] = useState('');
  const [bodyRichText, setBodyRichText] = useState('');
  const [cc, setCc] = useState('');

  // Fetch available active templates
  const { data: templatesData } = useQuery({
    queryKey: ['email-templates', 'active'],
    queryFn: async () => {
      const res = await api.get('/email-templates/active');
      return res.data;
    },
    enabled: isOpen,
  });

  const templates = templatesData?.data || [];

  // When a template is selected, we perform client-side string interpolation
  // for an immediate preview, but the backend also handles interpolation robustly.
  const handleTemplateChange = (val: string | null) => {
    if (!val || val === 'none') {
      setTemplateId('none');
      setSubject('');
      setBodyRichText('');
      return;
    }

    setTemplateId(val);

    const tpl = templates.find((t: any) => t.id === val);
    if (tpl) {
      let hydratedSubject = tpl.subject.replace(/#\{customerName\}/g, customerName).replace(/#\{queryId\}/g, queryCode);
      let hydratedBody = tpl.bodyRichText.replace(/#\{customerName\}/g, customerName).replace(/#\{queryId\}/g, queryCode);
      setSubject(hydratedSubject);
      setBodyRichText(hydratedBody);
    }
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/queries/${queryId}/send-email`, {
        templateId: templateId !== 'none' ? templateId : undefined,
        subject,
        bodyRichText,
        body: bodyRichText,
        cc: cc || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Email queued for sending via SendGrid');
      onClose();
      // Reset form
      setTemplateId('none');
      setSubject('');
      setBodyRichText('');
      setCc('');
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
            <Mail className="h-5 w-5 text-indigo-600" />
            Compose Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient info (Readonly) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={`${customerName} <${customerEmail || 'No Email Provided'}>`} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>CC (Comma separated)</Label>
              <Input placeholder="finance@example.com" value={cc} onChange={e => setCc(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Use Template</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pre-defined template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- No Template (Blank) --</SelectItem>
                {templates.map((tpl: any) => (
                  <SelectItem key={tpl.id} value={tpl.id}>{tpl.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="Your Travel Itinerary" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
            />
          </div>

          <div className="space-y-2 pb-6">
            <Label>Message Body <span className="text-red-500">*</span></Label>
            <RichTextEditor 
              value={bodyRichText}
              onChange={setBodyRichText}
              placeholder="Write your email here... Variables #{customerName} and #{queryId} are supported."
            />
          </div>
          
          <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-3 rounded-md">
            <Paperclip className="h-4 w-4 mr-2" />
            File attachments feature coming soon...
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => sendMutation.mutate()} 
            disabled={sendMutation.isPending || !subject || !bodyRichText || !customerEmail}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {sendMutation.isPending ? 'Sending...' : (
              <>
                <Send className="mr-2 h-4 w-4" /> Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
