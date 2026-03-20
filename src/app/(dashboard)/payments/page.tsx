'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IndianRupee, Search, Loader2, CreditCard, AlertTriangle, Calendar as CalendarIcon, FileText, CheckCircle2, Luggage } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';

export default function PaymentsLedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paymentsRes, isLoading: ledgerLoading } = useQuery({
    queryKey: ['payments', 'all'],
    queryFn: async () => {
      const res = await api.get('/payments');
      return res.data.data; // { payments, meta }
    }
  });

  const { data: overdueRes, isLoading: overdueLoading } = useQuery({
    queryKey: ['payments', 'overdue'],
    queryFn: async () => {
      const res = await api.get('/payments/overdue');
      return res.data.data;
    }
  });

  const payments = paymentsRes?.payments || [];
  const overdueTours = overdueRes || [];

  const filteredPayments = payments.filter((p: any) => 
    p.tour?.tourCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.query?.queryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.query?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.referenceUtr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = payments.reduce((sum: number, p: any) => p.status === 'verified' ? sum + Number(p.amount) : sum, 0);
  const totalPending = payments.reduce((sum: number, p: any) => p.status === 'pending' ? sum + Number(p.amount) : sum, 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Ledger</h1>
        <p className="text-muted-foreground mt-1 text-sm">Monitor all incoming transactions, verify deposits, and track overdue accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-1">Total Verified Revenue</p>
            <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 flex items-center">
              <IndianRupee className="w-6 h-6 mr-1 opacity-80" />
              {totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Pending Verification</p>
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-300 flex items-center">
              <IndianRupee className="w-6 h-6 mr-1 opacity-80" />
              {totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Overdue Accounts</p>
            <h2 className="text-3xl font-bold text-red-900 dark:text-red-300 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 opacity-80" />
              {overdueTours.length}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="ledger">All Transactions</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ref/UTR, customer, or tour code..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">Transaction Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ledgerLoading ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="w-10 h-10 opacity-20 mx-auto mb-3" />
                  <p>No transactions found.</p>
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredPayments.map((p: any) => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          p.status === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{Number(p.amount).toLocaleString('en-IN')}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-sm font-medium">
                            <span className="capitalize">{p.mode.replace('_', ' ')}</span>
                            {p.referenceUtr && <span className="text-muted-foreground">• Ref: {p.referenceUtr}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                            <span>{format(new Date(p.paymentDate), 'MMM d, yyyy h:mm a')}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{p.query?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 text-sm justify-between w-full sm:w-auto">
                         <span className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider w-fit sm:ml-auto ${
                            p.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {p.status}
                          </span>
                          
                          {p.tourId ? (
                            <Link href={`/tours/${p.tourId}`} className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                              <Luggage className="w-3 h-3" /> {p.tour?.tourCode}
                            </Link>
                          ) : (
                            <Link href={`/queries/${p.queryId}`} className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                              <FileText className="w-3 h-3" /> Advance Deposit (Lead)
                            </Link>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Accounts Severely Overdue
              </CardTitle>
              <CardDescription className="text-red-700/80">
                Tours starting in less than 7 days where Full Payment has not been realized.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {overdueLoading ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>
              ) : overdueTours.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 opacity-20 text-emerald-600 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium">Zero Overdue Accounts.</p>
                  <p className="text-sm mt-1">Excellent collections compliance.</p>
                </div>
              ) : (
                <div className="divide-y relative">
                  {overdueTours.map((t: any) => (
                    <div key={t.tourId} className="p-5 hover:bg-red-50/20 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/tours/${t.tourId}`} className="text-lg font-bold text-red-600 hover:underline flex items-center gap-2">
                             {t.tourCode} 
                          </Link>
                          <p className="text-sm font-medium mt-1">{t.customerName} • {t.phone}</p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            Tour Starts: {format(new Date(t.startDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Balance Remaining</p>
                          <p className="text-xl font-bold text-red-600 flex items-center justify-end">
                            <IndianRupee className="w-4 h-4 mr-0.5" />{Number(t.balanceDue).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground mt-1">out of {Number(t.totalSellingPrice).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}


