'use client';

import { useEffect, useState } from 'react';
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
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

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
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  const fetchQueries = async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/queries?page=${currentPage}&limit=10`);
      setQueries(res.data.data.queries);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch queries', err);
      setError('Failed to load leads, please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries(page);
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your incoming trip requests and queries.
          </p>
        </div>
        {user?.permissions['query.create'] && (
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Lead
          </Button>
        )}
      </div>

      <Card className="rounded-md border">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                {user?.permissions['query.view_all'] && <TableHead>Assigned To</TableHead>}
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={user?.permissions['query.view_all'] ? 7 : 6} className="text-center h-24 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : queries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.permissions['query.view_all'] ? 7 : 6} className="text-center h-24 text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                queries.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium text-xs">{q.queryCode}</TableCell>
                    <TableCell>{q.name}</TableCell>
                    <TableCell className="text-xs">{q.phone}</TableCell>
                    <TableCell>{q.destination || '—'}</TableCell>
                    <TableCell>
                      <span className="capitalize text-xs font-semibold px-2 py-1 bg-muted rounded-full tracking-tight">
                        {q.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    {user?.permissions['query.view_all'] && (
                      <TableCell className="text-sm">
                        {q.assignedUser?.name || 'Unassigned'}
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-muted-foreground text-xs">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground px-2 font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
