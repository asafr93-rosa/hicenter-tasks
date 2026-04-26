import { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types/index';
import { formatDate, isOverdue } from '../utils/date';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

type SortKey = 'title' | 'status' | 'priority' | 'startDate' | 'dueDate';

const STATUS_SEQUENCE: TaskStatus[] = ['set', 'in-progress', 'done'];
const STATUS_ORDER: Record<TaskStatus, number> = { 'set': 0, 'in-progress': 1, 'done': 2 };

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  'set': { bg: '#F3F4F6', color: '#6B7280', label: 'Set' },
  'in-progress': { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
  'done': { bg: '#D1FAE5', color: '#059669', label: 'Done' },
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { 'high': 0, 'medium': 1, 'low': 2 };

const PRIORITY_STYLE: Record<TaskPriority, { bg: string; color: string; label: string }> = {
  'high':   { bg: '#FEE2E2', color: '#DC2626', label: 'High' },
  'medium': { bg: '#FEF3C7', color: '#D97706', label: 'Med' },
  'low':    { bg: '#F3F4F6', color: '#9CA3AF', label: 'Low' },
};

const SORT_COLS: { key: SortKey; label: string }[] = [
  { key: 'title',     label: 'Title' },
  { key: 'status',    label: 'Status' },
  { key: 'priority',  label: 'Priority' },
  { key: 'startDate', label: 'Start' },
  { key: 'dueDate',   label: 'Due' },
];

export function ListView({ tasks, onEditTask, onStatusChange, selectedIds, onToggleSelect, onSelectAll }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortKey === 'priority') cmp = PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium'];
    else if (sortKey === 'startDate') cmp = (a.startDate ?? '').localeCompare(b.startDate ?? '');
    else if (sortKey === 'dueDate') {
      if (!a.dueDate) cmp = 1;
      else if (!b.dueDate) cmp = -1;
      else cmp = a.dueDate.localeCompare(b.dueDate);
    }
    return sortAsc ? cmp : -cmp;
  });

  const allSelected = sorted.length > 0 && sorted.every(t => selectedIds.has(t.id));

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: '#9CA3AF' }}>
        <p className="text-sm">No tasks yet. Add one!</p>
      </div>
    );
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: '#D1D5DB' }}> ↕</span>;
    return <span style={{ color: '#00B5AD' }}>{sortAsc ? ' ↑' : ' ↓'}</span>;
  }

  return (
    <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
      {/* Sort header */}
      <div className="flex items-center gap-1 px-1 pb-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => allSelected ? onSelectAll([]) : onSelectAll(sorted.map(t => t.id))}
          className="cursor-pointer shrink-0"
          style={{ accentColor: '#00B5AD', width: '14px', height: '14px', marginRight: '6px' }}
        />
        <span className="text-xs mr-1" style={{ color: '#9CA3AF' }}>Sort:</span>
        {SORT_COLS.map(col => (
          <button
            key={col.key}
            onClick={() => toggleSort(col.key)}
            className="px-2 py-0.5 rounded text-xs cursor-pointer select-none"
            style={{
              background: sortKey === col.key ? '#E0F7F5' : 'transparent',
              color: sortKey === col.key ? '#00B5AD' : '#9CA3AF',
              border: 'none',
              fontWeight: sortKey === col.key ? 600 : 400,
            }}
          >
            {col.label}<SortIcon k={col.key} />
          </button>
        ))}
      </div>

      {sorted.map(task => {
        const overdue = isOverdue(task.dueDate, task.status);
        const st = STATUS_STYLE[task.status];
        const idx = STATUS_SEQUENCE.indexOf(task.status);
        const priority = task.priority ?? 'medium';
        const pt = PRIORITY_STYLE[priority];
        const selected = selectedIds.has(task.id);

        return (
          <div
            key={task.id}
            className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
            style={{
              border: selected ? '2px solid #00B5AD' : '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            onClick={() => onEditTask(task)}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={selected}
              onClick={e => e.stopPropagation()}
              onChange={e => { e.stopPropagation(); onToggleSelect(task.id); }}
              className="cursor-pointer shrink-0"
              style={{ accentColor: '#00B5AD', width: '14px', height: '14px' }}
            />

            {/* Overdue dot */}
            {overdue && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#DC2626' }} title="Overdue" />
            )}

            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1A2B4A' }}>{task.title}</p>
              {task.description && (
                <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>{task.description}</p>
              )}
            </div>

            {/* Priority badge */}
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded shrink-0 hidden sm:block"
              style={{ background: pt.bg, color: pt.color, fontSize: '10px' }}
            >
              {pt.label}
            </span>

            {/* Due date */}
            <span className="text-xs shrink-0 hidden sm:block" style={{ color: overdue ? '#DC2626' : '#9CA3AF', fontWeight: overdue ? 600 : 400 }}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
            </span>

            {/* Status badge (click to cycle) */}
            <button
              onClick={e => {
                e.stopPropagation();
                const next = STATUS_SEQUENCE[(idx + 1) % STATUS_SEQUENCE.length];
                onStatusChange(task.id, next);
              }}
              title="Click to advance status"
              className="px-2 py-1 rounded-full text-xs font-medium cursor-pointer shrink-0"
              style={{ background: st.bg, color: st.color, border: 'none' }}
            >
              {st.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
