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

type SortKey = 'title' | 'status' | 'priority' | 'category' | 'startDate' | 'dueDate';
type SortLevel = { key: SortKey; asc: boolean };

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
  { key: 'category',  label: 'Category' },
  { key: 'startDate', label: 'Start' },
  { key: 'dueDate',   label: 'Due' },
];

function compareByKey(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case 'title':     return a.title.localeCompare(b.title);
    case 'status':    return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case 'priority':  return PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium'];
    case 'category':  return (a.category ?? '').localeCompare(b.category ?? '');
    case 'startDate': return (a.startDate ?? '').localeCompare(b.startDate ?? '');
    case 'dueDate':
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
  }
}

export function ListView({ tasks, onEditTask, onStatusChange, selectedIds, onToggleSelect, onSelectAll }: ListViewProps) {
  const [sortLevels, setSortLevels] = useState<SortLevel[]>([{ key: 'dueDate', asc: true }]);

  function toggleLevelDir(idx: number) {
    setSortLevels(prev => prev.map((l, i) => i === idx ? { ...l, asc: !l.asc } : l));
  }

  function removeLevel(idx: number) {
    setSortLevels(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length > 0 ? next : [{ key: 'dueDate', asc: true }];
    });
  }

  function addLevel(key: SortKey) {
    if (sortLevels.find(l => l.key === key)) return;
    setSortLevels(prev => [...prev, { key, asc: true }]);
  }

  const sorted = [...tasks].sort((a, b) => {
    for (const { key, asc } of sortLevels) {
      const cmp = compareByKey(a, b, key);
      if (cmp !== 0) return asc ? cmp : -cmp;
    }
    return 0;
  });

  const allSelected = sorted.length > 0 && sorted.every(t => selectedIds.has(t.id));
  const availableCols = SORT_COLS.filter(c => !sortLevels.find(l => l.key === c.key));

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: '#9CA3AF' }}>
        <p className="text-sm">No tasks yet. Add one!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
      {/* Sort header */}
      <div className="flex items-center gap-1.5 flex-wrap px-1 pb-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => allSelected ? onSelectAll([]) : onSelectAll(sorted.map(t => t.id))}
          className="cursor-pointer shrink-0"
          style={{ accentColor: '#00B5AD', width: '14px', height: '14px', marginRight: '4px' }}
        />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Sort:</span>

        {sortLevels.map((level, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {i > 0 && <span className="text-xs mx-0.5" style={{ color: '#D1D5DB' }}>›</span>}
            <div className="flex items-center rounded overflow-hidden" style={{ border: '1px solid #C4C9D4' }}>
              <button
                onClick={() => toggleLevelDir(i)}
                className="px-2 py-0.5 text-xs font-medium cursor-pointer"
                style={{ background: '#E0F7F5', color: '#00B5AD', border: 'none' }}
              >
                {SORT_COLS.find(c => c.key === level.key)?.label} {level.asc ? '↑' : '↓'}
              </button>
              {sortLevels.length > 1 && (
                <button
                  onClick={() => removeLevel(i)}
                  className="px-1.5 py-0.5 text-xs cursor-pointer"
                  style={{ background: '#F3F4F6', color: '#9CA3AF', border: 'none', borderLeft: '1px solid #E5E7EB' }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        {availableCols.length > 0 && (
          <select
            value=""
            onChange={e => { if (e.target.value) addLevel(e.target.value as SortKey); }}
            style={{ padding: '2px 6px', borderRadius: '6px', border: '1px solid #C4C9D4', fontSize: '11px', color: '#9CA3AF', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">+ Add level</option>
            {availableCols.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        )}
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

            {/* Title + description + category */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1A2B4A' }}>{task.title}</p>
              {task.description && (
                <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>{task.description}</p>
              )}
              {task.category && (
                <span className="inline-block text-xs mt-0.5 px-1.5 py-0 rounded" style={{ background: '#EEF2FF', color: '#6366F1', fontSize: '10px' }}>
                  {task.category}
                </span>
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
