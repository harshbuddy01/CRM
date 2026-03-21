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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Maintain your customer database and track lifetime travel history.
          </p>
        </div>
        <Button onClick={() => toast.info('Client creation is currently automated via leads.')}>
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

      <Card className="rounded-md border shadow-sm">
        {isLoading && !clients.length ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Client Name</TableHead>
                <TableHead className="font-semibold">Contact Details</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold text-center">Total Bookings</TableHead>
                <TableHead className="font-semibold text-right">Added On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-red-500">
                    {error instanceof Error ? error.message : 'Failed to load clients'}
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
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
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/clients/${c.id}`)}
                  >
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 mr-2" /> {c.phone}
                        </div>
                        {c.email && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="w-3 h-3 mr-2" /> {c.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-2" /> {c.city || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-muted px-2 py-0.5 rounded text-xs font-bold">
                        {c._count?.queries || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

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
