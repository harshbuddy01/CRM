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
import { PlusCircle, Loader2, Search } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type QueryData = {
  id: string;
  queryCode: string;
  name: string;
  phone: string;
  status: string;
  destination: string | null;
  assignedUser?: { name: string } | null;
  createdAt: string;
};

export default function QueriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const { user } = useAuthStore();
  const router = useRouter();

  const fetchQueries = async (p: number, s: string, stat: string) => {
    const params = new URLSearchParams({ page: p.toString(), limit: '10' });
    if (s) params.append('search', s);
    if (stat && stat !== 'all') params.append('status', stat);

    const res = await api.get(`/queries?${params.toString()}`);
    return res.data;
  };

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['queries', page, search, status],
    queryFn: () => fetchQueries(page, search, status),
    placeholderData: (previousData) => previousData, // keep old data while loading new page
  });

  const { data: statusSettings } = useQuery({
    queryKey: ['status-settings'],
    queryFn: async () => {
      const res = await api.get('/status-settings');
      return res.data.data;
    }
  });

  const queries: QueryData[] = data?.data?.queries || [];
  const totalPages = data?.data?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(tempSearch);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leads Pipeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your incoming trip requests and queries.
          </p>
        </div>
        {user?.permissions['query.create'] && (
          <Link href="/queries/new">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-md border shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="pl-8"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select 
            value={status} 
            onValueChange={(val) => {
              setStatus(val as string);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusSettings?.map((s: any) => (
                <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && !queries.length ? (
          <div className="p-12 flex items-center justify-center bg-card rounded-md border shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 bg-card rounded-md border shadow-sm">
            {error instanceof Error ? error.message : 'Failed to load queries'}
          </div>
        ) : queries.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground bg-card rounded-md border shadow-sm flex flex-col items-center justify-center space-y-2">
            <Search className="w-8 h-8 opacity-20" />
            <p>No leads found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block rounded-md border shadow-sm overflow-hidden text-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Lead ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Destination</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    {user?.permissions['query.view_all'] && <TableHead className="font-semibold">Assigned</TableHead>}
                    <TableHead className="font-semibold text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queries.map((q) => (
                    <TableRow 
                      key={q.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors" 
                      onClick={() => router.push(`/queries/${q.id}`)}
                      tabIndex={0}
                      role="link"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/queries/${q.id}`);
                        }
                      }}
                    >
                      <TableCell className="font-medium text-xs text-muted-foreground">{q.queryCode}</TableCell>
                      <TableCell className="font-medium">{q.name}</TableCell>
                      <TableCell className="text-xs">{q.phone}</TableCell>
                      <TableCell>{q.destination || '—'}</TableCell>
                      <TableCell>
                        {(() => {
                          const s = statusSettings?.find((st: any) => st.code === q.status);
                          const label = s ? s.label : q.status.replace('_', ' ');
                          const color = s ? s.colorHex : '#94a3b8';
                          
                          return (
                            <span 
                              className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                              style={{ 
                                backgroundColor: `${color}15`, 
                                color: color,
                                borderColor: `${color}30`
                              }}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </TableCell>
                      {user?.permissions['query.view_all'] && (
                        <TableCell className="text-sm">
                          {q.assignedUser?.name ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              {q.assignedUser.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Unassigned</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground text-xs text-right whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 pb-8">
              {queries.map((q) => (
                <Card 
                  key={q.id} 
                  className="p-4 active:scale-[0.98] transition-transform cursor-pointer border-slate-200 shadow-sm"
                  onClick={() => router.push(`/queries/${q.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/queries/${q.id}`);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{q.queryCode}</p>
                      <h3 className="font-bold text-base text-slate-900">{q.name}</h3>
                    </div>
                    {(() => {
                      const s = statusSettings?.find((st: any) => st.code === q.status);
                      const label = s ? s.label : q.status.replace('_', ' ');
                      const color = s ? s.colorHex : '#94a3b8';
                      return (
                        <span 
                          className="text-[9px] font-black uppercase px-2 py-1 rounded-md border"
                          style={{ backgroundColor: `${color}10`, color: color, borderColor: `${color}40` }}
                        >
                          {label}
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t pt-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Destination</p>
                      <p className="font-medium text-slate-700 truncate">{q.destination || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Phone</p>
                      <p className="font-medium text-slate-700 truncate">{q.phone}</p>
                    </div>
                    {user?.permissions['query.view_all'] && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Assigned To</p>
                        <p className="font-medium text-slate-700 truncate">{q.assignedUser?.name || 'Unassigned'}</p>
                      </div>
                    )}
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Created</p>
                      <p className="font-medium text-slate-700">
                        {new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Container */}
      {!isError && queries.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
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
