import { Card, CardContent } from '@/components/ui/card';
import { Map } from 'lucide-react';

export default function ToursPage() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center">
      <Card className="max-w-md w-full border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Map className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Tours & Packages</h1>
            <p className="text-muted-foreground">
              Inventory management and fixed departure package builder tools are coming soon in Sprint 4.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
