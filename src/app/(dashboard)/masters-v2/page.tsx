'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Edit2, Trash2, Loader2, Building2, Map, Car, Bed, Utensils, Palette } from 'lucide-react';
import { toast } from 'sonner';

const MASTER_CONFIG = [
  { id: 'suppliers', label: 'Suppliers', model: 'suppliers', icon: Building2 },
  { id: 'activities', label: 'Activities', model: 'activities', icon: Map },
  { id: 'transfers', label: 'Transfers', model: 'transfers', icon: Car },
  { id: 'room-types', label: 'Room Types', model: 'room-types', icon: Bed },
  { id: 'meal-plans', label: 'Meal Plans', model: 'meal-plans', icon: Utensils },
  { id: 'package-themes', label: 'Themes', model: 'package-themes', icon: Palette },
];

export default function MastersV2Page() {
  const [activeTab, setActiveTab] = useState('suppliers');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Database</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Global catalogs for travel components and service providers.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-auto flex flex-wrap gap-1">
          {MASTER_CONFIG.map((m) => (
            <TabsTrigger 
              key={m.id} 
              value={m.id}
              className="px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <m.icon className="w-3.5 h-3.5 mr-2" />
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MASTER_CONFIG.map((m) => (
          <TabsContent key={m.id} value={m.id}>
            <MasterManagementTable config={m} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MasterManagementTable({ config }: { config: any }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', city: '', category: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['masters', config.id, search],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.append('search', search);
      const res = await api.get(`/masters-v2/${config.model}?${p.toString()}`);
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingId) {
        return api.patch(`/masters-v2/${config.model}/${editingId}`, payload);
      }
      return api.post(`/masters-v2/${config.model}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masters', config.id] });
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', city: '', category: '' });
      toast.success('Saved successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error saving')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/masters-v2/${config.model}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masters', config.id] });
      toast.success('Deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && config.id !== 'transfers') return;
    
    let payload: any = {};
    
    switch (config.id) {
      case 'suppliers':
        payload = {
          name: formData.name,
          city: formData.city,
          type: formData.category?.toLowerCase() || 'hotel',
          isActive: true
        };
        break;
      case 'activities':
        payload = {
          name: formData.name,
          destinationId: formData.city, // Assuming city dropdown provides destinationId
          pricePerPerson: Number(formData.price) || 0,
          description: formData.description,
          isActive: true
        };
        break;
      case 'transfers':
        payload = {
          vehicleType: formData.name, // For transfers, name field is used for vehicle type in the UI
          destinationId: formData.city,
          price: Number(formData.price) || 0,
          description: formData.description,
          isActive: true
        };
        break;
      default:
        // RoomType, MealPlan, PackageTheme
        payload = {
          name: formData.name,
          price: formData.price ? Number(formData.price) : undefined,
          isActive: true
        };
    }
    
    mutation.mutate(payload);
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ name: item.name, city: item.city || '', category: item.category || '' });
    setIsAdding(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">{config.label}</CardTitle>
          <CardDescription>Manage your {config.label.toLowerCase()} catalog</CardDescription>
        </div>
        <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({name:'', city:'', category:''}); }}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="h-8"
          />
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/20 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                   <Input 
                     placeholder="Name *" 
                     value={formData.name} 
                     onChange={e => setFormData({...formData, name: e.target.value})} 
                     className="h-9"
                   />
                </div>
                {config.id === 'suppliers' ? (
                  <>
                    <Input 
                      placeholder="Category (e.g. DMC, Hotel)" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="h-9"
                    />
                    <Input 
                      placeholder="City" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      className="h-9"
                    />
                  </>
                ) : null}
             </div>
             <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingId ? 'Update' : 'Save'} Item
                </Button>
             </div>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {config.id === 'suppliers' && <TableHead>Category</TableHead>}
              {config.id === 'suppliers' && <TableHead>City</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : data?.items?.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No records found.</TableCell></TableRow>
            ) : (
              data?.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  {config.id === 'suppliers' && <TableCell className="text-sm">{item.category || '—'}</TableCell>}
                  {config.id === 'suppliers' && <TableCell className="text-sm">{item.city || '—'}</TableCell>}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)}>
                         <Edit2 className="w-3.5 h-3.5" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-destructive group"
                         onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(item.id); }}
                        >
                         <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
