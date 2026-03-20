import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

export default function ProposalsPage() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center">
      <Card className="max-w-md w-full border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Target className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
            <p className="text-muted-foreground">
              The automated proposal generator and templating system is currently in development. It will be available in Sprint 3.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
