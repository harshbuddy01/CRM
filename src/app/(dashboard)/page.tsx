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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Leads (This Month)</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.newLeadsMonth || 0}</div>
                <p className="text-xs text-muted-foreground">in current month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.activeLeads || 0}</div>
                <p className="text-xs text-muted-foreground">across all pipelines</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(data?.revenueThisMonth || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">from confirmed trips</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.conversionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">sales velocity</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Additional UI sections will be added in subsequent sprints */}
      <h2 className="text-xl font-semibold mt-10">Quick Actions</h2>
      <div className="flex flex-wrap gap-4 mt-4">
         <Link href="/queries/new">
           <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">Add New Lead</button>
         </Link>
         <Link href="/queries">
           <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80">View Pipeline</button>
         </Link>
      </div>

    </div>
  );
}
