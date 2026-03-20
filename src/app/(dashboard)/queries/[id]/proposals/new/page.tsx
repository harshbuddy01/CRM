'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, IndianRupee, Save } from 'lucide-react';

interface ProposalDay {
  dayNumber: number;
  destinationId: string;
  hotelId: string;
  activities: string;
  mealsIncluded: string;
  transport: string;
  dayCost: number;
}

export default function ProposalBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryId = params.id;
  const queryClient = useQueryClient();

  const [days, setDays] = useState<ProposalDay[]>([
    { dayNumber: 1, destinationId: '', hotelId: '', activities: '', mealsIncluded: 'BB', transport: '', dayCost: 0 }
  ]);
  const [markupPct, setMarkupPct] = useState<number>(0);

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

  const createProposal = useMutation({
    mutationFn: async () => {
      await api.post(`/queries/${queryId}/proposals`, { days, markupPct });
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

  const totalCost = days.reduce((acc, obj) => acc + (Number(obj.dayCost) || 0), 0);
  const markupAmount = totalCost * (markupPct / 100);
  const sellingPrice = totalCost + markupAmount;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-32">
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

      <div className="space-y-6">
        {days.map((day, index) => {
          const destHotels = hotels.filter((h: any) => h.destinationId === day.destinationId);

          return (
            <Card key={index} className="overflow-visible">
              <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between">
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
                      <Input placeholder="e.g. Private Airport Transfer" value={day.transport} onChange={(e) => updateDay(index, 'transport', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Activities</label>
                      <Input placeholder="e.g. City Tour, Scuba Diving" value={day.activities} onChange={(e) => updateDay(index, 'activities', e.target.value)} />
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

        <Button variant="outline" className="w-full py-8 border-dashed" onClick={handleAddDay}>
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
        <Button size="lg" className="w-full md:w-auto font-bold" onClick={() => createProposal.mutate()} disabled={createProposal.isPending || days.some(d => !d.destinationId)}>
          <Save className="w-5 h-5 mr-2" />
          {createProposal.isPending ? 'Saving...' : 'Save Proposal vNext'}
        </Button>
      </div>
    </div>
  );
}
