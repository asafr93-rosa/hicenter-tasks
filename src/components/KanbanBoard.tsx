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
import type { Task, TaskStatus, TaskPriority } from '../types/index';
import { TaskCard } from './TaskCard';
import { DoneEffect } from './DoneEffect';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

type SortKey = 'priority' | 'category' | 'dueDate' | 'startDate' | 'title';
type SortLevel = { key: SortKey; asc: boolean };

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'set',         label: 'Set',         color: '#6B7280' },
  { status: 'in-progress', label: 'In Progress',  color: '#D97706' },
  { status: 'done',        label: 'Done',         color: '#059669' },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = { 'high': 0, 'medium': 1, 'low': 2 };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'priority',  label: 'Priority' },
  { key: 'category',  label: 'Category' },
  { key: 'dueDate',   label: 'Due Date' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'title',     label: 'Title' },
];

function compareByKey(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case 'priority':  return PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium'];
    case 'category':  return (a.category ?? '').localeCompare(b.category ?? '');
    case 'dueDate':
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    case 'startDate': return (a.startDate ?? '').localeCompare(b.startDate ?? '');
    case 'title':     return a.title.localeCompare(b.title);
  }
}

function sortTasks(tasks: Task[], levels: SortLevel[]): Task[] {
  return [...tasks].sort((a, b) => {
    for (const { key, asc } of levels) {
      const cmp = compareByKey(a, b, key);
      if (cmp !== 0) return asc ? cmp : -cmp;
    }
    return 0;
  });
}

interface DroppableColumnProps {
  col: typeof COLUMNS[number];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  isDragOver: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

function DroppableColumn({ col, tasks, onEditTask, onStatusChange, onAddTask, isDragOver, selectedIds, onToggleSelect }: DroppableColumnProps) {
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
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
          <span className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>{col.label}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fff', color: '#6B7280' }}>
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onEditTask(task)}
            onStatusChange={status => onStatusChange(task.id, status)}
            isSelected={selectedIds.has(task.id)}
            onToggleSelect={onToggleSelect}
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

export function KanbanBoard({ tasks, onEditTask, onStatusChange, onAddTask, selectedIds, onToggleSelect }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [showDoneEffect, setShowDoneEffect] = useState(false);
  const [sortLevels, setSortLevels] = useState<SortLevel[]>([{ key: 'priority', asc: true }]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function toggleLevelDir(idx: number) {
    setSortLevels(prev => prev.map((l, i) => i === idx ? { ...l, asc: !l.asc } : l));
  }

  function removeLevel(idx: number) {
    setSortLevels(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length > 0 ? next : [{ key: 'priority', asc: true }];
    });
  }

  function addLevel(key: SortKey) {
    if (sortLevels.find(l => l.key === key)) return;
    setSortLevels(prev => [...prev, { key, asc: true }]);
  }

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

  function handleStatusChange(id: string, status: TaskStatus) {
    onStatusChange(id, status);
    if (status === 'done') setShowDoneEffect(true);
  }

  const availableOpts = SORT_OPTIONS.filter(o => !sortLevels.find(l => l.key === o.key));

  return (
    <>
      {/* Sort bar */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Sort:</span>

        {sortLevels.map((level, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {i > 0 && <span className="text-xs mx-0.5" style={{ color: '#D1D5DB' }}>›</span>}
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #C4C9D4' }}>
              <button
                onClick={() => toggleLevelDir(i)}
                className="px-2.5 py-1 text-xs font-medium cursor-pointer"
                style={{ background: '#00B5AD', color: '#fff', border: 'none' }}
              >
                {SORT_OPTIONS.find(o => o.key === level.key)?.label} {level.asc ? '↑' : '↓'}
              </button>
              {sortLevels.length > 1 && (
                <button
                  onClick={() => removeLevel(i)}
                  className="px-1.5 py-1 text-xs cursor-pointer"
                  style={{ background: '#E5E7EB', color: '#9CA3AF', border: 'none', borderLeft: '1px solid #D1D5DB' }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        {availableOpts.length > 0 && (
          <select
            value=""
            onChange={e => { if (e.target.value) addLevel(e.target.value as SortKey); }}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #C4C9D4', fontSize: '11px', color: '#9CA3AF', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">+ Add level</option>
            {availableOpts.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        )}
      </div>

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
              tasks={sortTasks(tasks.filter(t => t.status === col.status), sortLevels)}
              onEditTask={onEditTask}
              onStatusChange={handleStatusChange}
              onAddTask={onAddTask}
              isDragOver={dragOverColumn === col.status}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>

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
