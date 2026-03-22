'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Profit & Loss</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Monthly profit and loss summary</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="flex-1 sm:flex-none h-10 px-3 border rounded-xl text-xs font-bold bg-background shadow-sm" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="flex-1 sm:flex-none h-10 px-3 border rounded-xl text-xs font-bold bg-background shadow-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <KpiCard title="Total Revenue" value={fmt(data.totalRevenue)} icon={<TrendingUp className="w-5 h-5 text-green-600" />} bgClass="from-green-50 to-emerald-50 border-emerald-100 shadow-emerald-100/20" textClass="text-green-700" />
            <KpiCard title="Total Expenses" value={fmt(data.totalExpenses)} icon={<TrendingDown className="w-5 h-5 text-red-600" />} bgClass="from-red-50 to-rose-50 border-red-100 shadow-red-100/20" textClass="text-red-700" />
            <KpiCard title="Vendor Payouts" value={fmt(data.totalVendorPayouts)} icon={<DollarSign className="w-5 h-5 text-purple-600" />} bgClass="from-purple-50 to-violet-50 border-purple-100 shadow-purple-100/20" textClass="text-purple-700" />
            <KpiCard title="Net Profit" value={fmt(data.netProfit)} icon={data.netProfit >= 0 ? <ArrowUp className="w-5 h-5 text-green-600" /> : <ArrowDown className="w-5 h-5 text-red-600" />} bgClass={data.netProfit >= 0 ? 'from-green-50 to-teal-50 border-green-100 shadow-green-100/20' : 'from-red-50 to-orange-50 border-red-100 shadow-red-100/20'} textClass={data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} />
          </div>

          {/* Breakdown List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="divide-y divide-slate-100">
              <div className="px-5 py-4 flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
                  <span className="text-sm font-bold text-slate-700">Client Revenue</span>
                </div>
                <span className="font-black text-emerald-700">{fmt(data.totalRevenue)}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between bg-rose-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Minus className="w-4 h-4 text-rose-600" /></div>
                  <span className="text-sm font-bold text-slate-700">Business Expenses</span>
                </div>
                <span className="font-black text-rose-700">- {fmt(data.totalExpenses)}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between bg-purple-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><DollarSign className="w-4 h-4 text-purple-600" /></div>
                  <span className="text-sm font-bold text-slate-700">Vendor Payouts</span>
                </div>
                <span className="font-black text-purple-700">- {fmt(data.totalVendorPayouts)}</span>
              </div>
              <div className={cn("px-5 py-6 flex items-center justify-between", data.netProfit >= 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                <span className="text-base font-black uppercase tracking-wider">Net Profit / Loss</span>
                <span className="text-2xl font-black">{fmt(data.netProfit)}</span>
              </div>
            </div>
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
    <Card className={cn(
      "p-4 md:p-5 bg-gradient-to-br border transition-all shadow-sm active:scale-[0.98] md:active:scale-100 opacity-90 hover:opacity-100",
      bgClass
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">{title}</p>
          <p className={cn("text-base md:text-xl font-black truncate leading-tight", textClass)}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
