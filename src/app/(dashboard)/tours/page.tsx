'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Users, Luggage, Search, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';

export default function ToursListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tours', statusFilter],
    queryFn: async () => {
      let url = '/tours';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      return res.data.data.tours;
    }
  });

  const filteredTours = data?.filter((t: any) => 
    t.tourCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.query?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.query?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">Tours Management</h1>
          <p className="text-muted-foreground mt-2 text-xs md:text-sm font-medium">Monitor and manage all active, upcoming, and completed tours.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tours..."
            className="pl-8 h-10 md:h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg overflow-x-auto no-scrollbar scrollbar-none snap-x">
          {['all', 'upcoming', 'running', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all capitalize flex-shrink-0 snap-start whitespace-nowrap ${
                statusFilter === status 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-primary scale-105 z-10' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      ) : !filteredTours || filteredTours.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <Luggage className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium">No tours found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
            {searchTerm ? 'Try adjusting your search query.' : `There are no ${statusFilter !== 'all' ? statusFilter : ''} tours currently.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour: any) => (
            <Card key={tour.id} className="border-slate-200 shadow-md hover:shadow-lg transition-all group overflow-hidden rounded-2xl active:scale-[0.98]">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{tour.tourCode}</p>
                    <CardTitle className="text-lg font-black text-slate-900 leading-tight">
                      {tour.query?.name ?? 'Unnamed Tour'}
                    </CardTitle>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border shadow-sm ${
                    tour.status === 'running' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    tour.status === 'upcoming' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    tour.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {tour.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Destination</p>
                    <p className="font-black text-slate-700 text-xs truncate">{tour.query?.destination ?? '—'}</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Guests</p>
                    <p className="font-black text-slate-700 text-xs">{tour.passengerCount}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center font-bold text-slate-500">
                    <CalendarIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    {tour.startDate && !isNaN(new Date(tour.startDate).getTime()) ? format(new Date(tour.startDate), 'MMM d') : '—'} - {tour.endDate && !isNaN(new Date(tour.endDate).getTime()) ? format(new Date(tour.endDate), 'MMM d, yyyy') : '—'}
                  </div>
                  {tour.assignedOpsUser && (
                    <div className="flex items-center font-bold text-slate-500">
                      <Users className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      Ops: <span className="text-slate-900 ml-1">{tour.assignedOpsUser.name}</span>
                    </div>
                  )}
                </div>

                <Link href={`/tours/${tour.id}`} className="block">
                  <Button className="w-full h-11 rounded-xl font-bold bg-primary shadow-lg shadow-primary/10 active:scale-95 transition-all">
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
