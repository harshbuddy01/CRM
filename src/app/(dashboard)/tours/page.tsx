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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor and manage all active, upcoming, and completed tours.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tours by code, customer, or destination..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-muted p-1 rounded-md">
          {['all', 'upcoming', 'running', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors capitalize ${
                statusFilter === status ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
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
            <Card key={tour.id} className="hover:border-primary/50 transition-colors group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {tour.tourCode}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        tour.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        tour.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                        tour.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tour.status}
                      </span>
                    </CardTitle>
                    <CardDescription className="font-medium text-foreground mt-1">
                      {tour.query?.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {tour.query?.destination || 'Destination TBD'}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(new Date(tour.startDate), 'MMM d, yyyy')} - {format(new Date(tour.endDate), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {tour.passengerCount} Passengers
                  </div>
                  {tour.assignedOpsUser && (
                    <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Ops: <span className="font-medium text-foreground">{tour.assignedOpsUser.name}</span></span>
                    </div>
                  )}
                  <Link href={`/tours/${tour.id}`} className="block mt-4">
                    <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Tour Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
