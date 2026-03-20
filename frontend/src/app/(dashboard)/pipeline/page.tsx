'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '@/lib/api';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const PIPELINE_COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
  { id: 'followup', title: 'Follow Up', color: 'bg-amber-500' },
  { id: 'proposal_sent', title: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'ready_to_pay', title: 'Ready to Pay', color: 'bg-emerald-500' },
  // Lost / Invalid / Confirmed are terminal and usually not shown on active kanban, 
  // or shown separately. We will include 'confirmed' at the end.
  { id: 'confirmed', title: 'Confirmed (Won)', color: 'bg-green-600' },
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

  // Organize queries into columns when data arrives
  useEffect(() => {
    if (data) {
      const newBoard: BoardData = {
        new: [],
        followup: [],
        proposal_sent: [],
        ready_to_pay: [],
        confirmed: [],
      };

      data.forEach((q) => {
        if (newBoard[q.status]) {
          newBoard[q.status].push(q);
        }
      });

      setBoardData(newBoard);
    }
  }, [data]);

  // Status Check Helper
  const TRANSITIONS: Record<string, string[]> = {
    new:           ['followup', 'dnp', 'lost', 'invalid'],
    followup:      ['followup', 'dnp', 'proposal_sent', 'lost', 'invalid'],
    dnp:           ['followup', 'lost', 'invalid'],
    proposal_sent: ['followup', 'ready_to_pay', 'lost', 'invalid'],
    ready_to_pay:  ['confirmed', 'lost'],
    confirmed:     [],
    lost:          ['new'],
    invalid:       ['new'],
  };

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
      const allowed = TRANSITIONS[sourceStatus] || [];
      if (!allowed.includes(targetStatus)) {
        toast.error('Invalid Move', { description: `Cannot move lead from ${sourceStatus.replace('_', ' ')} to ${targetStatus.replace('_', ' ')} directly.` });
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
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6 flex-none">
        <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Drag and drop leads to update their status. Enforces transition rules automatically.
        </p>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 h-full min-h-0 snap-x">
          {PIPELINE_COLUMNS.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-80 flex flex-col snap-start bg-muted/40 rounded-xl border">
              
              {/* Header */}
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                </div>
                <div className="bg-background text-xs font-semibold px-2 py-0.5 rounded-md border text-muted-foreground shadow-sm">
                  {boardData[col.id]?.length || 0}
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
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
