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
          <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="followup">Follow Up</SelectItem>
              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              <SelectItem value="ready_to_pay">Ready To Pay</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-md border shadow-sm">
        {isLoading && !queries.length ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Lead ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Destination</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                {user?.permissions['query.view_all'] && <TableHead className="font-semibold">Assigned To</TableHead>}
                <TableHead className="font-semibold text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={user?.permissions['query.view_all'] ? 7 : 6} className="text-center h-24 text-red-500">
                    {error instanceof Error ? error.message : 'Failed to load queries'}
                  </TableCell>
                </TableRow>
              ) : queries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.permissions['query.view_all'] ? 7 : 6} className="text-center h-32 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No leads found matching your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                queries.map((q) => (
                  <TableRow key={q.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/queries/${q.id}`)}>
                    <TableCell className="font-medium text-xs text-muted-foreground">{q.queryCode}</TableCell>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell className="text-xs">{q.phone}</TableCell>
                    <TableCell>{q.destination || '—'}</TableCell>
                    <TableCell>
                      <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full tracking-tight ${
                        q.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        q.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        q.status === 'lost' || q.status === 'invalid' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {q.status.replace('_', ' ')}
                      </span>
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
                    <TableCell className="text-sm text-muted-foreground text-xs text-right whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

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
