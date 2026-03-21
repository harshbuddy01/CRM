'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Plane, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  upcoming: '#3b82f6', running: '#10b981', completed: '#6366f1', cancelled: '#ef4444',
};

export default function ToursReportPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report-tours', dateFrom, dateTo],
    queryFn: () =>
      api.get('/reports/tours', { params: { dateFrom, dateTo } }).then(r => r.data.data),
  });

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    window.open(`${api.defaults.baseURL}/reports/tours/csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tours Report</h1>
          <p className="text-muted-foreground">Tour status overview and upcoming departures</p>
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
        <div className="h-80 bg-muted/50 rounded-lg animate-pulse" />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Plane className="w-4 h-4" /> Total Tours
              </div>
              <div className="text-3xl font-bold mt-2">
                {data.byStatus?.reduce((s: number, x: any) => s + x.count, 0) || 0}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" /> Upcoming (7 days)
              </div>
              <div className="text-3xl font-bold mt-2">{data.upcomingNext7Days?.length || 0}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertTriangle className="w-4 h-4" /> Cancellations
              </div>
              <div className="text-3xl font-bold mt-2 text-red-500">{data.cancellations || 0}</div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Tours by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="status" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.byStatus?.map((s: any, idx: number) => (
                    <Bar key={idx} dataKey="count" fill={STATUS_COLORS[s.status] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {data.upcomingNext7Days?.length > 0 && (
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold">🗓️ Departures in Next 7 Days</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4">Tour Code</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">Ops User</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingNext7Days.map((t: any) => (
                    <tr key={t.tourCode} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-mono text-sm">{t.tourCode}</td>
                      <td className="p-4">{t.customerName}</td>
                      <td className="p-4">{format(new Date(t.startDate), 'dd MMM yyyy')}</td>
                      <td className="p-4">{t.opsUser}</td>
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
