'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, IndianRupee, Save, CalendarRange, X, MapPin, Map, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProposalDay {
  dayNumber: number;
  destinationId: string;
  hotelId: string;
  activities: string;
  description: string;
  mealsIncluded: string;
  transport: string;
  dayCost: number;
}

export default function ProposalBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryId = params.id;
  const queryClient = useQueryClient();

  const [days, setDays] = useState<ProposalDay[]>([
    { dayNumber: 1, destinationId: '', hotelId: '', activities: '', description: '', mealsIncluded: 'BB', transport: '', dayCost: 0 }
  ]);
  const [markupPct, setMarkupPct] = useState<number>(0);
  const [itineraryId, setItineraryId] = useState<string | null>(null);
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations', 'active'],
    queryFn: async () => {
      const res = await api.get('/masters/destinations?active=true');
      return res.data.data;
    }
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const res = await api.get('/masters/hotels?active=true');
      return res.data.data;
    }
  });

  const { data: itineraries, isLoading: isLoadingItineraries } = useQuery({
    queryKey: ['itineraries', 'published'],
    queryFn: async () => {
      // Only fetch published itineraries for proposal selection
      const res = await api.get('/itineraries?status=published');
      return res.data.data;
    },
    enabled: showItineraryModal
  });

  const createProposal = useMutation({
    mutationFn: async () => {
      await api.post(`/queries/${queryId}/proposals`, { days, markupPct, itineraryId });
    },
    onSuccess: () => {
      toast.success('Proposal built & saved successfully');
      queryClient.invalidateQueries({ queryKey: ['proposals', queryId] });
      router.push(`/queries/${queryId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create proposal');
    }
  });

  const handleAddDay = () => {
    setDays([...days, {
      dayNumber: days.length + 1,
      destinationId: '',
      hotelId: '',
      activities: '',
      description: '',
      mealsIncluded: 'BB',
      transport: '',
      dayCost: 0
    }]);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length === 1) return;
    const newDays = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(newDays);
  };

  const updateDay = (index: number, field: keyof ProposalDay, value: any) => {
    const newDays = [...days];
    /* @ts-expect-error dynamic key assignment */
    newDays[index][field] = value;

    // auto-fill base price if hotel selected
    if (field === 'hotelId') {
      const hotel = hotels.find((h: any) => h.id === value);
      if (hotel) {
        newDays[index].dayCost = Number(hotel.basePrice) || 0;
      }
    }

    setDays(newDays);
  };

  const handleSelectItinerary = async (itinerary: any) => {
    try {
      toast.loading('Importing itinerary structure...', { id: 'import-iti' });
      // Fetch full itinerary to get all events and costs
      const res = await api.get(`/itineraries/${itinerary.id}`);
      const fullItinerary = res.data.data;

      // Map to ProposalDays
      const rawDays = Array.isArray(fullItinerary.days) ? fullItinerary.days : [];
      if (rawDays.length === 0) {
        setDays([{ dayNumber: 1, destinationId: '', hotelId: '', activities: '', description: '', mealsIncluded: 'BB', transport: '', dayCost: 0 }]);
        toast.info('The selected itinerary has no days planned');
      } else {
        const mappedDays: ProposalDay[] = rawDays.map((day: any) => {
          const accomEvent = day.events?.find((e: any) => e.type === 'accommodation');
          const transportEvents = day.events?.filter((e: any) => ['transport', 'flight'].includes(e.type)) || [];
          const activityEvents = day.events?.filter((e: any) => ['activity', 'sightseeing'].includes(e.type)) || [];
          
          let dayCost = 0;
          day.events?.forEach((e: any) => { dayCost += Number(e.cost) || 0; });

          return {
            dayNumber: day.dayNumber,
            destinationId: day.destinationId || '',
            hotelId: accomEvent?.metadata?.masterId || '',
            activities: activityEvents.map((e: any) => e.title).join(', '),
            description: day.events?.map((e: any) => e.title).join('\n') || '', // Simple auto-generation
            mealsIncluded: accomEvent?.metadata?.mealPlan || 'BB',
            transport: transportEvents.map((e: any) => e.title).join(', '),
            dayCost: dayCost
          };
        });
        setDays(mappedDays);
      }
      
      setMarkupPct(Number(fullItinerary.markupPct) || 0);
      setItineraryId(fullItinerary.id);
      
      toast.success('Itinerary imported successfully', { id: 'import-iti' });
      setShowItineraryModal(false);
    } catch (err: any) {
      toast.error('Failed to import itinerary', { id: 'import-iti' });
    }
  };

  const totalCost = days.reduce((acc, obj) => acc + (Number(obj.dayCost) || 0), 0);
  const markupAmount = totalCost * (markupPct / 100);
  const sellingPrice = totalCost + markupAmount;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-32">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Build Proposal</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Configure daily itinerary and calculate margins
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
          onClick={() => setShowItineraryModal(true)}
        >
          <CalendarRange className="w-4 h-4 mr-2" />
          {itineraryId ? 'Change Itinerary' : 'Import from Builder'}
        </Button>
      </div>

      <div className="space-y-6">
        {days.map((day, index) => {
          const destHotels = hotels.filter((h: any) => h.destinationId === day.destinationId);

          return (
            <Card key={index} className="overflow-visible border-slate-200">
              <CardHeader className="py-4 border-b bg-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Day {day.dayNumber}</CardTitle>
                {days.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 -my-2" onClick={() => handleRemoveDay(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Master Data Linking */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destination</label>
                      <Select value={day.destinationId} onValueChange={(v) => updateDay(index, 'destinationId', v)}>
                        <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                        <SelectContent>
                          {destinations.map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hotel / Accommodation</label>
                      <Select value={day.hotelId} onValueChange={(v) => updateDay(index, 'hotelId', v)} disabled={!day.destinationId}>
                        <SelectTrigger><SelectValue placeholder={day.destinationId ? "Select Hotel" : "Select Destination First"} /></SelectTrigger>
                        <SelectContent>
                          {destHotels.map((h: any) => (
                            <SelectItem key={h.id} value={h.id}>{h.name} ({h.category})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meal Plan</label>
                      <Select value={day.mealsIncluded} onValueChange={(v) => updateDay(index, 'mealsIncluded', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RO">Room Only (RO)</SelectItem>
                          <SelectItem value="BB">Bed & Breakfast (BB)</SelectItem>
                          <SelectItem value="HB">Half Board (HB)</SelectItem>
                          <SelectItem value="FB">Full Board (FB)</SelectItem>
                          <SelectItem value="AI">All Inclusive (AI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Free text fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Transportation</label>
                      <Input placeholder="e.g. Private Airport Transfer" value={day.transport || ''} onChange={(e) => updateDay(index, 'transport', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Activities Overview</label>
                      <Input placeholder="e.g. City Tour, Scuba Diving" value={day.activities || ''} onChange={(e) => updateDay(index, 'activities', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Detailed ITINERARY Description</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type out the full day-by-day itinerary plan to print on the PDF proposal..."
                        value={day.description || ''}
                        onChange={(e) => updateDay(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Net Cost (Day {day.dayNumber})</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-9" value={day.dayCost || ''} onChange={(e) => updateDay(index, 'dayCost', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button variant="outline" className="w-full py-8 border-dashed rounded-xl" onClick={handleAddDay}>
          <Plus className="w-5 h-5 mr-2" /> Add Another Day
        </Button>
      </div>

      {/* Sticky Bottom Bar for Calculations */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 border-t bg-background/95 backdrop-blur shadow-[0_-4px_10px_rgb(0,0,0,0.05)] p-4 md:px-8 flex flex-col md:flex-row gap-4 md:items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <div className="bg-muted px-4 py-2 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Net Cost</p>
            <p className="text-xl font-bold flex items-center">
              <IndianRupee className="w-5 h-5 mr-1 text-muted-foreground" />
              {totalCost.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Markup %</p>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                className="w-20 h-9 font-bold text-primary" 
                value={markupPct} 
                onChange={(e) => setMarkupPct(Number(e.target.value))} 
              />
              <span className="text-muted-foreground text-sm font-medium">= +₹{markupAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-border mx-2"></div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
            <p className="text-xs mb-1 uppercase tracking-wider font-semibold">Selling Price</p>
            <p className="text-2xl font-black flex items-center">
              <IndianRupee className="w-6 h-6 mr-1" />
              {sellingPrice.toLocaleString()}
            </p>
          </div>
        </div>
        <Button size="lg" className="w-full md:w-auto font-bold rounded-xl" onClick={() => createProposal.mutate()} disabled={createProposal.isPending || days.length === 0 || days.some(d => !d.destinationId)}>
          <Save className="w-5 h-5 mr-2" />
          {createProposal.isPending ? 'Saving...' : 'Save Proposal vNext'}
        </Button>
      </div>

      {/* Itinerary Picker Modal */}
      <Dialog open={showItineraryModal} onOpenChange={setShowItineraryModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Itinerary</DialogTitle>
            <DialogDescription>
              Select a published itinerary from the builder. This will auto-populate your proposal days, costs, and destinations.
            </DialogDescription>
          </DialogHeader>

          {isLoadingItineraries ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {itineraries?.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-muted-foreground">
                  <Map className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No published itineraries found.</p>
                  <p className="text-sm">Go to the Itinerary Builder and publish one first.</p>
                </div>
              ) : (
                itineraries?.map((itinerary: any) => (
                  <Card 
                    key={itinerary.id} 
                    className="overflow-hidden cursor-pointer hover:border-primary transition-colors group"
                    onClick={() => handleSelectItinerary(itinerary)}
                  >
                    <div className="h-32 bg-slate-100 relative">
                      {itinerary.coverPhotoUrl ? (
                         <img src={itinerary.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" className="rounded-xl font-bold">Import Now</Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-slate-900 truncate">{itinerary.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CalendarRange className="w-3 h-3" />
                          {itinerary._count?.days || itinerary.days?.length || 0} days
                        </span>
                        {itinerary.perPersonCost && (
                          <span className="font-semibold text-slate-700">₹{Number(itinerary.perPersonCost).toLocaleString('en-IN')} / pp</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
