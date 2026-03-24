'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, MapPin, Building2, IndianRupee, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const hotelSchema = z.object({
  destinationId: z.string().min(1, 'Destination is required'),
  name: z.string().min(2, 'Name is required'),
  category: z.string().optional(),
  basePrice: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export default function HotelsPage() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // @ts-ignore - Zod inference strict mismatch handling
  const form = useForm<z.infer<typeof hotelSchema>>({
    resolver: zodResolver(hotelSchema) as any,
    defaultValues: { destinationId: '', name: '', category: '3 Star', basePrice: 0, isActive: true },
  });

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const res = await api.get('/masters/hotels');
      return res.data.data;
    },
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations', 'active'],
    queryFn: async () => {
      const res = await api.get('/masters/destinations?active=true');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof hotelSchema>) => {
      await api.post('/masters/hotels', data);
    },
    onSuccess: () => {
      toast.success('Hotel added successfully');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string } & z.infer<typeof hotelSchema>) => {
      const { id, ...payload } = data;
      await api.put(`/masters/hotels/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Hotel updated successfully');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/masters/hotels/${id}`);
    },
    onSuccess: () => {
      toast.success('Hotel deleted');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });

  const handleOpenEdit = (hotel: any) => {
    setEditingId(hotel.id);
    form.reset({
      destinationId: hotel.destinationId,
      name: hotel.name,
      category: hotel.category || '3 Star',
      basePrice: Number(hotel.basePrice) || 0,
      isActive: hotel.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset({ destinationId: '', name: '', category: '3 Star', basePrice: 0, isActive: true });
  };

  const onSubmit = (values: z.infer<typeof hotelSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Master Data</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage your destinations and hotels inventory</p>
        </div>
        <Dialog key={editingId ?? 'new'} open={isDialogOpen} onOpenChange={(open) => !open ? handleCloseDialog() : setIsDialogOpen(true)}>
          {/* @ts-ignore - Trigger interface typing override */}
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="destinationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {destinations.map((dest: any) => (
                            <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Taj Exotica" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            </FormControl>
                          <SelectContent>
                            <SelectItem value="Budget">Budget</SelectItem>
                            <SelectItem value="3 Star">3 Star</SelectItem>
                            <SelectItem value="4 Star">4 Star</SelectItem>
                            <SelectItem value="5 Star">5 Star</SelectItem>
                            <SelectItem value="Premium">Premium / Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (Cost / Night)</FormLabel>
                        <FormControl><Input type="number" placeholder="4000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">Is this hotel available to be booked?</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Save Changes' : 'Create Hotel'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg overflow-x-auto no-scrollbar">
        <Link href="/masters/destinations" className={cn(
          "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
          pathname === '/masters/destinations' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
        )}>
          <MapPin className="w-4 h-4" /> Destinations
        </Link>
        <Link href="/masters/hotels" className={cn(
          "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
          pathname === '/masters/hotels' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
        )}>
          <Building2 className="w-4 h-4" /> Hotels
        </Link>
      </div>

      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold">Destination</TableHead>
                <TableHead className="font-bold">Hotel Name</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Base Rate</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : hotels.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hotels found. Add one to get started.</TableCell></TableRow>
              ) : (
                hotels.map((hotel: any) => (
                  <TableRow key={hotel.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">{hotel.destination?.name || '-'}</TableCell>
                    <TableCell className="font-bold text-slate-900">{hotel.name}</TableCell>
                    <TableCell className="text-xs">{hotel.category || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center font-bold text-slate-700">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        {(Number(hotel.basePrice) || 0).toLocaleString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${hotel.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {hotel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => handleOpenEdit(hotel)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                          if (confirm('Are you sure you want to delete this hotel?')) deleteMutation.mutate(hotel.id);
                        }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : hotels.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">No hotels found.</Card>
          ) : (
            hotels.map((hotel: any) => (
              <Card key={hotel.id} className="p-4 border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{hotel.destination?.name || 'No Destination'}</p>
                    <h3 className="font-bold text-base text-slate-900">{hotel.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${hotel.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {hotel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs pt-3 border-t">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Base Rate</p>
                    <p className="font-black text-slate-900 flex items-center">
                      <IndianRupee className="w-3 h-3 mr-0.5" />
                      {(Number(hotel.basePrice) || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Category</p>
                    <p className="font-bold text-slate-700">{hotel.category || '—'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 h-9 rounded-xl font-bold text-xs" onClick={() => handleOpenEdit(hotel)}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                  </Button>
                  <Button variant="ghost" className="h-9 rounded-xl font-bold text-xs text-destructive hover:bg-destructive/10" onClick={() => {
                    if (confirm('Are you sure you want to delete this hotel?')) deleteMutation.mutate(hotel.id);
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
