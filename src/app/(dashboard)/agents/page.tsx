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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">B2B Agent Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your travel agent partners and track their conversion throughput.
          </p>
        </div>
        <Button onClick={() => router.push('/agents/new')}>
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

      <Card className="rounded-md border shadow-sm">
        {isLoading && !agents.length ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Company / Partner</TableHead>
                <TableHead className="font-semibold">Contact Person</TableHead>
                <TableHead className="font-semibold">Stats</TableHead>
                <TableHead className="font-semibold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-red-500">
                    {error instanceof Error ? error.message : 'Failed to load agents'}
                  </TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
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
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/agents/${a.id}`)}
                  >
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p>{a.companyName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{a.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium">
                          <User className="w-3 h-3 mr-2" /> {a.contactPerson || '—'}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 mr-2" /> {a.mobile}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Leads: <b>{a._count?.queries || 0}</b></span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {a.isActive ? 'Active' : 'Inactive'}
                       </span>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-7 w-7 ml-2 text-red-500 hover:text-red-600 hover:bg-red-50" 
                         onClick={(e) => handleDelete(a.id, e)}
                       >
                          <Trash2 className="w-4 h-4" />
                       </Button>
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
