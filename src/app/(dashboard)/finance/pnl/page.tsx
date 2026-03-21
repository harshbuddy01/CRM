'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PnlPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ['pnl', year, month],
    queryFn: () => api.get('/finance/pnl', { params: { year, month } }).then(r => r.data.data),
  });

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Profit & Loss</h1>
          <p className="text-muted-foreground text-sm">Monthly profit and loss summary</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 px-3 border rounded-md text-sm bg-background" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="h-9 px-3 border rounded-md text-sm bg-background" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard title="Total Revenue" value={fmt(data.totalRevenue)} icon={<TrendingUp className="w-5 h-5 text-green-600" />} bgClass="from-green-50 to-emerald-50" textClass="text-green-700" />
            <KpiCard title="Total Expenses" value={fmt(data.totalExpenses)} icon={<TrendingDown className="w-5 h-5 text-red-600" />} bgClass="from-red-50 to-rose-50" textClass="text-red-700" />
            <KpiCard title="Vendor Payouts" value={fmt(data.totalVendorPayouts)} icon={<DollarSign className="w-5 h-5 text-purple-600" />} bgClass="from-purple-50 to-violet-50" textClass="text-purple-700" />
            <KpiCard title="Net Profit" value={fmt(data.netProfit)} icon={data.netProfit >= 0 ? <ArrowUp className="w-5 h-5 text-green-600" /> : <ArrowDown className="w-5 h-5 text-red-600" />} bgClass={data.netProfit >= 0 ? 'from-green-50 to-teal-50' : 'from-red-50 to-orange-50'} textClass={data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} />
          </div>

          {/* Breakdown Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b bg-green-50/30">
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" /> Client Payments (Revenue)</td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">{fmt(data.totalRevenue)}</td>
                </tr>
                <tr className="border-b bg-red-50/30">
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><Minus className="w-4 h-4 text-red-500" /> Business Expenses</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">- {fmt(data.totalExpenses)}</td>
                </tr>
                <tr className="border-b bg-purple-50/30">
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><Minus className="w-4 h-4 text-purple-500" /> Vendor Payouts</td>
                  <td className="px-6 py-4 text-right font-bold text-purple-600">- {fmt(data.totalVendorPayouts)}</td>
                </tr>
                <tr className={`${data.netProfit >= 0 ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
                  <td className="px-6 py-4 font-bold text-base">Net Profit / Loss</td>
                  <td className={`px-6 py-4 text-right font-bold text-xl ${data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(data.netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Showing data for {MONTHS[month - 1]} {year}. Revenue = Sum of verified/banked client payments.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({ title, value, icon, bgClass, textClass }: { title: string; value: string; icon: React.ReactNode; bgClass: string; textClass: string }) {
  return (
    <div className={`border rounded-xl p-5 bg-gradient-to-br ${bgClass}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className={`text-xl font-bold ${textClass}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
