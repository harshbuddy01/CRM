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
import { Plus, Edit2, Trash2, MapPin, Building2, IndianRupee } from 'lucide-react';
import Link from 'next/link';

const hotelSchema = z.object({
  destinationId: z.string().min(1, 'Destination is required'),
  name: z.string().min(2, 'Name is required'),
  category: z.string().optional(),
  basePrice: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export default function HotelsPage() {
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
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Data</h1>
          <p className="text-muted-foreground">Manage your destinations and hotels inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open ? handleCloseDialog() : setIsDialogOpen(true)}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

      <div className="flex gap-4 border-b">
        <Link href="/masters/destinations" className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground">
          <MapPin className="w-4 h-4" /> Destinations
        </Link>
        <Link href="/masters/hotels" className="flex items-center gap-2 px-4 py-2 border-b-2 border-primary text-primary font-medium">
          <Building2 className="w-4 h-4" /> Hotels
        </Link>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destination</TableHead>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading hotels...</TableCell></TableRow>
            ) : hotels.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hotels found. Add one to get started.</TableCell></TableRow>
            ) : (
              hotels.map((hotel: any) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.destination?.name || '-'}</TableCell>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>{hotel.category || '-'}</TableCell>
                  <TableCell className="flex items-center text-muted-foreground">
                    <IndianRupee className="w-3 h-3 mr-1" />
                    {hotel.basePrice || '0'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${hotel.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-stone-100 text-stone-700'}`}>
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(hotel)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm('Are you sure you want to delete this hotel?')) deleteMutation.mutate(hotel.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
