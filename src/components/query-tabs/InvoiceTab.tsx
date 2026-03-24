'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export function InvoiceTab({ queryId }: { queryId: string }) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['query-invoices', queryId],
    queryFn: async () => {
      const res = await api.get(`/finance/invoices?queryId=${queryId}`);
      return res.data?.data?.items || [];
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Invoices</h3>
      </div>

      {!invoices?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No invoices found for this query. Generate one from the Billing tab.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => (
            <Card key={inv.id} className="hover:border-primary transition-colors cursor-pointer group" onClick={() => window.open(`/finance/invoices/${inv.id}`, '_blank')}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(inv.totalAmount).toLocaleString()} • {format(new Date(inv.createdAt), 'PP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{inv.status}</span>
                  <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
