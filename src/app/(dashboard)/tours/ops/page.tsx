'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Users, Luggage, Search, Loader2, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';

export default function OpsToursPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours', 'ops_view'],
    queryFn: async () => {
      const res = await api.get('/tours?view=ops');
      return res.data.data.tours;
    }
  });

  const filteredTours = tours?.filter((t: any) => 
    t.tourCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.query?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.query?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sort logistics, assign field agents, and manage daily running tours.</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by tour code, customer, or destination..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      ) : !filteredTours || filteredTours.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <Luggage className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium">No active logistical tasks</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
            All running and upcoming tours are currently empty or filtered out.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTours.map((tour: any) => {
            const daysToStart = differenceInDays(new Date(tour.startDate), new Date());
            return (
              <Card key={tour.id} className="hover:border-primary/50 transition-colors flex flex-col">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {tour.tourCode}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                          tour.status === 'running' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tour.status === 'running' ? 'Active Now' : `Starts in ${daysToStart} Days`}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-foreground font-medium mt-1 uppercase tracking-wider text-xs">
                        {tour.query?.destination || 'DESTINATION TBD'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Travel Dates</p>
                        <p className="font-semibold">{format(new Date(tour.startDate), 'MMM d')} - {format(new Date(tour.endDate), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pax Size</p>
                        <p className="font-semibold">{tour.passengerCount} Travelers</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" /> Primary Guest: {tour.query?.name}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3" /> {tour.query?.phone}
                      </p>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg mt-4">
                      <p className="text-xs font-semibold text-amber-800 mb-1">Logistics Notes</p>
                      <p className="text-xs text-amber-900/80 line-clamp-3">
                        {tour.opsNotes || 'No operational logistics handed over yet.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 flex gap-3">
                    <Link href={`/tours/${tour.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        Manage Ops <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
