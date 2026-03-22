'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Briefcase, Phone, Mail, Building2, User, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AgentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const router = useRouter();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/agents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent deleted successfully');
    }
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteMutation.mutate(id);
    }
  };

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['agents', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (search) params.append('search', search);
      const res = await api.get(`/agents?${params.toString()}`);
      return res.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const agents = data?.agents || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(tempSearch);
  };

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">B2B Agent Directory</h1>
          <p className="text-muted-foreground mt-2 text-xs md:text-sm font-medium">
            Manage your travel agent partners and track their conversion throughput.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/agents/new')}
          className="w-full sm:w-auto rounded-xl font-bold h-11 sm:h-9 shadow-md transition-all active:scale-95"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Add B2B Agent
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-md border shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by company or contact person..."
              className="pl-8"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="space-y-4">
        {/* Desktop Table View */}
        <Card className="hidden md:block rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm">
          {isLoading && !agents.length ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Company / Partner</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Contact Person</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Stats</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-red-500 font-bold">
                      {error instanceof Error ? error.message : 'Failed to load agents'}
                    </TableCell>
                  </TableRow>
                ) : agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground italic font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Briefcase className="w-8 h-8 opacity-20" />
                        <p>No agents found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((a: any) => (
                    <TableRow 
                      key={a.id} 
                      className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
                      onClick={() => router.push(`/agents/${a.id}`)}
                    >
                      <TableCell className="font-black text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs group-hover:bg-blue-100 transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black leading-tight">{a.companyName}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{a.city}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-black text-slate-700">
                            <User className="w-3.5 h-3.5 mr-2 text-slate-400" /> {a.contactPerson || '—'}
                          </div>
                          <div className="flex items-center text-xs font-bold text-slate-400">
                            <Phone className="w-3 h-3 mr-2" /> {a.mobile}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Leads Handled: <b className="text-slate-900 ml-1">{a._count?.queries || 0}</b></span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shadow-xs",
                            a.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {a.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus:opacity-100 transition-opacity" 
                            onClick={(e) => handleDelete(a.id, e)}
                            aria-label={`Delete agent ${a.companyName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {isLoading && !agents.length ? (
            <div className="p-8 flex items-center justify-center bg-card rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-red-100 text-red-500 font-bold">
               {error instanceof Error ? error.message : 'Failed to load agents'}
            </div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-slate-200 text-muted-foreground italic font-medium">
               <div className="flex flex-col items-center justify-center space-y-2">
                  <Briefcase className="w-8 h-8 opacity-20" />
                  <p>No agents found.</p>
               </div>
            </div>
          ) : (
            agents.map((a: any) => (
              <Card 
                key={a.id} 
                className="p-5 active:scale-[0.98] transition-all cursor-pointer border-slate-200 shadow-md rounded-2xl"
                onClick={() => router.push(`/agents/${a.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-sm leading-none shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-lg text-slate-900 leading-tight truncate">{a.companyName}</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">{a.city}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border shadow-xs",
                    a.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4 bg-slate-50/50 px-3 rounded-xl -mx-2">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Contact</p>
                    <p className="font-black text-slate-700 text-xs truncate">{a.contactPerson || 'N/A'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Queries</p>
                    <p className="font-black text-blue-600 text-lg leading-none">{a._count?.queries || 0}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center text-slate-500 font-black">
                    <Phone className="w-3 h-3 mr-1.5 text-slate-400" /> {a.mobile}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 rounded-lg text-[10px] font-black text-red-500 hover:bg-red-50 -mr-2"
                    onClick={(e) => handleDelete(a.id, e)}
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" /> Remove
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || isPlaceholderData}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
