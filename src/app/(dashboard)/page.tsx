'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Map, CreditCard, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard_kpis'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard');
      return res.data.data;
    }
  });
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>
        ) : (
          <>
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4 md:px-6 md:pt-6">
                <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Leads</CardTitle>
                <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <div className="text-xl md:text-3xl font-black text-slate-900">{data?.newLeadsMonth || 0}</div>
                <p className="text-[9px] md:text-xs text-slate-400 mt-0.5 font-medium">this billing cycle</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4 md:px-6 md:pt-6">
                <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Total</CardTitle>
                <Map className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <div className="text-xl md:text-3xl font-black text-slate-900">{data?.activeLeads || 0}</div>
                <p className="text-[9px] md:text-xs text-slate-400 mt-0.5 font-medium">active opportunities</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4 md:px-6 md:pt-6">
                <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Revenue</CardTitle>
                <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <div className="text-xl md:text-3xl font-black text-slate-900">₹{(data?.revenueThisMonth || 0).toLocaleString('en-IN')}</div>
                <p className="text-[9px] md:text-xs text-slate-400 mt-0.5 font-medium">realized this month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4 md:px-6 md:pt-6">
                <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Closure %</CardTitle>
                <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <div className="text-xl md:text-3xl font-black text-slate-900">{data?.conversionRate || 0}%</div>
                <p className="text-[9px] md:text-xs text-slate-400 mt-0.5 font-medium">overall velocity</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="pt-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
           <Link 
             href="/queries/new" 
             className="w-full bg-primary text-white h-14 md:h-12 rounded-2xl md:rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
             role="button"
             aria-label="Create a new lead"
           >
             <Target className="w-4 h-4" />
             New Lead
           </Link>
           <Link 
             href="/queries" 
             className="w-full bg-slate-100 text-slate-900 h-14 md:h-12 rounded-2xl md:rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 border border-slate-200 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
             role="button"
             aria-label="View all leads in pipeline"
           >
             <Map className="w-4 h-4" />
             Lead Pipeline
           </Link>
        </div>
      </div>

    </div>
  );
}
