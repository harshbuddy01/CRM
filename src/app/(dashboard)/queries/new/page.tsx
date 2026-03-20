'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').or(z.literal('')),
  destination: z.string().optional(),
  budget: z.string().optional(),
  travelDateFrom: z.date().optional(),
  travelDateTo: z.date().optional(),
  adults: z.coerce.number().min(1, 'At least 1 adult'),
  children: z.coerce.number().min(0),
  leadSource: z.string().min(1, 'Lead source is required'),
  campaignName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewQueryPage() {
  const router = useRouter();
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      destination: '',
      budget: '',
      travelDateFrom: undefined,
      travelDateTo: undefined,
      adults: 1,
      children: 0,
      leadSource: 'website',
      campaignName: '',
    } as any,
  });

  const checkPhoneDuplicate = async (phone: string) => {
    if (phone.length < 10) {
      setIsDuplicate(false);
      return;
    }
    
    try {
      setCheckingDuplicate(true);
      const res = await api.get(`/queries/duplicate-check?phone=${phone}`);
      // Backend returns isDuplicate
      setIsDuplicate(res.data.data.isDuplicate);
      if (res.data.data.isDuplicate) {
        form.setError('phone', { type: 'manual', message: 'An active lead already exists with this phone number' });
      } else {
        form.clearErrors('phone');
      }
    } catch (error) {
      console.error('Failed duplicate check', error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (isDuplicate) {
      toast.error('Cannot create lead', { description: 'Duplicate phone number found.' });
      return;
    }

    try {
      await api.post('/queries', {
        ...values,
        budget: values.budget ? parseFloat(values.budget) : null,
        travelDateFrom: values.travelDateFrom ? values.travelDateFrom.toISOString() : null,
        travelDateTo: values.travelDateTo ? values.travelDateTo.toISOString() : null,
      });
      toast.success('Lead Created', { description: 'The new query has been added.' });
      router.push('/queries');
    } catch (error: any) {
      toast.error('Failed to create lead', { description: error.response?.data?.message || 'Something went wrong.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Lead</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter customer details to create a new query in the pipeline.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="+91..." 
                            {...field} 
                            onBlur={(e) => {
                              field.onBlur();
                              checkPhoneDuplicate(e.target.value);
                            }}
                          />
                          {checkingDuplicate && (
                            <Loader2 className="w-4 h-4 absolute right-3 top-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Travel Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Goa, Bali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Estimated Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="travelDateFrom"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-col mt-2">
                       <FormLabel>Travel From</FormLabel>
                       <Popover>
                         {/* @ts-ignore */}
                        <PopoverTrigger asChild>
                           <FormControl>
                             <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                               {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                               <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                             </Button>
                           </FormControl>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                         </PopoverContent>
                       </Popover>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="travelDateTo"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-col mt-2">
                       <FormLabel>Travel To</FormLabel>
                       <Popover>
                         {/* @ts-ignore */}
                        <PopoverTrigger asChild>
                           <FormControl>
                             <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                               {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                               <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                             </Button>
                           </FormControl>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                         </PopoverContent>
                       </Popover>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Adults</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Children</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadSource"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Lead Source *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="walkin">Walk-in</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="facebook">Facebook/Instagram</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="reference">Reference</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaignName"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SummerSale2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || checkingDuplicate || isDuplicate}>
                  {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Lead
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
