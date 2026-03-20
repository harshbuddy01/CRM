'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';

const destinationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  country: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function DestinationsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof destinationSchema>>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { name: '', country: '', description: '', isActive: true },
  });

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const res = await api.get('/masters/destinations');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof destinationSchema>) => {
      await api.post('/masters/destinations', data);
    },
    onSuccess: () => {
      toast.success('Destination added successfully');
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string } & z.infer<typeof destinationSchema>) => {
      const { id, ...payload } = data;
      await api.put(`/masters/destinations/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Destination updated successfully');
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/masters/destinations/${id}`);
    },
    onSuccess: () => {
      toast.success('Destination deleted');
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });

  const handleOpenEdit = (dest: any) => {
    setEditingId(dest.id);
    form.reset({
      name: dest.name,
      country: dest.country || '',
      description: dest.description || '',
      isActive: dest.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset({ name: '', country: '', description: '', isActive: true });
  };

  const onSubmit = (values: z.infer<typeof destinationSchema>) => {
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
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Destination' : 'Add New Destination'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Bali" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input placeholder="e.g. Indonesia" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl><Input placeholder="Brief info..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">Is this destination available for new proposals?</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Save Changes' : 'Create Destination'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 border-b">
        <Link href="/masters/destinations" className="flex items-center gap-2 px-4 py-2 border-b-2 border-primary text-primary font-medium">
          <MapPin className="w-4 h-4" /> Destinations
        </Link>
        <Link href="/masters/hotels" className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground">
          <Building2 className="w-4 h-4" /> Hotels
        </Link>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading destinations...</TableCell></TableRow>
            ) : destinations.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No destinations found. Add one to get started.</TableCell></TableRow>
            ) : (
              destinations.map((dest: any) => (
                <TableRow key={dest.id}>
                  <TableCell className="font-medium">{dest.name}</TableCell>
                  <TableCell>{dest.country || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${dest.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-stone-100 text-stone-700'}`}>
                      {dest.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(dest)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm('Are you sure you want to delete this destination?')) deleteMutation.mutate(dest.id);
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
