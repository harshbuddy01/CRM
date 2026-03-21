'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, IndianRupee, TrendingUp, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export function BillingTab({ queryId }: { queryId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['billing-summary', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/billing-summary`);
      return res.data.data;
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!data) return <Card><CardContent className="p-8 text-center text-muted-foreground">Unable to load billing data.</CardContent></Card>;

  const { customer, supplier, payments, invoice } = data;

  const KpiCard = ({ label, value, color = 'text-foreground', icon: Icon = IndianRupee }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">{label}</p></div>
        <p className={`text-xl font-bold ${color}`}>₹{Number(value).toLocaleString('en-IN')}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">Customer Side</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Amount" value={customer.totalAmount} />
          <KpiCard label="Received" value={customer.totalReceived} color="text-green-600" />
          <KpiCard label="Pending" value={customer.totalPending} color={customer.totalPending > 0 ? 'text-red-600' : 'text-green-600'} />
          <KpiCard label="Gross Profit" value={customer.grossProfit} color={customer.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'} icon={TrendingUp} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Supplier Side</h3>
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Supplier Cost" value={supplier.supplierAmount} />
          <KpiCard label="Paid to Suppliers" value={supplier.supplierReceived} color="text-green-600" />
          <KpiCard label="Supplier Pending" value={supplier.supplierPending} color={supplier.supplierPending > 0 ? 'text-amber-600' : 'text-green-600'} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Payment History</h3>
        {!payments?.length ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No payments recorded yet.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {payments.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{p.mode.toUpperCase()} {p.referenceUtr && `• ${p.referenceUtr}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'verified' || p.status === 'banked' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(p.paymentDate), 'PP')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Invoice Status</h3>
        {invoice ? (
          <Card><CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{invoice.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">₹{Number(invoice.totalAmount).toLocaleString('en-IN')}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>{invoice.status}</span>
          </CardContent></Card>
        ) : (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No invoice generated yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
