'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Wallet, CreditCard, Banknote, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const MODE_COLORS: Record<string, string> = {
  upi: '#6366f1', neft: '#8b5cf6', card: '#3b82f6', cash: '#10b981', cheque: '#f59e0b',
};
const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8'];

export default function CollectionsReportPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report-collections', dateFrom, dateTo],
    queryFn: () =>
      api.get('/reports/collections', { params: { dateFrom, dateTo } }).then(r => r.data.data),
  });

  const handleExportCsv = async () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    try {
      const res = await api.get('/reports/collections/csv', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `collections-report-${params.get('startDate') || 'all'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections Report</h1>
          <p className="text-muted-foreground">Payment breakdown by mode and status</p>
        </div>
        <button onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-muted-foreground">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-md text-sm bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-md text-sm bg-background" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-80 bg-muted/50 rounded-lg animate-pulse" />)}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="w-4 h-4" /> Total Collected
              </div>
              <div className="text-3xl font-bold mt-2 text-green-600">₹{Number(data.totalCollected).toLocaleString()}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" /> Pending
              </div>
              <div className="text-3xl font-bold mt-2 text-amber-600">₹{Number(data.totalPending).toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">By Payment Mode</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.byMode} dataKey="amount" nameKey="mode" cx="50%" cy="50%" outerRadius={100}
                    label={({ mode, amount }: any) => `${mode}: ₹${Number(amount).toLocaleString()}`}>
                    {data.byMode?.map((m: any, idx: number) => (
                      <Cell key={idx} fill={MODE_COLORS[m.mode] || COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">By Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#6366f1" name="Amount" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
