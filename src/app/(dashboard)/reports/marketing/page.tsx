'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Download, Megaphone, TrendingUp, Globe } from 'lucide-react';

const SOURCE_COLORS: Record<string, string> = {
  website: '#6366f1', whatsapp: '#22c55e', facebook: '#3b82f6',
  google: '#f59e0b', call: '#8b5cf6', walkin: '#ec4899',
  reference: '#14b8a6', agent: '#f97316',
};
const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#22c55e', '#3b82f6'];

export default function MarketingReportPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report-marketing', dateFrom, dateTo],
    queryFn: () =>
      api.get('/reports/marketing', { params: { dateFrom, dateTo } }).then(r => r.data.data),
  });

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    window.open(`${api.defaults.baseURL}/reports/marketing/csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Report</h1>
          <p className="text-muted-foreground">Lead source analysis and campaign performance</p>
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
                <Globe className="w-4 h-4" /> Total Leads
              </div>
              <div className="text-3xl font-bold mt-2">{data.totalLeads}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Megaphone className="w-4 h-4" /> Campaigns Active
              </div>
              <div className="text-3xl font-bold mt-2">{data.byCampaign?.length || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Leads by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.bySource} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={100}
                    label={({ source, count }: any) => `${source}: ${count}`}>
                    {data.bySource?.map((s: any, idx: number) => (
                      <Cell key={idx} fill={SOURCE_COLORS[s.source] || COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Conversion by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.bySource}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="source" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a78bfa" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="confirmed" fill="#22c55e" name="Confirmed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Detail Table */}
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4">Source</th>
                  <th className="p-4">Leads</th>
                  <th className="p-4">Confirmed</th>
                  <th className="p-4">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.bySource?.map((s: any) => (
                  <tr key={s.source} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-medium capitalize">{s.source}</td>
                    <td className="p-4">{s.count}</td>
                    <td className="p-4">{s.confirmed}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${parseFloat(s.conversionRate) > 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <TrendingUp className="w-3 h-3" /> {s.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Campaign Performance */}
          {data.byCampaign?.length > 0 && (
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Campaign Performance</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4">Campaign</th>
                    <th className="p-4">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byCampaign.map((c: any) => (
                    <tr key={c.campaign} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{c.campaign}</td>
                      <td className="p-4">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
