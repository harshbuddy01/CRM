'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '@/lib/api';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { TRANSITIONS } from '@/lib/constants';
import { useAuthStore } from '@/lib/auth-store';

// We will fetch pipeline columns dynamically from /status-settings
// but we still export a default order fallback if API fails
const FALLBACK_COLUMNS = [
  { id: 'new', title: 'New Leads', color: '#3b82f6' },
  { id: 'quoted', title: 'Quoted', color: '#8b5cf6' },
  { id: 'negotiation', title: 'Negotiation', color: '#f59e0b' },
  { id: 'confirmed', title: 'Confirmed', color: '#10b981' },
];

type QueryData = {
  id: string;
  queryCode: string;
  name: string;
  phone: string;
  status: string;
  destination: string | null;
  budget: number | null;
  createdAt: string;
};

type BoardData = {
  [key: string]: QueryData[];
};

export default function PipelinePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [boardData, setBoardData] = useState<BoardData>({});
  const [isDragging, setIsDragging] = useState(false);

  // Fetch all queries (unpaginated for kanban, or very high limit)
  const { data, isLoading } = useQuery({
    queryKey: ['pipeline_queries'],
    queryFn: async () => {
      const res = await api.get('/queries?limit=500');
      return res.data.data.queries as QueryData[];
    },
  });

  const { data: statusSettings } = useQuery({
    queryKey: ['status-settings'],
    queryFn: async () => {
      const res = await api.get('/status-settings');
      return res.data.data;
    }
  });

  const columns = statusSettings 
    ? statusSettings
        .filter((s:any) => s.isDashboardVisible)
        .map((s:any) => ({ id: s.code, title: s.label, color: s.colorHex, isLocked: s.isLocked }))
    : FALLBACK_COLUMNS;

  // Organize queries into columns when data arrives
  useEffect(() => {
    if (data && columns.length > 0) {
      const newBoard: BoardData = {};
      columns.forEach((c:any) => { newBoard[c.id] = []; });

      // also catch ones that might not be visible but have queries (put in first col or hide? For now just initialize empty)
      // Actually we must initialize all statuses that have queries to prevent crash
      data.forEach((q) => {
        if (!newBoard[q.status]) newBoard[q.status] = [];
        newBoard[q.status].push(q);
      });

      setBoardData(newBoard);
    }
  }, [data]);


  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/queries/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_queries'] });
    },
    onError: (err: any) => {
      toast.error('Transition Failed', { description: err.response?.data?.message || 'Invalid status transition.' });
      queryClient.invalidateQueries({ queryKey: ['pipeline_queries'] }); // revert OP UI
    }
  });

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Validate Transition Rule Locally before pushing
    const sourceStatus = source.droppableId;
    const targetStatus = destination.droppableId;
    
    if (sourceStatus !== targetStatus) {
      let allowed = TRANSITIONS[sourceStatus] || [];
      if (user?.role !== 'admin') {
        allowed = allowed.filter(s => s !== 'confirmed');
      }

      if (!allowed.includes(targetStatus)) {
        toast.error('Invalid Move', { description: `Cannot move lead from ${sourceStatus.replace('_', ' ')} to ${targetStatus.replace('_', ' ')} directly or lack permission.` });
        return;
      }
    }

    // Optimistic UI Update
    const startCol = Array.from(boardData[sourceStatus]);
    const finishCol = sourceStatus === targetStatus ? startCol : Array.from(boardData[targetStatus] || []);
    
    const [movedItem] = startCol.splice(source.index, 1);

    if (sourceStatus === targetStatus) {
      startCol.splice(destination.index, 0, movedItem);
      setBoardData({ ...boardData, [sourceStatus]: startCol });
    } else {
      movedItem.status = targetStatus;
      finishCol.splice(destination.index, 0, movedItem);
      setBoardData({
        ...boardData,
        [sourceStatus]: startCol,
        [targetStatus]: finishCol,
      });

      // Fire API Request
      statusMutation.mutate({ id: draggableId, status: targetStatus });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] w-full">
      <div className="mb-4 md:mb-6 flex-none">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Lead Pipeline</h1>
        <p className="text-muted-foreground mt-1 text-xs md:text-sm max-w-2xl">
          Drag and drop leads to update their status. Rules are enforced automatically based on current status.
        </p>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 flex-1 h-full min-h-0 snap-x scrollbar-thin scrollbar-thumb-slate-200">
          {columns.map((col: any) => (
            <div key={col.id} className="flex-shrink-0 w-72 md:w-80 flex flex-col snap-center md:snap-start bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              
              {/* Header */}
              <div className="p-3 md:p-4 border-b bg-white dark:bg-slate-900 flex items-center justify-between" style={{ borderTopColor: col.color, borderTopWidth: 4 }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: col.color }} />
                  <h3 className="font-bold text-xs md:text-sm tracking-tight">{col.title}</h3>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md border text-slate-500 shadow-sm">
                  {boardData[col.id]?.length || 0}
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id} isDropDisabled={col.isLocked}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary/5' : ''
                    }`}
                  >
                    {boardData[col.id]?.map((query, index) => (
                      <Draggable key={query.id} draggableId={query.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              if (!isDragging) {
                                router.push(`/queries/${query.id}`);
                              }
                            }}
                            className={`bg-card p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20 rotate-1' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {query.queryCode}
                              </span>
                              {query.budget && (
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  ₹{query.budget.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            
                            <h4 className="font-semibold text-sm mb-1">{query.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <span className="truncate">{query.destination || 'TBD'}</span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t mt-auto">
                              <div className="flex items-center text-[10px] text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(query.createdAt), 'MMM d')}
                              </div>
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {query.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {boardData[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
                        Drop here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
