import { useState, useCallback } from 'react';
import {
  DndContext,
  useDroppable,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import type { Task, TaskStatus } from '../types/index';
import { TaskCard } from './TaskCard';
import { DoneEffect } from './DoneEffect';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'set',         label: 'Set',         color: '#6B7280' },
  { status: 'in-progress', label: 'In Progress',  color: '#D97706' },
  { status: 'done',        label: 'Done',         color: '#059669' },
];

interface DroppableColumnProps {
  col: typeof COLUMNS[number];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  isDragOver: boolean;
}

function DroppableColumn({ col, tasks, onEditTask, onStatusChange, onAddTask, isDragOver }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: col.status });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-xl flex-1 min-w-[240px] transition-colors"
      style={{
        background: isDragOver ? '#DFF5F0' : '#ECEEF1',
        minHeight: 0,
        outline: isDragOver ? '2px solid #00B5AD' : '2px solid transparent',
        transition: 'background 0.15s, outline 0.15s',
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
          <span className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>{col.label}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fff', color: '#6B7280' }}>
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onEditTask(task)}
            onStatusChange={status => onStatusChange(task.id, status)}
          />
        ))}
        <button
          onClick={() => onAddTask(col.status)}
          className="w-full py-2 rounded-lg text-sm font-medium cursor-pointer mt-1"
          style={{ background: 'none', border: '1.5px dashed #C4C9D4', color: '#9CA3AF' }}
        >
          + Add task
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onEditTask, onStatusChange, onAddTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [showDoneEffect, setShowDoneEffect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    setDragOverColumn(event.over ? (String(event.over.id) as TaskStatus) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setDragOverColumn(null);

    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === active.id);
    if (!task || task.status === newStatus) return;

    onStatusChange(String(active.id), newStatus);
    if (newStatus === 'done') setShowDoneEffect(true);
  }

  const hideDoneEffect = useCallback(() => setShowDoneEffect(false), []);

  // Also show effect when status buttons move a card to done
  function handleStatusChange(id: string, status: TaskStatus) {
    onStatusChange(id, status);
    if (status === 'done') setShowDoneEffect(true);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full">
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.status}
              col={col}
              tasks={tasks.filter(t => t.status === col.status)}
              onEditTask={onEditTask}
              onStatusChange={handleStatusChange}
              onAddTask={onAddTask}
              isDragOver={dragOverColumn === col.status}
            />
          ))}
        </div>

        {/* Floating drag preview */}
        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div style={{ transform: 'rotate(2deg)', opacity: 0.9, pointerEvents: 'none' }}>
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                onStatusChange={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showDoneEffect && <DoneEffect onComplete={hideDoneEffect} />}
    </>
  );
}
