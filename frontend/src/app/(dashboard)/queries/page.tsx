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
  const { user } = useAuthStore();

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/queries');
      setQueries(res.data.data.queries);
    } catch (error) {
      console.error('Failed to fetch queries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

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
              {queries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
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
    </div>
  );
}
