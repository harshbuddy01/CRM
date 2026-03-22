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
import { Plus, Edit2, Trash2, MapPin, Building2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const destinationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  country: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function DestinationsPage() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // @ts-ignore - Zod inference strict mismatch handling
  const form = useForm<z.infer<typeof destinationSchema>>({
    resolver: zodResolver(destinationSchema) as any,
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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Master Data</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage your destinations and hotels inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open ? handleCloseDialog() : setIsDialogOpen(true)}>
          {/* @ts-ignore - Trigger interface typing override */}
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
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Country</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : destinations.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No destinations found. Add one to get started.</TableCell></TableRow>
              ) : (
                destinations.map((dest: any) => (
                  <TableRow key={dest.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-900">{dest.name}</TableCell>
                    <TableCell className="text-xs font-medium">{dest.country || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${dest.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {dest.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => handleOpenEdit(dest)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                          if (confirm('Are you sure you want to delete this destination?')) deleteMutation.mutate(dest.id);
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
          ) : destinations.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">No destinations found.</Card>
          ) : (
            destinations.map((dest: any) => (
              <Card key={dest.id} className="p-4 border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base text-slate-900">{dest.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${dest.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {dest.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">{dest.country || 'No Country'}</p>

                <div className="flex gap-2 pt-1 border-t mt-3">
                  <Button variant="outline" className="flex-1 h-9 rounded-xl font-bold text-xs" onClick={() => handleOpenEdit(dest)}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                  </Button>
                  <Button variant="ghost" className="h-9 rounded-xl font-bold text-xs text-destructive hover:bg-destructive/10" onClick={() => {
                    if (confirm('Are you sure you want to delete this destination?')) deleteMutation.mutate(dest.id);
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
