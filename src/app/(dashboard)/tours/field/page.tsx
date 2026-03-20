'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Users, Luggage, Loader2, Phone, CheckCircle2, ChevronRight, Navigation } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FieldToursPage() {
  const queryClient = useQueryClient();
  const [updatingTourId, setUpdatingTourId] = useState<string | null>(null);

  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours', 'field_view'],
    queryFn: async () => {
      const res = await api.get('/tours?view=field');
      return res.data.data.tours;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ tourId, status }: { tourId: string; status: string }) => {
      await api.patch(`/tours/${tourId}/ops`, { status });
    },
    onSuccess: () => {
      toast.success('Tour status updated to Running.');
      queryClient.invalidateQueries({ queryKey: ['tours', 'field_view'] });
      setUpdatingTourId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update tour status');
      setUpdatingTourId(null);
    }
  });

  const handleStartTour = (tourId: string) => {
    setUpdatingTourId(tourId);
    updateStatusMutation.mutate({ tourId, status: 'running' });
  };

  return (
    <div className="space-y-6 pb-20"> {/* pb-20 for mobile nav clearance if any */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Field Assignments</h1>
        <p className="text-muted-foreground mt-1 text-sm">Focus strictly on tours overlapping with today&apos;s date.</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      ) : !tours || tours.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">All Caught Up</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
            You have no active or upcoming tours scheduled for today in the field.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour: any) => (
            <Card key={tour.id} className="hover:border-primary/50 transition-colors shadow-md relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${tour.status === 'running' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <CardContent className="p-5 pl-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{tour.tourCode}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                      {tour.status === 'running' ? 'Active Currently' : 'Starting Today'}
                    </p>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {tour.passengerCount} Pax
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm font-medium">
                    <Users className="w-4 h-4 mr-3 text-muted-foreground" />
                    {tour.query?.name}
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a href={`tel:${tour.query?.phone}`} className="text-blue-600 underline underline-offset-2">{tour.query?.phone}</a>
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                    {tour.query?.destination || 'Destination TBD'}
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                    Until {format(new Date(tour.endDate), 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-dashed">
                  {tour.status === 'upcoming' ? (
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold h-12" 
                      onClick={() => handleStartTour(tour.id)}
                      disabled={updatingTourId === tour.id}
                    >
                      {updatingTourId === tour.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                      Start Tour (Mark Running)
                    </Button>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 text-center py-3 rounded-md border border-emerald-200 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4 inline-block mr-1.5" /> Handled / Running
                    </div>
                  )}
                  
                  <Link href={`/tours/${tour.id}`}>
                    <Button variant="outline" className="w-full shadow-sm text-primary">
                      View Notes & Routing <ChevronRight className="w-4 h-4 ml-2" />
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
