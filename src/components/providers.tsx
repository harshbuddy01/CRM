'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 1000, // consider data stale after 2 seconds
            retry: 1,
            refetchOnWindowFocus: true, // auto-refresh when clicking back to the CRM tab
            refetchInterval: 5000, // auto-refresh active queries every 5 seconds
            refetchIntervalInBackground: false, // PAUSE polling automatically when the tab is hidden or backgrounded
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
