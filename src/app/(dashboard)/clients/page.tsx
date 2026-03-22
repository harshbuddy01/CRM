'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
import { Loader2, Search, UserPlus, Contact, Phone, Mail, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const router = useRouter();

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (search) params.append('search', search);
      const res = await api.get(`/clients?${params.toString()}`);
      return res.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const clients = data?.clients || [];
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
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">Client Directory</h1>
          <p className="text-muted-foreground mt-2 text-xs md:text-sm font-medium">
            Maintain your customer database and track lifetime travel history.
          </p>
        </div>
        <Button 
          onClick={() => toast.info('Client creation is currently automated via leads.')}
          className="w-full sm:w-auto rounded-xl font-bold h-11 sm:h-9 shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-md border shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email or phone..."
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
          {isLoading && !clients.length ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Client Name</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Contact Details</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Location</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Bookings</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Added On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-red-500 font-bold">
                      {error instanceof Error ? error.message : 'Failed to load clients'}
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Contact className="w-8 h-8 opacity-20" />
                        <p>No clients found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((c: any) => (
                    <TableRow 
                      key={c.id} 
                      className="cursor-pointer hover:bg-slate-50/50 transition-colors group focus-within:bg-slate-50/50"
                      onClick={() => router.push(`/clients/${c.id}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${c.name ?? 'Unknown client'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/clients/${c.id}`);
                        }
                      }}
                    >
                      <TableCell className="font-black text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs shadow-xs group-hover:bg-indigo-100 transition-colors">
                            {(c.name ?? '').charAt(0).toUpperCase() || '?'}
                          </div>
                          {c.name ?? 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs font-bold text-slate-500">
                            <Phone className="w-3 h-3 mr-2" /> {c.phone}
                          </div>
                          {c.email && (
                            <div className="flex items-center text-xs font-medium text-slate-400">
                              <Mail className="w-3 h-3 mr-2" /> {c.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-2" /> {c.city || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-xs">
                          {c._count?.queries || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-[10px] font-black text-slate-300 uppercase italic">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
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
          {isLoading && !clients.length ? (
            <div className="p-8 flex items-center justify-center bg-card rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-red-100 text-red-500 font-bold">
              {error instanceof Error ? error.message : 'Failed to load clients'}
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-slate-200 text-muted-foreground italic font-medium">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Contact className="w-8 h-8 opacity-20" />
                <p>No clients found.</p>
              </div>
            </div>
          ) : (
            clients.map((c: any) => (
              <Card 
                key={c.id} 
                className="p-5 active:scale-[0.98] transition-all cursor-pointer border-slate-200 shadow-md rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none"
                onClick={() => router.push(`/clients/${c.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${c.name ?? 'Unknown client'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/clients/${c.id}`);
                  }
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm leading-none shrink-0">
                    {(c.name ?? '').charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg text-slate-900 leading-tight truncate">{c.name ?? 'Unknown'}</h3>
                    <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      <MapPin className="w-2.5 h-2.5 mr-1" /> {c.city || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Phone</p>
                    <p className="font-black text-slate-700 text-xs">{c.phone || '—'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Bookings</p>
                    <p className="font-black text-indigo-600 text-base leading-none">{c._count?.queries || 0}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <p className="font-medium text-slate-400 truncate max-w-[180px]">{c.email || 'No email provided'}</p>
                  <p className="font-black text-slate-300 uppercase italic">
                    Joined {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) : '—'}
                  </p>
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
