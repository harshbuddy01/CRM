'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';
import { Loader2, Mail, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

export function SupplierCommTab({ queryId }: { queryId: string }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState(`Travel Enquiry (Query Id: ${queryId})`);
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [isTemplateGenerated, setIsTemplateGenerated] = useState(false);

  const { data: queryInfo } = useQuery({ queryKey: ['query', queryId], queryFn: async () => (await api.get(`/queries/${queryId}`)).data.data });
  const { data: proposals } = useQuery({ queryKey: ['query-proposals', queryId], queryFn: async () => (await api.get(`/queries/${queryId}/proposals`)).data.data });
  const { data: suppliers, isLoading: loadingSuppliers } = useQuery({ queryKey: ['masters', 'supplier'], queryFn: async () => (await api.get('/masters-v2/suppliers')).data.data || [] });

  useEffect(() => {
    if (!queryInfo || !proposals || isTemplateGenerated) return;
    const confirmedProposal = proposals.find((p: any) => p.status === 'confirmed') || proposals[0];
    const checkIn = queryInfo.travelDateFrom ? format(new Date(queryInfo.travelDateFrom), 'dd-MM-yyyy') : 'TBD';
    const checkOut = queryInfo.travelDateTo ? format(new Date(queryInfo.travelDateTo), 'dd-MM-yyyy') : 'TBD';
    const nights = (queryInfo.travelDateFrom && queryInfo.travelDateTo) ? Math.round((new Date(queryInfo.travelDateTo).getTime() - new Date(queryInfo.travelDateFrom).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    let html = `<p>Dear Sir,</p><p>Kindly provide the best rates for below enquiry at the earliest:</p>`;
    html += `<table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background:#f1f5f9;"><th colspan="4" style="padding: 8px; text-align:left;">Enquiry Detail</th></tr>
      <tr><td style="padding: 8px;"><strong>Customer Name</strong></td><td style="padding: 8px;">${queryInfo.name || ''}</td><td style="padding: 8px;"><strong>Enquiry ID</strong></td><td style="padding: 8px;">${queryInfo.queryCode || queryId}</td></tr>
      <tr><td style="padding: 8px;"><strong>Check-In</strong></td><td style="padding: 8px;">${checkIn}</td><td style="padding: 8px;"><strong>Check-Out</strong></td><td style="padding: 8px;">${checkOut}</td></tr>
      <tr><td style="padding: 8px;"><strong>Nights</strong></td><td style="padding: 8px;">${nights}</td><td style="padding: 8px;"><strong>Total Pax</strong></td><td style="padding: 8px;">${queryInfo.adults} Adult / ${queryInfo.children} Child</td></tr>
    </table>`;

    if (confirmedProposal?.itinerary) {
        const events = (confirmedProposal.itinerary.days || []).flatMap((d: any) => d.events || []);
        const hotels = events.filter((e: any) => e.type === 'accommodation');
        const transports = events.filter((e: any) => ['transport', 'activity'].includes(e.type));
        if (hotels.length > 0) {
            html += `<table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px;"><tr style="background:#f1f5f9;"><th style="padding: 8px; text-align:left;">Hotel</th><th style="padding: 8px; text-align:left;">Meal</th></tr>`;
            hotels.forEach((h: any) => html += `<tr><td style="padding: 8px;"><strong>${h.title || ''}</strong></td><td style="padding: 8px;">${h.metadata?.mealPlan || '-'}</td></tr>`);
            html += `</table>`;
        }
        if (transports.length > 0) {
            html += `<table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px;"><tr style="background:#f1f5f9;"><th style="padding: 8px; text-align:left;">Transfers / Activity</th></tr>`;
            transports.forEach((t: any) => html += `<tr><td style="padding: 8px;">${t.title || ''}</td></tr>`);
            html += `</table>`;
        }
    }
    setBody(html); setIsTemplateGenerated(true);
  }, [queryInfo, proposals, isTemplateGenerated, queryId]);

  const sendMutation = useMutation({
    mutationFn: async () => api.post(`/queries/${queryId}/supplier-email`, { supplierIds: selectedSuppliers, subject, body, cc }),
    onSuccess: () => {
      toast.success('Dispatched to suppliers successfully');
      setSubject(`Travel Enquiry (Query Id: ${queryId})`);
      setIsTemplateGenerated(false); setSelectedSuppliers([]);
      queryClient.invalidateQueries({ queryKey: ['supplier-emails', queryId] });
      queryClient.invalidateQueries({ queryKey: ['query-history', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to dispatch emails')
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <div><h3 className="font-semibold text-lg text-slate-800">Supplier Communication</h3><p className="text-sm text-slate-500">Auto-generated templates based on proposal details.</p></div>
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="space-y-1.5"><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CC Email</Label><Input value={cc} onChange={e => setCc(e.target.value)} placeholder="finance@example.com" /></div>
          <div className="space-y-1.5"><Label>Mail Body</Label><div className="border border-slate-200 rounded-lg overflow-hidden"><RichTextEditor value={body} onChange={setBody} /></div></div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold text-white shadow-lg shadow-blue-200/50" disabled={sendMutation.isPending || selectedSuppliers.length === 0} onClick={() => sendMutation.mutate()}>
            {sendMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />} Send Mail To Selected Suppliers ({selectedSuppliers.length})
          </Button>
        </div>
      </div>
      <div className="w-full lg:w-[350px] space-y-4">
        <h3 className="font-semibold text-lg text-slate-800 flex items-center"><CheckSquare className="w-4 h-4 mr-2 text-slate-400" /> Select Suppliers</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden max-h-[600px] flex flex-col shadow-sm">
          {loadingSuppliers ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div> : (
            <div className="overflow-y-auto p-2 space-y-1 flex-1 bg-slate-50">
              {suppliers?.filter((s: any) => s.email).map((sup: any) => (
                <label key={sup.id} className={`flex items-start p-3 rounded-xl cursor-pointer transition-all border ${selectedSuppliers.includes(sup.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-slate-200'} shadow-sm`}>
                  <input type="checkbox" className="w-4 h-4 mt-0.5 rounded text-blue-600 mr-3 shrink-0" checked={selectedSuppliers.includes(sup.id)} onChange={(e) => e.target.checked ? setSelectedSuppliers([...selectedSuppliers, sup.id]) : setSelectedSuppliers(selectedSuppliers.filter(s => s !== sup.id))} />
                  <div className="-mt-1"><p className="font-semibold text-sm text-slate-800">{sup.companyName}</p>{sup.contactPerson && <p className="text-xs text-slate-500 mt-0.5">{sup.contactPerson}</p>}<p className="text-xs text-slate-500 max-w-[200px] truncate">{sup.email}</p></div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
