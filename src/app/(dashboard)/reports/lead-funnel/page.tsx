'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Users, UserCheck, PhoneMissed, RefreshCcw, Target, TrendingUp, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#7c3aed', '#5b21b6'];

const STATUS_COLORS: Record<string, string> = {
  new: '#6366f1',
  followup: '#f59e0b',
  dnp: '#ef4444',
  proposal_sent: '#3b82f6',
  ready_to_pay: '#10b981',
  confirmed: '#22c55e',
  lost: '#94a3b8',
  invalid: '#64748b',
};

export default function LeadFunnelPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report-lead-funnel', dateFrom, dateTo],
    queryFn: () =>
      api.get('/reports/lead-funnel', { params: { dateFrom, dateTo } }).then(r => r.data.data),
  });

  const handleExportCsv = async () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    try {
      const res = await api.get('/reports/lead-funnel/csv', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-funnel-report-${params.get('startDate') || 'all'}.csv`;
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
          <h1 className="text-2xl font-bold">Lead Funnel</h1>
          <p className="text-muted-foreground">Breakdown of leads by status and agent</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Date Filters */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-muted-foreground">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-md text-sm bg-background"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-md text-sm bg-background"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Target className="w-4 h-4" /> Total Leads
              </div>
              <div className="text-3xl font-bold mt-2">{data.totalLeads}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="w-4 h-4" /> Statuses
              </div>
              <div className="text-3xl font-bold mt-2">{data.byStatus?.length || 0}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="w-4 h-4" /> Agents Active
              </div>
              <div className="text-3xl font-bold mt-2">{data.byAgent?.length || 0}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Bar Chart */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Leads by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.byStatus?.map((entry: any, idx: number) => (
                      <Cell key={idx} fill={STATUS_COLORS[entry.status] || COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Agent Pie Chart */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Leads by Agent</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.byAgent}
                    dataKey="count"
                    nameKey="agentName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ agentName, count }: any) => `${agentName}: ${count}`}
                  >
                    {data.byAgent?.map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Table */}
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4">Status</th>
                  <th className="p-4">Count</th>
                  <th className="p-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.byStatus?.map((s: any) => (
                  <tr key={s.status} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-medium capitalize">{s.status.replace('_', ' ')}</td>
                    <td className="p-4">{s.count}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.percentage}%`,
                              backgroundColor: STATUS_COLORS[s.status] || '#6366f1',
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{s.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
