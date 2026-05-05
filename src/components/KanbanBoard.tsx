import { useState, useCallback } from 'react';
import {
  DndContext,
  useDroppable,
  useDraggable,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import type { Task, TaskStatus, TaskPriority, StatusConfig } from '../types/index';
import { TaskCard } from './TaskCard';
import { DoneEffect } from './DoneEffect';

interface KanbanBoardProps {
  tasks: Task[];
  statuses: StatusConfig[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  onAddSubTask: (parentId: string) => void;
  onAddStatus: (label: string) => void;
  onReorderStatuses: (sourceId: string, targetId: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

type SortKey = 'priority' | 'category' | 'dueDate' | 'startDate' | 'title' | 'manual';
type SortLevel = { key: SortKey; asc: boolean };

const PRIORITY_ORDER: Record<TaskPriority, number> = { 'high': 0, 'medium': 1, 'low': 2 };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'manual',    label: '⠿ Manual' },
  { key: 'priority',  label: 'Priority' },
  { key: 'category',  label: 'Category' },
  { key: 'dueDate',   label: 'Due Date' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'title',     label: 'Title' },
];

function compareByKey(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case 'manual':    return (a.manualOrder ?? Infinity) - (b.manualOrder ?? Infinity);
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
  col: StatusConfig;
  tasks: Task[];
  allTasks: Task[];
  statuses: StatusConfig[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  onAddSubTask: (parentId: string) => void;
  isCardDragOver: boolean;
  isColumnDragOver: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

function DroppableColumn({ col, tasks, allTasks, statuses, onEditTask, onStatusChange, onAddTask, onAddSubTask, isCardDragOver, isColumnDragOver, selectedIds, onToggleSelect }: DroppableColumnProps) {
  const { setNodeRef: setDropRef } = useDroppable({ id: col.id });

  const {
    attributes: handleAttrs,
    listeners: handleListeners,
    setNodeRef: setHandleRef,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: `col-handle:${col.id}`,
    data: { type: 'column', statusId: col.id },
  });

  return (
    <div
      ref={setDropRef}
      className="flex flex-col rounded-xl flex-1 min-w-[240px] transition-all"
      style={{
        background: isCardDragOver ? '#DFF5F0' : '#ECEEF1',
        minHeight: 0,
        outline: isCardDragOver
          ? '2px solid #00B5AD'
          : isColumnDragOver
            ? '2px dashed #00B5AD'
            : '2px solid transparent',
        opacity: isBeingDragged ? 0.45 : 1,
        transition: 'background 0.15s, outline 0.15s, opacity 0.15s',
      }}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            ref={setHandleRef}
            {...handleListeners}
            {...handleAttrs}
            className="flex items-center justify-center rounded cursor-grab shrink-0"
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 3px',
              color: '#C4C9D4',
              touchAction: 'none',
              fontSize: '14px',
              lineHeight: 1,
            }}
            title="Drag to reorder column"
            onClick={e => e.stopPropagation()}
          >
            ⠿
          </button>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
          <span className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>{col.label}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fff', color: '#6B7280' }}>
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {tasks.map(task => {
          const subTasks = allTasks.filter(t => t.parentId === task.id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              statuses={statuses}
              subTasks={subTasks}
              onClick={() => onEditTask(task)}
              onStatusChange={status => onStatusChange(task.id, status)}
              onAddSubTask={onAddSubTask}
              onEditSubTask={onEditTask}
              isSelected={selectedIds.has(task.id)}
              onToggleSelect={onToggleSelect}
            />
          );
        })}
        <button
          onClick={() => onAddTask(col.id)}
          className="w-full py-2 rounded-lg text-sm font-medium cursor-pointer mt-1"
          style={{ background: 'none', border: '1.5px dashed #C4C9D4', color: '#9CA3AF' }}
        >
          + Add task
        </button>
      </div>
    </div>
  );
}

function AddStatusButton({ onAdd }: { onAdd: (label: string) => void }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');

  function submit() {
    if (value.trim()) { onAdd(value.trim()); setValue(''); }
    setActive(false);
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex flex-col items-center justify-center rounded-xl cursor-pointer shrink-0"
        style={{
          minWidth: '48px',
          alignSelf: 'flex-start',
          padding: '10px 8px',
          background: 'none',
          border: '1.5px dashed #C4C9D4',
          color: '#9CA3AF',
          fontSize: '11px',
          gap: '4px',
        }}
        title="Add new status"
      >
        <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
        <span>Status</span>
      </button>
    );
  }

  return (
    <div
      className="flex flex-col rounded-xl shrink-0 p-3"
      style={{ minWidth: '180px', background: '#ECEEF1', border: '2px solid #00B5AD', alignSelf: 'flex-start' }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: '#1A2B4A' }}>New status name</p>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setActive(false); setValue(''); } }}
        placeholder="e.g. Review, Testing…"
        className="w-full rounded-lg px-2.5 py-1.5 text-sm mb-2"
        style={{ border: '1.5px solid #C4C9D4', outline: 'none', color: '#1A2B4A', background: '#fff', fontSize: '13px' }}
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          style={{ background: '#00B5AD', color: '#fff', border: 'none' }}
        >
          Add
        </button>
        <button
          onClick={() => { setActive(false); setValue(''); }}
          className="py-1.5 px-3 rounded-lg text-xs cursor-pointer"
          style={{ background: '#E5E7EB', color: '#6B7280', border: 'none' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, statuses, onEditTask, onStatusChange, onAddTask, onAddSubTask, onAddStatus, onReorderStatuses, selectedIds, onToggleSelect }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<StatusConfig | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showDoneEffect, setShowDoneEffect] = useState(false);
  const [sortLevels, setSortLevels] = useState<SortLevel[]>([{ key: 'priority', asc: true }]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);

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
    if (event.active.data.current?.type === 'column') {
      const col = statuses.find(s => s.id === event.active.data.current?.statusId);
      if (col) setActiveColumn(col);
    } else {
      const task = tasks.find(t => t.id === event.active.id);
      if (task) setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (event.active.data.current?.type === 'column') {
      // Show dashed outline on the target column
      setDragOverColumn(event.over ? String(event.over.id) : null);
    } else {
      // Card drag: show filled teal outline
      setDragOverColumn(event.over ? String(event.over.id) : null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const isColDrag = !!activeColumn;
    setActiveTask(null);
    setActiveColumn(null);
    setDragOverColumn(null);

    const { active, over } = event;
    if (!over) return;

    if (isColDrag) {
      const sourceId = active.data.current?.statusId as string;
      const targetId = String(over.id);
      if (sourceId && sourceId !== targetId) onReorderStatuses(sourceId, targetId);
      return;
    }

    const newStatus = String(over.id);
    const task = tasks.find(t => t.id === active.id);
    if (!task || task.status === newStatus) return;

    onStatusChange(String(active.id), newStatus);
    const targetStatus = statuses.find(s => s.id === newStatus);
    if (targetStatus?.label.toLowerCase() === 'done') setShowDoneEffect(true);
  }

  const hideDoneEffect = useCallback(() => setShowDoneEffect(false), []);

  function handleStatusChange(id: string, status: string) {
    onStatusChange(id, status);
    const targetStatus = statuses.find(s => s.id === status);
    if (targetStatus?.label.toLowerCase() === 'done') setShowDoneEffect(true);
  }

  const availableOpts = SORT_OPTIONS.filter(o => !sortLevels.find(l => l.key === o.key));
  const topLevelTasks = tasks.filter(t => !t.parentId);
  const isDraggingColumn = !!activeColumn;

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
          {sortedStatuses.map(col => (
            <DroppableColumn
              key={col.id}
              col={col}
              tasks={sortTasks(topLevelTasks.filter(t => t.status === col.id), sortLevels)}
              allTasks={tasks}
              statuses={statuses}
              onEditTask={onEditTask}
              onStatusChange={handleStatusChange}
              onAddTask={onAddTask}
              onAddSubTask={onAddSubTask}
              isCardDragOver={!isDraggingColumn && dragOverColumn === col.id}
              isColumnDragOver={isDraggingColumn && dragOverColumn === col.id}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}

          <AddStatusButton onAdd={onAddStatus} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div style={{ transform: 'rotate(2deg)', opacity: 0.9, pointerEvents: 'none' }}>
              <TaskCard
                task={activeTask}
                statuses={statuses}
                onClick={() => {}}
                onStatusChange={() => {}}
              />
            </div>
          )}
          {activeColumn && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg"
              style={{
                background: '#ECEEF1',
                border: '2px solid #00B5AD',
                opacity: 0.95,
                pointerEvents: 'none',
                minWidth: '160px',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: activeColumn.color }} />
              <span className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>{activeColumn.label}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showDoneEffect && <DoneEffect onComplete={hideDoneEffect} />}
    </>
  );
}
